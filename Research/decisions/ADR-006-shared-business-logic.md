# ADR-006: Shared TypeScript Business Logic Package

**Status:** Accepted  
**Date:** 2026-07-03

## Context

The base-app frontend contains significant **pure TypeScript business logic** that is independent of React DOM:

- `lib/billForm.ts` — freight, commission, balance, total recalculation (~580 lines)
- `lib/billFormSchema.ts` — Zod validation mirroring server FluentValidation
- `types/entity/*`, `types/billForm.ts`, `types/billPreview.ts`
- Indian formatters (mobile, vehicle number, currency)

Duplicating this logic in the mobile app risks drift between client validation and future Edge Function validation.

## Decision

Create a **`packages/shared/`** workspace package containing:

| Module | Source |
|--------|--------|
| `billForm.ts` | Port from `billing-frontend/src/lib/billForm.ts` |
| `billFormSchema.ts` | Port from `billing-frontend/src/lib/billFormSchema.ts` |
| `types/*` | Port entity and form types |
| `formatters.ts` | Extract from column-cells formatters |
| `billPreview.ts` | Bill memo model builders |

Both the Expo app and Supabase Edge Functions (Deno) import from this package. Use a monorepo tool (npm workspaces or pnpm) at repo root.

## Consequences

### Positive

- Single source of truth for bill calculations and validation
- Reduces porting bugs in the highest-risk area (bill form)
- Edge Functions can validate with same Zod schemas as mobile client

### Negative

- Monorepo setup adds initial complexity
- Edge Functions (Deno) may need import map or bundled shared code

### Neutral

- Web base-app can optionally adopt shared package later (not required)

## Alternatives considered

| Alternative | Why not |
|-------------|---------|
| Copy-paste into mobile app | Drift risk on bill logic |
| Server-only validation | Poor UX without client-side recalculation |
| Port logic to Postgres functions | Harder to test; TS is already written |
