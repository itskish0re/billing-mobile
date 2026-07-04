# ADR-013: Mobile Navigation & Screen UX

**Status:** Accepted  
**Date:** 2026-07-04

## Context

Earlier planning assumed a **drawer + hardcoded routes**. The client refined navigation to **bottom tab bar** with Compose-style tab rows and pagers inside tabs. Lists use **cards**; detail/edit uses a **right-sliding panel** (not expanded web rows).

Old web **dashboard placeholder** and **drawer** are removed; the mobile **Home tab** is a new, purposeful dashboard (greeting + stats + shortcuts).

## Decision

### Shell: bottom tab navigation (no drawer in v1)

Four bottom tabs — hardcoded, not DB-driven:

| Tab | Icon (Material) | Purpose |
|-----|-----------------|---------|
| **Home** | home | Greeting, stats, shortcut cards |
| **Transactions** | receipt / swap_horiz | Bills + Loads (sub-tabs) |
| **Masters** | inventory | All master tables (sub-tabs) |
| **Settings** | settings | Theme, active FY picker, user info |

Use **Expo Router tabs** (`app/(tabs)/`) or **React Navigation bottom tabs** wrapping Expo UI `Host` screens. No drawer navigator in v1.

---

### Tab 1 — Home

| Element | Behaviour |
|---------|-----------|
| **Greeting** | `"Good morning, {fullName}"` from `profiles.full_name` |
| **Stats card(s)** | At minimum: **suggested next bill number** for active financial year (same logic as base-app `GET /api/bills/next-number` → Supabase RPC or query) |
| **Optional stats** | Bill count this FY, cancelled count — only if cheap to query |
| **Shortcut cards** | Card-style tappable rows/buttons → navigate to Transactions (Bills/Loads) or relevant master |

Layout: Expo UI `Column` + `ScrollView` + card containers (`Column` with surface styling / Compose `Card` via `@expo/ui/jetpack-compose`).

---

### Tab 2 — Transactions

Use **`ScrollableTabRow` + `HorizontalPager`** from `@expo/ui/jetpack-compose` (per [Expo UI Jetpack Compose docs](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/)).

| Sub-tab | Content |
|---------|---------|
| **Bills** | Card list → slide panel (see List pattern below) |
| **Loads** | Card list (read-only) → slide panel detail |

FAB or header **Add** button on Bills sub-tab → open bill form slide panel in create mode.

---

### Tab 3 — Masters

**`ScrollableTabRow` + tab content** (pager optional; can swap content on tab select without pager if simpler).

| Sub-tab | Entity |
|---------|--------|
| 1 | Name boards |
| 2 | Trucks |
| 3 | Locations |
| 4 | Parties |
| 5 | Goods |
| 6 | Units |
| 7 | **Financial years** |

Each sub-tab: searchable **card list** + **Add** → same slide-panel pattern.

**Financial year:** full master CRUD here (not SQL-seed-only). Settings tab holds the **active FY picker** only (see below).

---

### Tab 4 — Settings

| Control | Behaviour |
|---------|-----------|
| **User full name** | Display (from `profiles.full_name`); edit profile deferred |
| **Active financial year** | Picker / dropdown — sets global FY context for bills, loads, next-number stat |
| **Theme toggle** | Light / dark / system — persisted in **MMKV**; applied via Expo UI / Compose theme |

No admin-only settings in v1 (admin uses same app + Supabase Dashboard for user management).

---

### List + detail pattern (all lists)

Applies to masters, bills, and loads.

```
┌─────────────────────────┐
│  Card (3–4 key fields)  │  ← list
└─────────────────────────┘
         │ tap
         ▼
┌─────────────────────────┐
│ ← Slide panel from right│
│  [Edit] button (top)    │
│  Form fields (read-only │  ← default view
│   until Edit tapped)    │
│  [Save] when editing    │
└─────────────────────────┘
         │ save success
         ▼
    Snackbar confirmation
```

| State | UI |
|-------|-----|
| View | Panel slides in from right; fields read-only |
| Edit | Top **Edit** button enables fields (or opens same form in edit mode) |
| Save | Supabase insert/update (or Edge Function for bills) |
| Success | **Snackbar** (Compose `Snackbar` / Expo UI equivalent) + close or refresh list |
| Cancel bill | Action on bill panel (not delete) |

Implementation options (pick one at build time):

1. **Nested stack** with `animation: 'slide_from_right'` (React Navigation / Expo Router stack inside tab)
2. **Jetpack Compose modal** full-height panel from `@expo/ui/jetpack-compose`

Bill form reuses the same panel layout as bill view/edit (largest form surface).

---

### Roles

**admin** and **user** share the same screens and tabs. Admin can create bills like any user. No separate admin tab in v1.

---

## Consequences

### Positive

- Bottom tabs match Android Material patterns and field-use ergonomics
- Home tab replaces useless web dashboard with actionable shortcuts + next bill number
- Compose TabRow + Pager gives native feel within Expo UI constraint
- Card + slide panel avoids porting web DataTable expanded rows

### Negative

- Seven master sub-tabs + seven entities = busy tab row (ScrollableTabRow mitigates)
- Slide panel + full bill form is still high UI effort
- Snackbar / slide animation APIs need verification against current `@expo/ui/jetpack-compose` exports

### Neutral

- Drawer can be added later without changing tab structure
- Bill prev/next navigator **deferred to v1.1** (confirmed 2026-07-05)

## References

- [ADR-011 Expo UI only](./ADR-011-expo-ui-only.md)
- [Expo UI Jetpack Compose](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/)
