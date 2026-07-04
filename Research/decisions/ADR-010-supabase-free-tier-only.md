# ADR-010: Supabase Free Tier Only

**Status:** Accepted  
**Date:** 2026-07-04

## Context

The client wants to stay on **Supabase free tier only** — no Pro upgrade ($25/mo). Free tier constraints that matter:

| Limit | Impact |
|-------|--------|
| Pause after **7 days inactivity** | Project becomes unavailable until manually resumed |
| **No automatic backups** | Data loss risk on accidental delete |
| **500 MB database** | Fine for &lt;10 users |
| **2 active projects max** | One project for billing |
| **No PITR** | Cannot restore to point in time |

## Decision

Stay on free tier permanently. Mitigate risks with **external scheduled pings** and **manual/scheduled exports** — not a paid upgrade.

---

## Inactivity pause — workarounds

Supabase counts **API activity** toward keeping a project alive. The goal is a lightweight ping **every 3–4 days** (well under the 7-day threshold).

### Recommended: GitHub Actions heartbeat (primary)

Add `.github/workflows/supabase-heartbeat.yml` in this repo:

```yaml
name: Supabase heartbeat

on:
  schedule:
    # Every 3 days at 06:00 UTC — safely under 7-day pause window
    - cron: '0 6 */3 * *'
  workflow_dispatch: # manual trigger from Actions tab

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Supabase Auth health
        run: |
          curl -sf "${{ secrets.SUPABASE_URL }}/auth/v1/health" \
            -H "apikey: ${{ secrets.SUPABASE_ANON_KEY }}"

      - name: Ping database (keep-alive table)
        run: |
          curl -sf -X POST "${{ secrets.SUPABASE_URL }}/rest/v1/rpc/heartbeat" \
            -H "apikey: ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{}'
```

**GitHub Secrets required:**

| Secret | Value |
|--------|-------|
| `SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `SUPABASE_ANON_KEY` | Anon/publishable key from Dashboard → Settings → API |

**Why two pings?** Auth health alone may suffice; the DB RPC confirms Postgres is active. Use at least one; both is belt-and-suspenders.

### Keep-alive database function

Create a minimal RPC callable with the anon key:

```sql
-- Migration: create heartbeat function + optional log table
CREATE TABLE IF NOT EXISTS _keep_alive_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pinged_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION heartbeat()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO _keep_alive_log DEFAULT VALUES;
  -- Keep table tiny: delete rows older than 30 days
  DELETE FROM _keep_alive_log WHERE pinged_at < now() - interval '30 days';
END;
$$;

-- Allow anon to call (read-only side effect: one insert)
GRANT EXECUTE ON FUNCTION heartbeat() TO anon;
```

Alternative without RPC: `GET /rest/v1/financial_year?select=financial_year_id&limit=1` on any table with anon SELECT via RLS or a public read policy on a tiny config table.

### Fallback options (if GitHub Actions unavailable)

| Method | Cost | Notes |
|--------|------|-------|
| [cron-job.org](https://cron-job.org) | Free | HTTP GET to `/auth/v1/health` every 3 days |
| [UptimeRobot](https://uptimerobot.com) | Free tier | 5-min interval monitoring (more than enough) |
| Local `supawake` CLI on always-on machine | Free | Overkill for one project |
| App usage by users | Free | Unreliable alone — users may not open app for 7+ days |

**Do not rely on app-only usage** — field staff may not open the app every week during slow periods.

### What does NOT prevent pause

| Approach | Why it fails |
|----------|--------------|
| `pg_cron` inside Supabase | Only runs while project is **already awake** — cannot wake a paused project |
| Dashboard login | Manual; not automated |
| Hoping for activity | Unreliable for &lt;10 users |

---

## No backups on free tier — workarounds

| Method | Frequency | Notes |
|--------|-----------|-------|
| **Supabase Dashboard → Database → Backups** | Manual before major changes | Free tier: no scheduled backups |
| **GitHub Actions + `pg_dump`** | Weekly | Store `DATABASE_URL` (direct connection) in GitHub Secrets; upload artifact (retention 90 days) |
| **Supabase CLI `db dump`** | Weekly | `supabase db dump -f backup.sql` in CI |
| **Export critical tables to JSON** | Monthly | Lightweight; bills + masters only |

Example weekly backup workflow (optional, separate from heartbeat):

```yaml
# Requires SUPABASE_DB_URL secret (Settings → Database → Connection string)
- run: |
    pg_dump "$SUPABASE_DB_URL" --no-owner --no-acl -f backup.sql
    gzip backup.sql
- uses: actions/upload-artifact@v4
  with:
    name: supabase-backup-${{ github.run_id }}
    path: backup.sql.gz
    retention-days: 90
```

---

## Monitoring

- Enable **Supabase email alerts** for pause warnings (sent before pause)
- Add a **failed heartbeat notification**: GitHub Actions can email on workflow failure (Settings → Notifications)
- Document **resume steps** if project pauses anyway: Dashboard → Restore project (data intact)

---

## Consequences

### Positive

- $0/month infrastructure
- Automated heartbeat is reliable and community-proven
- GitHub Actions free tier (2000 min/month private) is more than enough for bi-weekly pings

### Negative

- Must maintain heartbeat workflow — if it breaks silently, project pauses
- Backups require DIY discipline; no one-click PITR
- Paused project = app unusable until someone restores from Dashboard

### Neutral

- Acceptable trade-off for internal app with &lt;10 users and low criticality windows
