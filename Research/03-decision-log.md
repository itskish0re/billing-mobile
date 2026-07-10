# Decision Log

Architecture decisions for the Billing Mobile project. Each accepted decision has a detailed ADR in [`decisions/`](./decisions/).

**Last updated:** 2026-07-04

---

## Summary

| ID | Decision | Status | Date |
|----|----------|--------|------|
| ADR-001 | Mobile-first with React Native | Accepted | 2026-07-03 |
| ADR-002 | Supabase as backend (replace .NET API) | Accepted | 2026-07-03 |
| ADR-003 | Expo for React Native toolchain | Accepted | 2026-07-03 |
| ADR-004 | Simplified UI metadata on mobile | Accepted | 2026-07-03 |
| ADR-005 | Supabase Auth + RLS for access control | Accepted | 2026-07-03 |
| ADR-006 | Shared TypeScript business logic package | Accepted | 2026-07-03 |
| ADR-007 | Bill memo / print via HTML + PDF | Proposed | 2026-07-03 |
| ADR-008 | Android-only v1, internal APK distribution | Accepted | 2026-07-04 |
| ADR-009 | Mobile-only v1 (no web client) | Accepted | 2026-07-04 |
| ADR-010 | Supabase free tier only + inactivity workarounds | Accepted | 2026-07-04 |
| ADR-011 | Expo UI only (`@expo/ui`) — no third-party UI kits | Accepted | 2026-07-04 |
| ADR-012 | Scope reduction — remove platform complexity | Accepted (refined) | 2026-07-04 |
| ADR-013 | Bottom tab navigation, cards, slide panels | Accepted | 2026-07-04 |
| ADR-014 | Auth, profile full name, offline gate | Accepted | 2026-07-04 |
| ADR-015 | Publishable API keys + JWT signing keys | Accepted | 2026-07-05 |

---

## Pending confirmation

_All resolved 2026-07-05._

| Topic | Decision |
|-------|----------|
| Batch master APIs | ✅ **Cut** — single-row only |
| Bill prev/next navigator | ✅ **Deferred to v1.1** |
| Local prefs storage | ✅ **MMKV** (not AsyncStorage); SecureStore for auth tokens |

---

## Resolved open questions (2026-07-04)

| Question | Answer |
|----------|--------|
| iOS, Android, or both? | **Android only** v1; Windows desktop future |
| Distribution? | **Internal APK** (sideload) |
| Keep web app? | **No** — mobile-only v1 |
| Supabase Pro? | **No** — free tier only with heartbeat + manual backups |
| UI library? | **Expo UI only** (`@expo/ui`) |
| Navigation? | **Bottom tabs** — Home, Transactions, Masters, Settings |
| FY master? | **Full CRUD** in Masters tab; active FY picker in Settings |
| Admin screens? | **None** — same app for admin + user |
| List UX? | **Cards** → slide panel → edit → snackbar |

---

## Rejected Alternatives

| Option | Reason rejected |
|--------|-----------------|
| Keep .NET API + React Native only | Still requires API hosting and maintenance |
| Capacitor / WebView wrapper | Poor native UX; doesn't meet mobile-first goal |
| PWA instead of native | Weak print/share; not chosen for v1 |
| Full metadata-driven UI port | High complexity, low ROI on small mobile screens |
| Firebase | Team chose Postgres/Supabase; schema already relational |
| React Native Paper / NativeWind | Client mandate: Expo UI only |
| Supabase Pro for pause/backups | Client mandate: free tier only |
| Play Store distribution v1 | Internal APK sufficient for &lt;10 users |

---

## Decision Template

When adding a new decision, create `decisions/ADR-NNN-short-title.md`:

```markdown
# ADR-NNN: Title

**Status:** Proposed | Accepted | Superseded  
**Date:** YYYY-MM-DD

## Context
...

## Decision
...

## Consequences
### Positive
...
### Negative
...
### Neutral
...
```

Then add a row to the summary table above.
