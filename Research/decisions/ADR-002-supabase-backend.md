# ADR-002: Supabase as Backend (Replace .NET API)

**Status:** Accepted  
**Date:** 2026-07-03

## Context

The base-app uses a .NET 10 Web API with Clean Architecture, MediatR, EF Core, custom JWT auth, and a database-driven endpoint permission system. This requires:

- Hosting a .NET runtime (Docker, VM, or cloud service)
- Separate deployment pipeline from the frontend
- Maintenance of ~68 REST endpoints, middleware, and migrations

For fewer than 10 users in a single organization, this operational overhead outweighs the benefits of a full custom API layer.

The database is already **PostgreSQL** (Neon), making migration to Supabase straightforward.

## Decision

Replace the .NET API with **Supabase** as the backend platform:

- **PostgreSQL** — migrate existing schema
- **Supabase Auth** — replace custom JWT + refresh token flow
- **Row Level Security (RLS)** — replace endpoint registry authorization
- **Edge Functions** — for transactional operations (bill save with load sync)
- **Postgres views** — retain `v_bills`, `v_loads` for list screens

The .NET codebase in `sample/base-app/billing/` is retained as reference for business logic and schema, not deployed.

## Consequences

### Positive

- No API server to host, patch, or scale
- Managed auth, connection pooling, and dashboard
- Free tier covers users, storage, and bandwidth comfortably
- Direct client-to-database queries reduce latency
- Single vendor for DB + auth + serverless functions

### Negative

- Must reimplement MediatR handlers as Edge Functions or SQL
- Gridify list/filter logic becomes Supabase query builder patterns
- Endpoint registry (`app_endpoint`, `app_role_endpoint`) must be replaced by RLS
- Team learns Supabase-specific patterns (RLS, Edge Functions)

### Neutral

- Schema and seed SQL from base-app are largely reusable
- Integration tests move from .NET to Edge Function + RLS policy tests

## Alternatives considered

| Alternative | Why not |
|-------------|---------|
| Keep .NET API, RN frontend only | Doesn't reduce deployment/maintenance burden |
| Firebase | Relational schema + existing Postgres investment favors Supabase |
| Self-hosted PostgREST | More ops than Supabase managed |
| PocketBase | Less mature ecosystem; team chose Supabase |

## Free tier notes

- 500 MB database, 50k MAU, 5 GB egress — sufficient for this app
- Projects pause after 1 week inactivity — mitigate with cron ping or Pro upgrade at go-live
- No automatic backups on free — schedule manual `pg_dump` or upgrade to Pro
