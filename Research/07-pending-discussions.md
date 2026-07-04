# Pending Scope Discussions

**Status:** All items resolved (2026-07-05)

---

## 1. Batch master APIs — ✅ Cut

**Decision:** **Cut batch entirely** for mobile v1.

- Mobile uses single-row Supabase `.insert()` / `.update()` / `.delete()` only
- Matches card + slide panel UX
- Bulk operations via Supabase Dashboard if ever needed

Recorded in [ADR-012](./decisions/ADR-012-scope-reduction.md).

---

## 2. Bill prev/next navigator — ✅ Deferred to v1.1

**Decision:** **Not in v1.** Navigate bills via list search/tap. Add prev/next chevrons in bill slide panel in **v1.1** if users need sequential review.

Implementation note (when built): query adjacent `bill_number` within active `financial_year_id`.

Recorded in [ADR-012](./decisions/ADR-012-scope-reduction.md).
