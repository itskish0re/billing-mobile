# Billing Mobile — Research & Planning

Planning and architecture decisions for migrating the Billing v3 application from a React + .NET Core client-server stack to a **React Native mobile app** backed by **Supabase** (free tier).

**Reference implementation:** [`sample/base-app/`](../sample/base-app/)  
**Original blueprint:** [`sample/base-app/BILLING-V3.md`](../sample/base-app/BILLING-V3.md)

---

## Documents

| # | Document | Purpose |
|---|----------|---------|
| 1 | [Base App Analysis](./01-base-app-analysis.md) | What exists today — domain, features, data model, API, frontend patterns |
| 2 | [Architecture Brainstorm](./02-architecture-brainstorm.md) | Options compared, trade-offs, Supabase free-tier fit, open questions |
| 3 | [Decision Log](./03-decision-log.md) | Summary of accepted decisions with status and links to ADRs |
| 4 | [Implementation Roadmap](./04-implementation-roadmap.md) | Phased build plan for React Native + Supabase |

### Architecture Decision Records (ADRs)

| ADR | Title | Status |
|-----|-------|--------|
| [ADR-001](./decisions/ADR-001-mobile-first-react-native.md) | Mobile-first with React Native | **Accepted** |
| [ADR-002](./decisions/ADR-002-supabase-backend.md) | Supabase as backend (replace .NET API) | **Accepted** |
| [ADR-003](./decisions/ADR-003-expo-framework.md) | Expo for React Native toolchain | **Accepted** |
| [ADR-004](./decisions/ADR-004-simplified-ui-metadata.md) | Simplified UI metadata on mobile | **Accepted** |
| [ADR-005](./decisions/ADR-005-auth-and-rls.md) | Supabase Auth + RLS for access control | **Accepted** |
| [ADR-006](./decisions/ADR-006-shared-business-logic.md) | Shared TypeScript business logic package | **Accepted** |
| [ADR-007](./decisions/ADR-007-bill-print-strategy.md) | Bill memo / print via HTML + PDF | **Proposed** |

---

## Context

| Factor | Detail |
|--------|--------|
| User base | &lt; 10 users (single organization) |
| Priority | Mobile functionality over desktop |
| Current stack | React 19 + Vite SPA, .NET 10 Web API, PostgreSQL (Neon) |
| Target stack | React Native (Expo) + Supabase (Postgres, Auth, Edge Functions) |
| Motivation | Lower deployment and maintenance overhead for a small user base |

---

## How to use this folder

1. Read **01-base-app-analysis** to understand what must be ported.
2. Read **02-architecture-brainstorm** for options and rationale.
3. Check **03-decision-log** for the current agreed direction.
4. Use **04-implementation-roadmap** when starting implementation.
5. Add new decisions as `decisions/ADR-NNN-short-title.md` and update the decision log.

**Last updated:** 2026-07-03
