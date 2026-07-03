# Architecture Brainstorm

Options, trade-offs, and recommendations for moving from React + .NET Core to React Native + Supabase.

---

## 1. Problem Statement

The existing Billing v3 stack (React SPA + .NET 10 API + PostgreSQL) is well-architected but **over-provisioned** for:

- A single organization
- Fewer than 10 users
- Mobile-first usage (field billing, not desktop admin)

Primary goals:

1. **Minimize ops** — no API server to host, patch, and monitor
2. **Mobile-first UX** — native navigation, offline-tolerant where practical, print/share bills
3. **Preserve business logic** — bill calculations, validation, Indian formatting
4. **Stay on free/low cost** — Supabase free tier initially

---

## 2. Architecture Options Compared

### Option A: React Native + Keep .NET API

```
┌─────────────┐     REST/JWT      ┌──────────────┐     ┌────────────┐
│ React Native│ ────────────────► │ .NET Web API │ ──► │ PostgreSQL │
│   (Expo)    │                   │  (hosted)    │     │   (Neon)   │
└─────────────┘                   └──────────────┘     └────────────┘
```

| Pros | Cons |
|------|------|
| Reuse entire API as-is (~68 endpoints) | Still deploy and maintain .NET server |
| No data migration | Two hosting bills (API + DB) |
| Metadata endpoints still work | Mobile must handle endpoint RBAC |
| Lowest backend rewrite risk | Doesn't solve maintenance concern |

**Verdict:** Good if API is already in production and hosted. **Does not align** with stated goal of reducing deployment effort.

---

### Option B: React Native + Supabase (BaaS) — **Recommended**

```
┌─────────────┐   supabase-js    ┌────────────────────────────────────┐
│ React Native│ ───────────────► │ Supabase                           │
│   (Expo)    │                  │  • Postgres + RLS                  │
└─────────────┘                  │  • Auth (email/password)           │
                                 │  • Edge Functions (complex saves)  │
                                 │  • Storage (optional exports)      │
                                 └────────────────────────────────────┘
```

| Pros | Cons |
|------|------|
| Single managed backend | Must port .NET logic to SQL/Edge Functions/client |
| Built-in auth + RLS | Endpoint registry pattern doesn't map 1:1 |
| No API server hosting | Gridify-style list APIs need reimplementation |
| Free tier sufficient for &lt;10 users | 1-week inactivity pause on free tier |
| Postgres — schema largely portable | Metadata-driven UI less valuable on mobile |

**Verdict:** **Best fit** for small user base and low-ops goal.

---

### Option C: React Native WebView wrapper around existing SPA

| Pros | Cons |
|------|------|
| Fastest to ship | Poor native UX, print/share awkward |
| Zero rewrite | Doesn't feel like a mobile app |
| | Performance and offline limitations |

**Verdict:** **Rejected** — mobile experience is a stated priority.

---

### Option D: PWA (Progressive Web App) instead of React Native

| Pros | Cons |
|------|------|
| Reuse React codebase | Weaker print integration on iOS |
| No app store | Less "app-like" for non-technical users |
| | Camera, share sheet, background sync limited |

**Verdict:** **Rejected** for now — client wants mobile functionality; RN gives better print/share and app distribution.

---

## 3. Supabase Free Tier Fit

For &lt;10 users in a single-org billing app:

| Resource | Free limit | Expected usage |
|----------|------------|----------------|
| MAU (Auth) | 50,000 | &lt; 10 |
| Database size | 500 MB | &lt; 50 MB for years of bills |
| Egress | 5 GB/month | Low (small lists, occasional sync) |
| File storage | 1 GB | Optional bill PDF archive |
| API requests | Unlimited | Fine |
| Backups | None | **Risk** — export strategy needed |
| Inactivity pause | After 1 week | **Risk** — cron ping or accept manual wake |

**Conclusion:** Free tier is **more than adequate** for data and users. Watch **inactivity pause** and **no backups** — mitigations below.

### Free tier mitigations

| Risk | Mitigation |
|------|------------|
| Project pause after 1 week idle | Weekly Supabase cron (`pg_cron`) or external ping; or upgrade to Pro ($25/mo) when live |
| No point-in-time recovery | Periodic `pg_dump` via GitHub Action or manual export |
| 500 MB database cap | Soft-delete already in schema; archive old FY if ever needed |

---

## 4. Mapping .NET Patterns to Supabase

### Auth

| .NET today | Supabase approach |
|------------|-------------------|
| `app_user` + BCrypt + JWT | Supabase Auth (`auth.users`) |
| `refresh_token` table | Supabase session refresh (built-in) |
| Custom login endpoint | `supabase.auth.signInWithPassword` |

Keep `app_role` and link via `profiles` table with `role_id` in `app_metadata` (not `user_metadata` — user-editable).

### Authorization

| .NET today | Supabase approach |
|------------|-------------------|
| `app_endpoint` + `app_role_endpoint` | **RLS policies** on tables + optional `app_role_menu` for UI |
| `EndpointAccessFilter` middleware | Postgres RLS + client hides menus |

Simplify: with &lt;10 users and 2 roles (admin/user), RLS can be straightforward — authenticated users read/write business data; admin-only tables (menu config) restricted by role claim.

### List/filter/sort (Gridify)

| .NET today | Supabase approach |
|------------|-------------------|
| Gridify query params | `.from('v_bills').select().eq().order().range()` |
| Global search | `.or()` / `ilike` filters |
| `v_bills`, `v_loads` views | Create same views in Supabase migrations |

### Bill save (complex)

| .NET today | Supabase approach |
|------------|-------------------|
| `SaveBillCommand` + `SyncLoadsAsync` | **Edge Function** `save-bill` or Postgres function with transaction |
| FluentValidation | Zod in Edge Function + client (reuse `billFormSchema.ts`) |

**Recommendation:** Edge Function for bill save — keeps transaction integrity and mirrors server validation.

### Screen metadata

| .NET today | Supabase approach |
|------------|-------------------|
| `GET /api/screens/by-menu/{menuCode}` | Keep tables OR hardcode mobile layouts |

**Recommendation:** **Hardcode mobile screens** for masters; keep metadata tables only if admin UI for column config is needed later. See ADR-004.

---

## 5. React Native Stack Brainstorm

### Framework: Expo vs bare React Native

| Factor | Expo | Bare RN |
|--------|------|---------|
| Setup speed | Fast | Slower |
| OTA updates | EAS Update | Manual |
| Print/PDF | `expo-print` | Native modules |
| Supabase | Official guide + `@supabase/supabase-js` | Same |
| Build | EAS Build | Xcode/Android Studio |

**Recommendation:** **Expo** (managed workflow with dev client if needed).

### Navigation

| Web today | Mobile |
|-----------|--------|
| TanStack Router + sidebar | React Navigation: Drawer (menu) + Stack (screens) |
| Server-driven menu | Fetch menu config or static route map filtered by role |

### UI library

| Option | Notes |
|--------|-------|
| **React Native Paper** | Material Design, good forms |
| **NativeWind** (Tailwind) | Familiar if coming from web Tailwind |
| **gluestack-ui** | shadcn-like for RN |

**Recommendation:** **NativeWind + custom components** — team already uses Tailwind; or **React Native Paper** for faster forms out of the box. Decide at project init.

### State management

| Web today | Mobile recommendation |
|-----------|----------------------|
| Redux Toolkit (per-screen) | **Zustand** (simpler) or TanStack Query only |
| TanStack Query | **Keep** — works great with Supabase |
| Zustand (DataTable) | Not needed if lists are simpler |

### Offline

For v1: **online-first** with optimistic UI optional later.

Bill entry in areas with poor connectivity could use AsyncStorage drafts (similar to existing `billFormDraftSlice`). Not required for MVP.

---

## 6. What to Port vs Rewrite

### Port (extract to `packages/shared/`)

- `billForm.ts` — recalculation logic
- `billFormSchema.ts` — Zod validation
- `types/entity/*`, `types/billForm.ts`, `types/billPreview.ts`
- Indian formatters (mobile, vehicle, currency)
- Bill memo HTML template (for PDF generation)

### Rewrite for mobile

- All UI components
- DataTable → FlatList / SectionList with pull-to-refresh
- EntityForm → screen-specific forms with lookup pickers (modal search)
- Auth flow → Supabase Auth screens
- Navigation shell

### Reimplement on Supabase

- EF migrations → Supabase SQL migrations
- MediatR handlers → RLS + Edge Functions where transactional
- Gridify lists → Supabase query builder
- JWT middleware → Supabase client session

---

## 7. Schema Migration Strategy

The existing PostgreSQL schema (`dbdiagram.dbml` + EF migrations) is **largely portable**:

1. Export schema from Neon / EF migrations as SQL
2. Adapt auth tables: replace `app_user`/`refresh_token` with Supabase `auth.users` + `profiles`
3. Keep business tables (`name_board`, `truck`, `bills`, `loads`, etc.)
4. Keep or simplify `app_menu`, `app_role` for navigation
5. Drop or archive `app_endpoint`, `app_role_endpoint` if RLS replaces them
6. Recreate `v_bills`, `v_loads` views
7. Enable RLS on all `public` tables
8. Seed roles, menus, master data

`app_entity*` metadata tables: **optional for v1** — can seed later if dynamic admin UI is needed.

---

## 8. Open Questions

| # | Question | Lean | Notes |
|---|----------|------|-------|
| 1 | iOS, Android, or both? | Both via Expo | Confirm with client |
| 2 | App store distribution or internal APK/TestFlight? | Internal first | Faster iteration |
| 3 | Keep web app for admin/desktop? | Defer | Mobile-first; web can remain in sample/ |
| 4 | Multi-tenant in future? | No | Single org; simplifies RLS |
| 5 | Offline bill drafts? | v2 | Online-first for MVP |
| 6 | Upgrade to Supabase Pro when? | When going production | $25/mo removes pause, adds backups |

---

## 9. Recommendation Summary

| Decision | Choice |
|----------|--------|
| Mobile framework | React Native with **Expo** |
| Backend | **Supabase** (replace .NET API) |
| Database | **PostgreSQL** (migrate schema from base-app) |
| Auth | **Supabase Auth** + profiles + RLS |
| UI metadata | **Simplify** — hardcode mobile layouts |
| Bill logic | **Shared TS package** from base-app frontend |
| Bill save | **Edge Function** with transaction |
| MVP scope | Auth → FY picker → masters (lookup) → bills CRUD → print |

See [Decision Log](./03-decision-log.md) and individual ADRs in [`decisions/`](./decisions/).
