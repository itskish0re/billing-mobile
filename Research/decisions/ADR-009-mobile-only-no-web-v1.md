# ADR-009: Mobile-Only v1 (No Web Client)

**Status:** Accepted  
**Date:** 2026-07-04

## Context

The base-app includes a full React web SPA with desktop-oriented DataTable grids and sidebar navigation. The client confirmed:

- **Mobile only** for production v1
- **Windows desktop** may come later as a separate track
- No need to maintain or deploy the web SPA alongside the mobile app

## Decision

1. **Do not deploy** `sample/base-app/billing-frontend/` as a production client
2. Keep `sample/base-app/` as **read-only reference** for business logic, schema, and UX patterns
3. **Single production client:** Expo Android app in this repo
4. **Admin tasks** (user creation, rare config) via **Supabase Dashboard** until a Windows/desktop client exists
5. **No responsive web fallback** — users install the APK

## Consequences

### Positive

- One client to build, test, and distribute
- No static hosting or web deployment pipeline
- Focus all UX effort on mobile field workflows

### Negative

- Bulk data entry on a large screen is unavailable until Windows/desktop v2
- Admin must use Supabase Dashboard for user/role management

### Neutral

- Shared TypeScript business logic (`packages/shared/`) can later power a Windows/web client without rewriting calculations
