# Billing Mobile — Research & Planning

Planning and architecture decisions for the Billing v3 mobile app: **Expo Android** + **Supabase free tier**.

**Reference:** [`sample/base-app/`](../sample/base-app/)

---

## Documents

| # | Document | Purpose |
|---|----------|---------|
| 1 | [Base App Analysis](./01-base-app-analysis.md) | Existing web/API codebase |
| 2 | [Architecture Brainstorm](./02-architecture-brainstorm.md) | Options & Supabase mapping |
| 3 | [Decision Log](./03-decision-log.md) | ADR index |
| 4 | [Implementation Roadmap](./04-implementation-roadmap.md) | Phased build plan |
| 5 | [Scope Reduction Summary](./05-scope-reduction-summary.md) | Cut / simplify / keep |
| 6 | [Package Selection](./06-package-selection.md) | Dependencies (Expo UI aligned) |
| 7 | [Pending Discussions](./07-pending-discussions.md) | Batch APIs, bill navigator |

### ADRs

| ADR | Title |
|-----|-------|
| [001](./decisions/ADR-001-mobile-first-react-native.md) | Mobile-first React Native |
| [002](./decisions/ADR-002-supabase-backend.md) | Supabase backend |
| [003](./decisions/ADR-003-expo-framework.md) | Expo toolchain |
| [004](./decisions/ADR-004-simplified-ui-metadata.md) | No UI metadata port |
| [005](./decisions/ADR-005-auth-and-rls.md) | Auth + RLS |
| [006](./decisions/ADR-006-shared-business-logic.md) | Shared TS package |
| [007](./decisions/ADR-007-bill-print-strategy.md) | Bill PDF (proposed) |
| [008](./decisions/ADR-008-android-only-internal-apk.md) | Android APK |
| [009](./decisions/ADR-009-mobile-only-no-web-v1.md) | Mobile-only v1 |
| [010](./decisions/ADR-010-supabase-free-tier-only.md) | Free tier + heartbeat |
| [011](./decisions/ADR-011-expo-ui-only.md) | Expo UI only |
| [012](./decisions/ADR-012-scope-reduction.md) | Scope reduction |
| [013](./decisions/ADR-013-mobile-navigation-ux.md) | Bottom tabs, cards, slide panels |
| [014](./decisions/ADR-014-auth-profile-connectivity.md) | Auth, full name, offline gate |
| [015](./decisions/ADR-015-supabase-api-keys-and-jwt-signing.md) | Publishable keys + JWT signing keys |

---

## Current direction (2026-07-04)

| Area | Decision |
|------|----------|
| Platform | Android APK |
| UI | `@expo/ui` + Jetpack Compose |
| Navigation | **4 bottom tabs** — no drawer |
| Lists | Cards → slide panel → edit → snackbar |
| FY | Master CRUD in Masters tab; active picker in Settings |
| Auth | Supabase, publishable key, JWT signing keys, 1-day session |
| Pending | ~~Batch APIs, bill prev/next~~ — **resolved** |
| Storage | **MMKV** prefs + **SecureStore** auth |

**Last updated:** 2026-07-05
