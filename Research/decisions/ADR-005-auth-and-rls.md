# ADR-005: Supabase Auth + RLS for Access Control

**Status:** Accepted  
**Date:** 2026-07-03

## Context

The base-app has two authorization layers:

1. **Menu access** — `app_role_menu` controls sidebar visibility
2. **Endpoint access** — `app_endpoint` + `app_role_endpoint` + `EndpointAccessFilter` middleware returns 403 on disallowed API calls

Roles: `admin`, `user`, `anon`.

With Supabase, authorization moves to the database via **Row Level Security (RLS)** and JWT claims.

## Decision

### Authentication

- Use **Supabase Auth** with email/password (matching current login UX)
- Create a `profiles` table: `id` (FK → `auth.users`), `role_id`, `display_name`, `is_active`
- Store role in `profiles.role_id` — **not** in `user_metadata` (user-editable, unsafe for RLS)
- Optionally mirror role in `app_metadata` via Edge Function on signup for JWT claims

### Authorization

- **Enable RLS on every table** in `public` schema
- **Authenticated policies:** users with valid session can CRUD business data (single-org app)
- **Admin-only policies:** `app_menu` admin, user management — check `profiles.role_id` = admin
- **Client navigation:** filter drawer menu items by role (query `app_role_menu` or hardcoded route map)
- **Drop endpoint registry** (`app_endpoint`, `app_role_endpoint`) — RLS is the enforcement layer

### Financial year scoping

- Replace `X-Financial-Year-Id` header with client-side `.eq('financial_year_id', selectedFyId)` on bill/load queries
- Store selected FY in app context (**MMKV** via Zustand persist)

## Consequences

### Positive

- Authorization enforced at database level — cannot bypass via direct API calls
- Simpler than maintaining 68 endpoint permission rows
- Supabase handles session refresh automatically

### Negative

- RLS policies must be carefully tested (silent failures on UPDATE without SELECT policy)
- Role changes may require JWT refresh to pick up new claims
- Must not use `user_metadata` for authorization decisions

### Neutral

- Menu table can remain for dynamic navigation if desired
- Admin user management moves to Supabase dashboard or a simple admin screen

## Security checklist (from Supabase best practices)

- [ ] RLS enabled on all public tables
- [ ] UPDATE policies include matching SELECT policies
- [ ] No `service_role` key in mobile app (anon/publishable key only)
- [ ] `security definer` functions in private schema if needed
- [ ] Views use `security_invoker = true` (Postgres 15+)

## Alternatives considered

| Alternative | Why not |
|-------------|---------|
| Keep custom JWT + .NET | Requires keeping .NET API |
| Endpoint registry in Edge Functions | Duplicates RLS; more code to maintain |
| No RLS (trust client) | Unacceptable security risk |
