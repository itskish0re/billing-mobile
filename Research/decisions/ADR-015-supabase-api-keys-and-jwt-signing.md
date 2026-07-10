# ADR-015: Supabase Publishable Keys + JWT Signing Keys

**Status:** Accepted  
**Date:** 2026-07-05

## Context

Supabase is migrating away from legacy JWT-based API keys (`anon`, `service_role`) and the shared JWT secret. The Billing Dev dashboard now shows:

- **Publishable / Secret API keys** (`sb_publishable_...`, `sb_secret_...`) — new model
- **Legacy anon / service_role** — deprecated, removable after migration
- **JWT Signing Keys** — replaces the legacy JWT secret for user access tokens

## Decision

Use **only the new Supabase models** for this project.

### 1. Mobile app — Publishable key

| Old | New |
|-----|-----|
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` (legacy JWT) | `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_...`) |

```ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)
```

- Same low privileges as legacy `anon`; RLS unchanged
- Safe to embed in the Android APK
- **Never** use secret or `service_role` keys in the app

### 2. Backend / Edge Functions — Secret key (future)

When we add Edge Functions (`save-bill`, etc.):

| Old | New |
|-----|-----|
| `SUPABASE_SERVICE_ROLE_KEY` | `SUPABASE_SECRET_KEYS` JSON → `['default']` or named key |
| `verify_jwt = true` (default) | `verify_jwt = false` + authorize in code or `@supabase/server` |

Secret keys (`sb_secret_...`):

- Bypass RLS — server-side only
- Stored in Edge Function secrets / CI, never in repo or mobile app
- Send on **`apikey` header only** — not `Authorization: Bearer`

### 3. JWT Signing Keys (Dashboard migration)

Separate from API keys. Migrates how **user session JWTs** are signed (after login).

**In Dashboard:** Authentication → JWT Settings → **Migrate JWT secret to Signing Keys**

| Setting | Value |
|---------|-------|
| Signing keys | Asymmetric (recommended) — rotatable without downtime |
| Access token JWT expiry | **86400** seconds (1 day) — ADR-014 |
| Legacy JWT secret | Revoke only after all clients use publishable key + signing keys |

User login flow unchanged: Supabase Auth still issues JWT access tokens; they are just signed with the new key pair instead of the shared secret.

### 4. GitHub heartbeat

| Old | New |
|-----|-----|
| `SUPABASE_ANON_KEY` secret | `SUPABASE_PUBLISHABLE_KEY` |
| `apikey` + `Authorization: Bearer` | **`apikey` header only** |

Publishable keys are **not JWTs** — putting them in `Authorization: Bearer` returns `Invalid JWT`.

### 5. Legacy keys

- Do **not** use legacy `anon` or `service_role` in new code
- After verifying no usage, **deactivate** legacy keys in Dashboard (reversible)
- Docs: [Migrating to publishable and secret API keys](https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys)

## Consequences

### Positive

- Aligns with Supabase's current and future platform defaults
- Publishable/secret keys rotate independently of JWT signing
- Signing keys allow rotation without forcing all users to re-login
- Heartbeat workflow fixed for new key format

### Negative

- Edge Functions need `verify_jwt = false` when using new keys (planned for bill save)
- Env var rename (`ANON` → `PUBLISHABLE`) — one-time update in `.env` and GitHub secrets

### Neutral

- `@supabase/supabase-js` `createClient` API unchanged — only the key string changes
- RLS policies and auth sessions behave the same

## References

- [Understanding API keys](https://supabase.com/docs/guides/getting-started/api-keys)
- [Migrating to publishable and secret API keys](https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys)
- [JWT Signing Keys](https://supabase.com/docs/guides/auth/signing-keys)
