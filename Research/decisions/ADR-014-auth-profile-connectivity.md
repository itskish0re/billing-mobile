# ADR-014: Auth, Profile & Connectivity

**Status:** Accepted  
**Date:** 2026-07-04

## Context

Requirements from client:

1. **Full name** on Home and Settings (from user profile)
2. **Session with refresh** — access token expiry ~**1 day**
3. **Internet check** before app loads — block with alert + Close if offline
4. Unsure how Supabase Auth maps to refresh tokens

## Decision

### User profile

Extend Supabase auth with a **`profiles`** table:

```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  role_id int NOT NULL REFERENCES app_role(role_id),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

| Field | Use |
|-------|-----|
| `full_name` | Home greeting, Settings display |
| `role_id` | RLS (`admin` / `user`) — same screens for both in v1 |
| `is_active` | Block login if false |

Create profile row via **database trigger on `auth.users` insert** or Edge Function on first login. Admin creates users in **Supabase Dashboard** (Auth → Users) + manual profile row, or seed script.

Email/password login only (matches base-app).

---

### How Supabase Auth sessions work

Supabase Auth is **JWT-based with automatic refresh** — you do not implement refresh rotation manually (unlike base-app Dapper `refresh_token` table).

| Token | Purpose | Default | Our target |
|-------|---------|---------|------------|
| **Access token (JWT)** | Sent on every Supabase API call | 1 hour | **86400 s (1 day)** |
| **Refresh token** | Obtains new access token when expired | Long-lived; rotated by Supabase | Default Supabase behaviour |

**Configure in Supabase Dashboard:**

`Authentication → Settings → JWT expiry` → **86400** (seconds)

**Client behaviour** (`@supabase/supabase-js`):

- `autoRefreshToken: true` (default) — refreshes access token in background before expiry
- `persistSession: true` — stores session in device storage
- On app launch: `supabase.auth.getSession()` restores session if refresh token still valid

**Mobile storage:** persist Supabase session in **`expo-secure-store`** via custom storage adapter. App prefs (theme, active FY) use **`react-native-mmkv`** — not AsyncStorage.

**Logout:** `supabase.auth.signOut()` — revokes refresh token server-side.

This replaces base-app custom JWT + refresh token table entirely.

---

### App startup flow

```
App launch
    │
    ▼
Check network (NetInfo)
    │
    ├─ Offline ──► AlertDialog: "No internet connection"
    │               [Close] ──► exit app (BackHandler / exitApp)
    │
    └─ Online ──► Restore Supabase session
                      │
                      ├─ Valid session ──► Main tabs
                      │
                      └─ No session ──► Login screen
```

| Requirement | Implementation |
|-------------|----------------|
| Internet gate | `@react-native-community/netinfo` — check before Supabase calls |
| Alert + Close | Expo UI `AlertDialog`; Close calls `BackHandler.exitApp()` on Android |
| Re-check | Optional: listen to NetInfo; show banner if connection lost while using app (v1.1) |

**Note:** Supabase free-tier **heartbeat** keeps the *project* awake; the app still requires internet for all data operations (online-first v1).

---

### Login screen

- Email + password fields (Expo UI `TextInput`)
- Submit → `supabase.auth.signInWithPassword`
- On success → load `profiles.full_name` → navigate to tabs
- On error → inline error text or Snackbar

---

## Consequences

### Positive

- No custom auth server or refresh token table
- 1-day JWT reduces refresh frequency for small user base
- Secure token storage on device
- Clear offline gate avoids confusing auth errors

### Negative

- JWT expiry &gt; 1 hour means stolen token valid longer — acceptable for internal &lt;10 user app; shorten if needed
- User provisioning via Dashboard until in-app admin exists
- `BackHandler.exitApp()` is abrupt — intentional per requirement

### Neutral

- Supabase refresh token lifetime is controlled by Supabase; we only configure **access token JWT expiry**
- Full name edit in-app can be added later (Settings → edit profile)

## Related

- [ADR-005 Auth + RLS](./ADR-005-auth-and-rls.md)
- [Supabase Auth sessions](https://supabase.com/docs/guides/auth/sessions)
