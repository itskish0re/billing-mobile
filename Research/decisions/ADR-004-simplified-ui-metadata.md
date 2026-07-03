# ADR-004: Simplified UI Metadata on Mobile

**Status:** Accepted  
**Date:** 2026-07-03

## Context

The base-app frontend is **metadata-driven**: grid columns, cell renderers, form fields, and widths come from `app_entity_screen*` tables via `GET /api/screens/by-menu/{menuCode}`. This powers the shared `DataTable` and `EntityForm` components.

On web, this allows adding master screens with mostly SQL seeds and minimal React code. The DataTable module alone is ~2000+ lines with TanStack Table, Redux, Zustand, sticky columns, and percent-based width layout.

Mobile screens are fundamentally different:

- Lists use FlatList, not wide data grids
- Forms are vertical scroll sections, not multi-column layouts
- Column width percentages and pinned columns don't apply
- Screen space favors 3–4 key fields per list row, not 8+ columns

## Decision

**Do not port the metadata-driven DataTable/EntityForm system to mobile for v1.**

Instead:

1. **Hardcode mobile screen layouts** per master entity (list row fields, form fields)
2. **Keep `app_entity*` tables in the database** optionally for future admin tooling, but don't query them at runtime in the mobile app
3. **Reuse business rules** (validation, formatters) from shared package, not layout metadata
4. **Bill form stays custom** (as in base-app) — already not metadata-driven

If an admin needs to change column visibility later, add a v2 metadata layer or build a simple web admin.

## Consequences

### Positive

- Dramatically reduces mobile complexity and development time
- Each screen can be optimized for mobile UX (tap targets, swipe actions)
- No Redux per-screen slice injection pattern needed
- Faster iteration on layouts without SQL seed changes

### Negative

- Adding a new master entity requires React code, not just SQL seeds
- Layout changes require app release (or OTA via EAS Update)
- Divergence between web metadata approach and mobile hardcoded approach

### Neutral

- Acceptable for &lt;10 users and a stable master set (7 entities)
- Metadata tables can remain in schema for documentation parity

## Alternatives considered

| Alternative | Why not |
|-------------|---------|
| Full metadata port | High effort, poor fit for mobile list UX |
| Generate RN screens from metadata | Over-engineered for 7 masters + bills |
| Shared JSON config (not DB) | Possible v2; unnecessary for MVP |
