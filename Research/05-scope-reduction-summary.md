# Scope Reduction Summary

Refined scope for mobile v1 — aligned with ADR-012, ADR-013, ADR-014.

**Last updated:** 2026-07-05

---

## Cut entirely ✅

| Item | Status |
|------|--------|
| UI metadata tables (`app_entity*`) | ✅ |
| Endpoint permission registry (`app_endpoint*`) | ✅ |
| Menu admin, **web** dashboard, web DataTable | ✅ |
| **Batch master APIs** | ✅ Cut (2026-07-05) |
| Entire .NET API | ✅ |
| Redux per-screen slices | ✅ |

## Deferred to v1.1 ✅

| Item | Status |
|------|--------|
| **Bill prev/next navigator** | ✅ Deferred (2026-07-05) |

---

## Simplify ✅

| Area | v1 approach |
|------|-------------|
| Navigation | **Bottom tabs:** Home · Transactions · Masters · Settings |
| Transactions tab | ScrollableTabRow + HorizontalPager → Bills \| Loads |
| Masters tab | ScrollableTabRow → 7 master sub-tabs incl. **financial year CRUD** |
| Settings tab | Theme toggle + **active FY picker** + user full name |
| Master CRUD | **Single-row** only; card → slide panel → edit → snackbar |
| Local prefs | **MMKV** (theme, active FY); **SecureStore** for auth tokens |
| Roles | admin + user, **same screens** |
| Home tab | Greeting, next bill #, shortcut cards |

---

## Keep ✅

```
✅ Login + Supabase session (1-day JWT, auto-refresh)
✅ Internet gate on launch (alert + Close)
✅ profiles.full_name on Home & Settings
✅ FY scoping + financial_year master table
✅ All 7 masters + bills CRUD/cancel
✅ Bill math + validation (shared package)
✅ Bill PDF + WhatsApp share
✅ Indian formatters
```

---

## Packages (storage)

| Data | Package |
|------|---------|
| Auth session tokens | `expo-secure-store` |
| Theme, active FY, prefs | `react-native-mmkv` |

Full list: [06-package-selection.md](./06-package-selection.md)
