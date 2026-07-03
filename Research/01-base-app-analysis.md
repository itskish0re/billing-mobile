# Base App Analysis

Analysis of the existing Billing v3 application in `sample/base-app/` for React Native migration planning.

**Source:** `billing/` (.NET API), `billing-frontend/` (React SPA), `dbdiagram.dbml`, `BILLING-V3.md`

---

## 1. Business Domain

Billing v3 is a **single-organization freight/truck billing CRM** for the Indian transport industry.

### Core workflow

1. Maintain **master data**: name boards (truck owners), trucks, locations, parties, goods, units, financial years.
2. Create **bills** for truck freight: header (from location, truck, driver), up to **3 load lines** (consignor, consignee, goods, weight, rate, freight, advance, topay, balance).
3. Apply **charges**: commission (2%), crossing, hand loan, truck loan, office/tapal mamul, diesel, dynamic "others" (JSONB key-value pairs).
4. Record **payment**: UPI / cash / owner, with paid name and mobile for UPI.
5. View **loads** as a read-only list of load lines across bills.
6. **Print/share** bill memos matching physical bill layout (A4 HTML/CSS).

### Indian trucking terminology

| Term | Meaning in app |
|------|----------------|
| Name board | Truck owner / operator entity |
| Mamul | Office or postal charges |
| Topay | Amount to be collected on delivery |
| As per bill | Consignee same as bill header party |
| Commission | Default 2% of total freight |

---

## 2. Feature Inventory

### Screens (15 authenticated + login)

| Route | Menu code | Module | Status |
|-------|-----------|--------|--------|
| `/login` | — | Auth | Complete |
| `/main/dashboard` | `dashboard` | Dashboard | Placeholder |
| `/masters/name-board` | `name_board` | Name boards CRUD | Full |
| `/masters/truck` | `truck` | Trucks CRUD | Full |
| `/masters/location` | `location` | Locations CRUD | Full |
| `/masters/party` | `party` | Parties CRUD | Full |
| `/masters/goods` | `goods` | Goods CRUD | Full |
| `/masters/unit` | `unit` | Units CRUD | Full |
| `/masters/financial-year` | `financial_year` | Financial years CRUD | Full |
| `/transactions/bills` | `bills` | Bills list + expanded detail | Full |
| `/transactions/bill-create` | `bills_create` | Create bill | Full |
| `/transactions/bill-edit/$billId` | `bills_edit` | Edit bill | Full |
| `/transactions/loads` | `loads` | Load lines list | Read-only |
| `/admin/menu` | `menu` | Menu admin | Full |

Navigation is **server-driven** via `GET /api/access/navigation` (role-filtered sidebar tree).

### Mobile relevance (priority for RN)

| Priority | Features | Rationale |
|----------|----------|-----------|
| **P0** | Login, bills list, bill create/edit, bill preview/print | Daily field operations |
| **P1** | Masters (lookup-heavy: trucks, parties, locations, goods), financial year picker | Required for bill entry |
| **P2** | Loads list, bill cancel | Reporting / corrections |
| **P3** | Dashboard, menu admin | Low value on mobile |

---

## 3. Data Model

### Platform tables

```
app_role ──< app_user ──< refresh_token
app_role ──< app_role_menu >── app_menu
app_role ──< app_role_endpoint >── app_endpoint
```

### UI metadata registry

```
app_entity ──< app_entity_field
app_entity ──< app_entity_screen >── app_menu
app_entity_screen ──< app_entity_screen_column >── app_entity_field
app_entity_screen ──< app_entity_screen_field >── app_entity_field
```

This registry drives **metadata-driven grids and forms** on the web — a significant architectural choice.

### Business masters

| Table | Key fields | Relationships |
|-------|------------|---------------|
| `name_board` | name, code, owner_name, owner_phone | 1:N → truck |
| `truck` | truck_number (unique), name_board_id | N:1 → name_board |
| `location` | code, name | Bill `from_id`, load `to_id` |
| `party` | code, name | Load consignor/consignee |
| `goods` | code, name | Load goods |
| `unit` | code, name, is_fixed | Fixed unit → freight = rate; else freight = weight × rate |
| `financial_year` | code, name | Scopes bills and loads |

### Transactions

```
financial_year ──< bills ──< loads
```

**Bill fields:** bill_number, bill_date, from/truck/driver info, total_freight, commission, crossing, hand_loan, truck_loan, pay_by, paid_name/mobile, office_mamul, tapal_mamul, diesel, others (JSONB), total, is_cancelled.

**Load fields:** load_number (1–3), consignor/consignee, as_per_bill, to, goods, unit, weight_or_quantity, rate_per_unit, freight, advance, topay, balance.

All business tables include audit columns: `is_enabled`, `is_active`, `is_deleted`, `deleted_at`, `created_at`, `updated_at`, `created_by`, `updated_by`.

### SQL views

- `v_bills` — denormalized bill list (joins truck, name board, location)
- `v_loads` — denormalized load list

---

## 4. API Architecture (.NET)

| Aspect | Implementation |
|--------|----------------|
| Pattern | REST, ~68 endpoints, 15 controllers |
| CQRS | MediatR commands/queries |
| Validation | FluentValidation |
| Lists | Gridify (filter, orderBy, page, pageSize) |
| Auth | JWT Bearer + refresh token rotation (Dapper) |
| Authorization | DB-driven endpoint registry + `EndpointAccessFilter` |
| ORM | EF Core 10 + Npgsql (snake_case) |
| FY scoping | Header `X-Financial-Year-Id` on bills/loads APIs |

### Master entity REST pattern (all 7 masters)

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/{entity}` | Paginated list |
| GET | `/api/{entity}/{id}` | Get by ID |
| POST | `/api/{entity}/lookup` | Dropdown search |
| POST | `/api/{entity}/create` | Batch create |
| POST | `/api/{entity}/update` | Batch update |
| POST | `/api/{entity}/delete` | Batch soft-delete |
| POST | `/api/{entity}/toggle` | Batch enable/disable |

### Transaction endpoints

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/bills` | List |
| GET | `/api/bills/next-number` | Suggest next bill number |
| GET | `/api/bills/{id}` | Bill + loads |
| POST | `/api/bills/save` | Create/update + sync loads |
| POST | `/api/bills/cancel` | Cancel bill |
| GET | `/api/loads` | Load lines list |

### Screen metadata

`GET /api/screens/by-menu/{menuCode}` returns grid columns and form fields (camelCase) from `app_entity_screen*` tables.

---

## 5. Frontend Architecture (React)

### Stack

| Layer | Technology |
|-------|------------|
| UI | React 19, shadcn/ui, Tailwind 4 |
| Routing | TanStack Router (file-based) |
| Server state | TanStack Query |
| Client state | Redux Toolkit (per-screen slices) + Zustand (DataTable UI) |
| Forms | TanStack Form (login), Zod (bill form) |
| Tables | TanStack Table inside metadata-driven DataTable |
| HTTP | Axios with JWT refresh interceptor |

### Key patterns

1. **Metadata-driven masters** — Screen config from API drives columns, cell renderers, form fields.
2. **Custom bill form** — Not metadata-driven; 21 components, client-side recalculation in `lib/billForm.ts`, Zod validation in `lib/billFormSchema.ts`.
3. **Financial year context** — Stored in Redux + localStorage; sent as header on transaction APIs.
4. **Responsive web** — `useIsMobile()` at 768px hides non-important columns; not a native app.

### Reusable logic (high port value)

| File | Lines (approx) | Portability |
|------|----------------|-------------|
| `lib/billForm.ts` | ~580 | **High** — pure TypeScript |
| `lib/billFormSchema.ts` | ~200 | **High** — Zod schemas |
| `types/entity/*`, `types/billForm.ts` | — | **High** |
| `config/endpoints.ts` | — | **Low** — replace with Supabase client |
| `components/derived/data-table/*` | ~2000+ | **Low** — web-specific |
| `components/transactions/bill/*` | ~3000+ | **Medium** — rewrite UI, reuse logic |

---

## 6. Complex Business Logic to Preserve

### Bill form recalculation (`billForm.ts`)

- Freight = `ratePerUnit` if unit is fixed, else `weightOrQuantity × ratePerUnit`
- Balance = freight − advance − topay
- Commission = 2% of total freight (auto-calculated)
- Truck loan only allowed when no advances on load lines
- Total = sum of charges + dynamic "others" array
- Load sync: up to 3 lines, empty vs savable line detection

### Server-side save (`Save.cs`)

- Upsert loads by `loadId`, renumber lines, soft-deactivate removed loads
- Bill number suggestion (numeric or alphanumeric increment)
- FluentValidation mirrors client Zod rules

### Access control

- Role → menu visibility (sidebar)
- Role → endpoint permissions (API 403)
- Two layers must be replicated in Supabase RLS + client navigation

### Indian formatters

- Mobile: +91 XXX XXX XXXX
- Vehicle number: KA 01 AB 1234
- Currency: INR (₹)

---

## 7. Deployment & Maintenance (Current Stack)

| Component | Hosting / ops |
|-----------|---------------|
| PostgreSQL | Neon (cloud) |
| .NET API | Docker / self-hosted or cloud VM |
| React SPA | Static hosting (Vite build) |
| Auth | Custom JWT + refresh (app-managed) |
| Migrations | EF Core migrations |
| CI/CD | Build + deploy API + frontend separately |

**Pain points for &lt;10 users:**

- Two deployable artifacts (API + SPA) plus database
- .NET runtime hosting and updates
- Custom auth maintenance
- Endpoint registry adds indirection
- Metadata registry adds schema + seed complexity

---

## 8. Existing Mobile Considerations

**None.** The `billing-mobile` repo name reflects intent; only `sample/base-app` exists today.

Web-only mobile adaptations:

- `useIsMobile()` breakpoint at 768px
- DataTable `isImportant` column flag for narrow screens
- `pnpm tunnel` / ngrok for remote web testing

---

## 9. Migration Surface Summary

| Area | Effort | Notes |
|------|--------|-------|
| Auth + navigation | Medium | Replace JWT flow with Supabase Auth; simplify menu RBAC |
| Master CRUD (7 entities) | Medium | Simpler list/form UI; skip full DataTable parity |
| Bill list | Low–Medium | FlatList + search |
| Bill create/edit | **High** | Largest UI surface; reuse `billForm.ts` logic |
| Bill print/preview | Medium–High | HTML template → PDF or WebView |
| Loads list | Low | Read-only |
| UI metadata system | **Defer/simplify** | High indirection, low ROI on mobile |
| .NET API business logic | Medium | Move to Postgres functions, Edge Functions, or client |

**Estimated schema size for &lt;10 users:** Well under 50 MB for years of billing data — comfortably within Supabase free tier (500 MB database limit).
