# Supabase — Billing Dev

Remote project used by the Billing Mobile app.

| Field | Value |
|-------|-------|
| **Name** | Billing Dev |
| **Project ref** | `rdtztlyqlzhuyxebuzrm` |
| **Region** | ap-southeast-1 (Singapore) |
| **API URL** | `https://rdtztlyqlzhuyxebuzrm.supabase.co` |
| **Dashboard** | [Open project](https://supabase.com/dashboard/project/rdtztlyqlzhuyxebuzrm) |

---

## What is deployed

Migrations in `supabase/migrations/` (applied to Billing Dev):

| Migration | Contents |
|-----------|----------|
| `20260705110000` | Extensions, enums (`bill_pay_by`, `app_role_code`) |
| `20260705110100` | `app_role`, `profiles`, auth user trigger |
| `20260705110200` | Business masters (7 tables) |
| `20260705110300` | `bills`, `loads` |
| `20260705110400` | Triggers, `heartbeat()`, `suggest_next_bill_number()`, RLS helpers |
| `20260705110500` | Views `v_bills`, `v_loads` |
| `20260705110600` | RLS policies |

Seed data (`seed.sql`):

- Roles: `admin`, `user`
- Financial year: `2025-26`

**Not ported** (per ADR-012): `app_entity*`, `app_endpoint*`, `app_menu*`, batch APIs.

---

## One-time Dashboard settings

### API keys (use new model — ADR-015)

Open [Settings → API Keys → Publishable and secret](https://supabase.com/dashboard/project/rdtztlyqlzhuyxebuzrm/settings/api-keys):

| Use | Key type | Where |
|-----|----------|-------|
| **Mobile app** | **Publishable** (`sb_publishable_...`) | `.env` → `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |
| Edge Functions (later) | **Secret** (`sb_secret_...`) | Edge Function secrets only — never in app |
| GitHub heartbeat | **Publishable** | GitHub secret `SUPABASE_PUBLISHABLE_KEY` |

Do **not** use legacy `anon` or `service_role` in new code. Deactivate legacy keys in Dashboard after migration.

### JWT signing keys

Open [Authentication → JWT Settings](https://supabase.com/dashboard/project/rdtztlyqlzhuyxebuzrm/auth/jwt):

1. Click **Migrate JWT secret to Signing Keys** (asymmetric, recommended)
2. Set **JWT expiry** to **86400** seconds (1 day) — ADR-014

Signing keys control how **user session tokens** are signed after login. This is separate from the publishable API key.

### Auth providers

[Authentication → Providers](https://supabase.com/dashboard/project/rdtztlyqlzhuyxebuzrm/auth/providers):

| Setting | Value | Why |
|---------|-------|-----|
| Enable email signups | **Off** | Users created by admin only |

Copy the **publishable** key into `.env` (see `.env.example` at repo root).

---

## Create the first admin user

1. Dashboard → **Authentication → Users → Add user**
2. Set email + password
3. Under **User Metadata** (optional): `{ "full_name": "Your Name" }`
4. Under **App Metadata**: `{ "role_id": 1 }` for admin (1 = admin, 2 = user)
5. Save — the `handle_new_user` trigger creates the `profiles` row automatically

### Fix an existing user (no display name / role set at creation)

If you already created a user with **email + password only**, the trigger still ran and created a profile with:

- **Display name** → part of the email before `@` (e.g. `john` from `john@company.com`)
- **Role** → `user` (not admin)

To fix it in the **Dashboard**:

1. **Authentication → Users** → open the user → copy their **User UID**
2. **Table Editor → `profiles`** → find the row with that `id` → edit:
   - `full_name` → e.g. `Kishore N`
   - `role_id` → `1` for admin, `2` for user (see `app_role` table)
3. Optional — **Authentication → Users → User Metadata** (for display only):
   ```json
   { "full_name": "Kishore N" }
   ```
   This does **not** update `profiles` after creation; edit `profiles` for the app.

Or run in **SQL Editor** (replace the UUID and name):

```sql
UPDATE public.profiles
SET
  full_name = 'Kishore N',
  role_id = (SELECT role_id FROM public.app_role WHERE role_code = 'admin')
WHERE id = 'YOUR-USER-UUID-HERE';
```

Role IDs after seed: `admin` = 1, `user` = 2 (verify in `app_role` if unsure).

---

## Link CLI locally (optional)

```powershell
npx supabase login
npx supabase link --project-ref rdtztlyqlzhuyxebuzrm
```

Then you can run:

```powershell
npx supabase db pull    # pull remote schema diff
npx supabase db push    # push new local migrations
npx supabase db reset   # reset local DB with migrations + seed.sql
```

---

## Local development

```powershell
npx supabase start      # local Postgres + Auth (Docker required)
npx supabase stop
```

Local auth settings mirror `config.toml` (JWT 86400s, signups disabled).

---

## Heartbeat (free tier)

GitHub Actions workflow at `.github/workflows/supabase-heartbeat.yml` pings the project every 3 days. Add these **GitHub Secrets**:

| Secret | Value |
|--------|-------|
| `SUPABASE_URL` | `https://rdtztlyqlzhuyxebuzrm.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | Publishable key (`sb_publishable_...`) from Dashboard |

Use **`apikey` header only** — do not send publishable keys as `Authorization: Bearer` (they are not JWTs).

---

## Key RPCs

| Function | Caller | Purpose |
|----------|--------|---------|
| `heartbeat()` | publishable key via `apikey` header | Keep project alive on free tier |
| `suggest_next_bill_number(fy_id)` | authenticated | Home dashboard next bill # |

---

## Tables

```
app_role, profiles
financial_year, name_board, truck, location, party, goods, unit
bills, loads
v_bills, v_loads (views)
_keep_alive_log (internal)
```
