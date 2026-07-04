# ADR-012: Scope Reduction — Remove Complexity

**Status:** Accepted (refined 2026-07-04)  
**Date:** 2026-07-04

## Context

The base-app was built as an extensible platform (metadata-driven grids, endpoint registry, batch APIs, admin screens). For a mobile-only app with &lt;10 users on Supabase free tier, much of this infrastructure adds cost without user value.

The client refined what to cut, simplify, and keep — including navigation (bottom tabs), FY master CRUD, and list UX (cards + slide panel).

---

## Confirmed — remove entirely

| # | Feature | Status |
|---|---------|--------|
| 1 | UI metadata tables + screen API (`app_entity*`) | ✅ Cut |
| 2 | Endpoint permission registry (`app_endpoint*`) | ✅ Cut |
| 3 | Menu admin, **web** dashboard, web DataTable system | ✅ Cut |
| 5 | Entire .NET API (~68 endpoints) | ✅ Cut |
| 6 | Redux per-screen slices | ✅ Cut |

Also cut (same category):

- Gridify advanced filter DSL
- Dynamic column picker / column filters
- CQRS / MediatR / Swagger / .NET test port
- Custom JWT + Dapper refresh token table → Supabase Auth (ADR-014)
- Server-driven sidebar / drawer navigation → bottom tabs (ADR-013)

**Note:** Mobile **Home tab** is a **new** dashboard (greeting, stats, shortcuts) — not the old web placeholder.

---

## Pending discussion — resolved 2026-07-05

| # | Feature | Decision |
|---|---------|----------|
| 4a | Batch master APIs | ✅ **Cut** — single-row Supabase only |
| 4b | Bill prev/next navigator | ✅ **Deferred to v1.1** |

---

## Confirmed — simplify

| Item | Decision |
|------|----------|
| Navigation | ✅ **Bottom tab bar** (Home, Transactions, Masters, Settings) — no drawer v1 — ADR-013 |
| Master CRUD | ✅ **Single-record** insert/update/delete via Supabase client |
| Financial year | ✅ **Full master table + CRUD** in Masters tab; **active FY picker** in Settings (not seed-only) |
| Lists | ✅ **Card** per row (3–4 fields); tap → **slide panel from right**; **Edit** at top; **Snackbar** on save |
| Roles | ✅ **admin + user** only; **same screens** for both; admin creates bills too |
| Bill drafts | In-form state; warn on unsaved back |
| Lookups | Fixed Supabase query per entity (id, name, code) |
| Pagination | Load-more (~50 rows) |

---

## Confirmed — keep (core billing)

| Item | Status |
|------|--------|
| Login, FY scoping, all 7 masters, bills CRUD/cancel | ✅ |
| Bill math + validation (`billForm.ts` / Zod) | ✅ |
| Bill PDF print / WhatsApp share | ✅ |
| Indian formatters | ✅ |
| User **full name** on Home + Settings | ✅ ADR-014 |
| Internet check before app load | ✅ ADR-014 |
| Session with auto-refresh (1-day JWT) | ✅ ADR-014 |

---

## Defer to v1.1+

| Feature | Notes |
|---------|-------|
| Bill prev/next navigator | **v1.1** — confirmed deferred |
| Offline draft storage | Online-first v1 |
| In-app user admin | Supabase Dashboard |
| Drawer navigation | Bottom tabs sufficient |
| EAS Update OTA | After first APK |
| Windows desktop | Future ADR |

---

## Schema impact (Supabase)

**Do not create:**

- `app_entity*`, `app_endpoint*`, `app_menu*` (optional — navigation hardcoded)

**Create / keep:**

- All business masters including **`financial_year`**
- `bills`, `loads`, views `v_bills`, `v_loads`
- `app_role` (admin, user)
- `profiles` (`full_name`, `role_id`) → ADR-014
- RLS on all public tables

---

## API surface

| Base-app | Mobile v1 |
|----------|-----------|
| ~68 REST endpoints | Direct Supabase client + 1–2 Edge Functions (`save-bill`, optional `cancel-bill`) |
| Batch POST bodies | **Single row only** (batch cut) |
| `next-number` API | Supabase RPC `suggest_next_bill_number(fy_id)` for Home stat |

---

## Related ADRs

- [ADR-013 Mobile navigation & UX](./ADR-013-mobile-navigation-ux.md)
- [ADR-014 Auth, profile & connectivity](./ADR-014-auth-profile-connectivity.md)
- [07-pending-discussions.md](../07-pending-discussions.md)
