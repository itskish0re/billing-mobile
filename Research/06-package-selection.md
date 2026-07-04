# Package Selection

Recommended packages for the Billing Mobile app — aligned with **Expo UI only** (ADR-011), **Supabase** (ADR-002), and **Android v1** (ADR-008).

**Last updated:** 2026-07-05

---

## Principles

1. **UI:** `@expo/ui` + `@expo/ui/jetpack-compose` only — no Paper, NativeWind, etc.
2. **Data:** `@supabase/supabase-js` — no Axios/fetch wrapper layer unless needed for Edge Functions
3. **Minimal deps** — every package must earn its place
4. **Expo SDK 56** — all versions pinned via `npx expo install`

---

## Required packages

### Core (from Expo template)

| Package | Purpose |
|---------|---------|
| `expo` | SDK 56 runtime |
| `react` / `react-native` | RN core |
| `@expo/ui` | Universal UI (`Host`, `Column`, `Text`, `Button`, `TextInput`, …) |
| `@expo/ui/jetpack-compose` | `ScrollableTabRow`, `HorizontalPager`, `Card`, `Snackbar`, Material components |
| `typescript` | Type safety |

### Navigation

| Package | Purpose | Notes |
|---------|---------|-------|
| `expo-router` | File-based routing, **bottom tabs**, nested stacks | **Recommended** — fits Expo ecosystem |
| `react-native-screens` | Native screen containers | Peer of navigation |
| `react-native-safe-area-context` | Safe areas for tab bar / status bar | Required |

**Tab structure (expo-router):**

```
app/
  _layout.tsx          # Root: auth gate, NetInfo, Supabase provider
  login.tsx
  (tabs)/
    _layout.tsx        # Bottom tabs: Home | Transactions | Masters | Settings
    index.tsx          # Home
    transactions.tsx   # TabRow + Pager: Bills | Loads
    masters.tsx        # ScrollableTabRow: 7 masters
    settings.tsx
  bill-form.tsx        # Optional: full-screen stack for large bill form
```

Alternative: `@react-navigation/native` + `@react-navigation/bottom-tabs` + `@react-navigation/native-stack` — equivalent; use if not adopting Expo Router.

**Slide-from-right panel:** nested `(stack)` inside each tab with `animation: 'slide_from_right'` — navigation is allowed outside Expo UI (ADR-011).

### Backend & auth

| Package | Purpose |
|---------|---------|
| `@supabase/supabase-js` | Database, auth, Edge Function invoke |
| `expo-secure-store` | Persist Supabase **session tokens** securely |
| `react-native-mmkv` | Fast key-value storage: theme, active FY id, app prefs |

**Storage split:**

| Data | Store | Why |
|------|-------|-----|
| Supabase access + refresh tokens | `expo-secure-store` | Encrypted; auth best practice |
| Theme mode, selected financial year ID | `react-native-mmkv` | Fast synchronous reads; Zustand persist |
| Other non-secret prefs | `react-native-mmkv` | Same instance |

Custom Supabase storage adapter wiring `SecureStore` ↔ auth session. Zustand `persist` middleware uses MMKV adapter (not AsyncStorage).

**MMKV note:** Requires a **development build** or EAS APK (`npx expo prebuild` / EAS Build). Not supported in **Expo Go**. Acceptable — v1 ships as internal APK anyway (ADR-008).

### Server state & local state

| Package | Purpose | Why |
|---------|---------|-----|
| `@tanstack/react-query` | Cache Supabase queries, mutations, loading/error | Already used in base-app; works well with Supabase |
| `zustand` | Active financial year, theme mode, lightweight UI state | Replaces Redux; minimal boilerplate |

**Not using:** `redux`, `@reduxjs/toolkit`, `axios`, `zustand` for server cache (Query handles that).

### Validation & shared logic

| Package | Purpose |
|---------|---------|
| `zod` | Bill form validation (`packages/shared`) |
| `packages/shared` | `billForm.ts`, `billFormSchema.ts`, types, formatters (workspace) |

### Connectivity

| Package | Purpose |
|---------|---------|
| `@react-native-community/netinfo` | Internet check on launch (ADR-014) |

Not a UI kit — allowed under ADR-011.

### Print & share

| Package | Purpose |
|---------|---------|
| `expo-print` | HTML → PDF (`printToFileAsync`) |
| `expo-sharing` | Share PDF to WhatsApp / files |
| `react-native-webview` | Bill HTML preview inside `RNHostView` | **Exception** — preview only |

### Expo utilities

| Package | Purpose |
|---------|---------|
| `expo-constants` | Env / config |
| `expo-linking` | Deep links (optional v1) |
| `expo-status-bar` | Status bar theming |

---

## Dev & backend tooling

| Tool | Purpose |
|------|---------|
| `supabase` CLI | Migrations, local dev, `db push` |
| `eas-cli` | Android APK builds |
| `eslint` / `prettier` | Lint/format |

---

## Explicitly NOT using

| Package | Reason |
|---------|--------|
| `react-native-paper` | ADR-011 — Expo UI only |
| `nativewind`, `tailwindcss` | ADR-011 |
| `@gorhom/bottom-sheet` | Use `@expo/ui` BottomSheet |
| `@react-native-community/datetimepicker` | Use `@expo/ui/community` |
| `axios` | Supabase client covers HTTP |
| `@react-native-async-storage/async-storage` | Use **MMKV** instead — faster, synchronous |
| `redux`, `@reduxjs/toolkit` | ADR-012 — cut Redux |
| `react-hook-form` | Optional; TanStack Form or controlled Expo UI inputs sufficient for v1 |
| `lodash` | Native JS sufficient |
| `moment` / `dayjs` | Use native `Intl` + small helpers (base-app uses plain Date) |

---

## Expo UI component map (this app)

| UI need | Package |
|---------|---------|
| Bottom tab bar | expo-router Tabs / React Navigation bottom tabs |
| Transactions sub-tabs | `@expo/ui/jetpack-compose` ScrollableTabRow + HorizontalPager |
| Masters sub-tabs | `@expo/ui/jetpack-compose` ScrollableTabRow |
| Lists | `@expo/ui` Column + mapped cards |
| Forms | `@expo/ui` TextInput, Picker, Checkbox, Switch |
| Buttons / dialogs | `@expo/ui` Button, AlertDialog |
| Snackbar on save | `@expo/ui/jetpack-compose` Snackbar (verify export at implementation) |
| Date picker (bill date) | `@expo/ui/community` or jetpack-compose date control |
| Theme | Compose MaterialTheme + Zustand flag persisted in **MMKV** |
| PDF preview | `react-native-webview` in `RNHostView` |

---

## Install command (reference — run at Phase 0)

```bash
npx create-expo-app@latest billing-app --template default@sdk-56

cd billing-app
npx expo install expo-router expo-secure-store expo-print expo-sharing expo-constants
npx expo install @supabase/supabase-js @react-native-community/netinfo react-native-webview
npx expo install react-native-screens react-native-safe-area-context

npm install react-native-mmkv @tanstack/react-query zod zustand
```

Pin `@expo/ui` via template; do not install UI kits separately.

---

## Open dependency questions

| Question | Recommendation |
|----------|----------------|
| Expo Router vs React Navigation only? | **Expo Router** unless team prefers manual setup |
| Snackbar if not in Expo UI yet? | Compose SnackbarHost via jetpack-compose; fallback: short AlertDialog |
| Monorepo (app + shared)? | **pnpm workspaces** at repo root when extracting `packages/shared` |
| MMKV persist adapter for Zustand? | Small wrapper using `MMKV.set` / `MMKV.getString` |

See also [ADR-013 Navigation UX](./decisions/ADR-013-mobile-navigation-ux.md), [ADR-014 Auth](./decisions/ADR-014-auth-profile-connectivity.md).
