# Decision Log

Architecture decisions for the Billing Mobile project. Each accepted decision has a detailed ADR in [`decisions/`](./decisions/).

**Last updated:** 2026-07-03

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

---

## Rejected Alternatives

| Option | Reason rejected |
|--------|-----------------|
| Keep .NET API + React Native only | Still requires API hosting and maintenance |
| Capacitor / WebView wrapper | Poor native UX; doesn't meet mobile-first goal |
| PWA instead of native | Weak print/share on iOS; less app-like |
| Full metadata-driven UI port | High complexity, low ROI on small mobile screens |
| Firebase | Team chose Postgres/Supabase; schema already relational |

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
