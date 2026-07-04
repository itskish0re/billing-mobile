# Implementation Roadmap

Phased plan for building the React Native + Supabase billing app.

**Prerequisites:** Decisions in [03-decision-log.md](./03-decision-log.md) accepted.

---

## Phase 0 — Project Setup (Week 1)

| Task | Output |
|------|--------|
| Create Expo app (SDK 56, Expo UI template) | `npx create-expo-app@latest --template default@sdk-56` |
| Create Supabase project (free tier) | Project URL + anon key |
| Init Supabase CLI + migrations folder | `supabase init`, link project |
| **GitHub Actions heartbeat** | `.github/workflows/supabase-heartbeat.yml` (ADR-010) |
| Extract shared package from base-app | `packages/shared/` with billForm, schemas, types |
| Configure `eas.json` for Android APK | `buildType: apk`, internal distribution |
| Configure env vars | `EXPO_PUBLIC_SUPABASE_URL`, anon key |

**Exit criteria:** App boots with `@expo/ui` Host, Supabase connects, heartbeat workflow green.

**Platform:** Android only. **UI:** `@expo/ui` only — no Paper/NativeWind.

---

## Phase 1 — Database & Auth (Week 1–2)

| Task | Output |
|------|--------|
| Migrate business schema to Supabase | SQL migrations from `dbdiagram.dbml` + bills/loads |
| Create `profiles` table linked to `auth.users` | role_id, display_name |
| Enable RLS on all public tables | Policies for authenticated read/write |
| Seed roles, menus, financial year | SQL seed scripts |
| Build login screen | Email/password via Supabase Auth |
| Session persistence | `expo-secure-store` for session |
| Hardcoded drawer navigation | Static routes filtered by admin/user role (no `app_menu` table) |

**Exit criteria:** User can log in, see role-appropriate menu, RLS blocks unauthorized access.

---

## Phase 2 — Financial Year & Masters (Week 2–3)

| Task | Output |
|------|--------|
| Financial year picker (global context) | Zustand + **MMKV** persist |
| Master list screens (7 entities) | Expo UI `Column` + mapped rows + search |
| Master form screens | Single-record create/edit (no batch APIs) |
| Financial year | Picker only — no FY CRUD screen |
| Lookup picker component | Modal search for bill form (trucks, parties, etc.) |
| Indian formatters in UI | Mobile, vehicle, currency display |

**Priority order:** financial_year → location → party → goods → unit → name_board → truck

**Exit criteria:** All masters CRUD works; lookups usable from bill form.

---

## Phase 3 — Bills (Week 3–5) — Highest effort

| Task | Output |
|------|--------|
| Bills list screen | Query `v_bills` filtered by FY |
| Bill detail screen | Read-only expanded view |
| Bill create/edit form | Multi-section scrollable form |
| Port `billForm.ts` recalculation | Wire to form onChange |
| Port `billFormSchema.ts` validation | Client-side before save |
| Edge Function: `save-bill` | Transactional upsert bill + sync loads |
| Edge Function: `cancel-bill` | Set is_cancelled |
| Next bill number suggestion | SQL function or Edge Function |
| ~~Bill navigator (prev/next)~~ | **Cut** per ADR-012 |

**Exit criteria:** Full bill lifecycle — create, edit, cancel, list, detail.

---

## Phase 4 — Print & Share (Week 5–6)

| Task | Output |
|------|--------|
| Port bill memo HTML template | From `bill-memo-template.tsx` |
| Generate PDF | `expo-print.printToFileAsync` |
| Share sheet | `expo-sharing` for WhatsApp/email |
| Preview screen | WebView or PDF viewer |

**Exit criteria:** User can preview and share/print a bill memo.

---

## Phase 5 — Polish & APK (Week 5–6)

| Task | Output |
|------|--------|
| Loads list screen | **Optional v1.1** — defer if bills take longer |
| Error handling + toast messages | Consistent UX |
| Loading states + empty states | All list screens |
| App icon + splash screen | Branding |
| EAS Build for Android APK | Sideload to users |
| GitHub Actions heartbeat verified | Project stays awake on free tier |

**Exit criteria:** MVP feature-complete for field use.

---

## Phase 6 — Production Hardening (Ongoing)

| Task | Notes |
|------|-------|
| Heartbeat monitoring | Alert if GitHub Action fails |
| Weekly `pg_dump` backup (optional) | GitHub artifact — free tier has no auto backups |
| EAS Update for OTA patches | JS-only fixes without new APK |
| Loads list | v1.1 if deferred |
| Windows desktop client | Future ADR |

---

## Repository Structure (Target)

```
billing-mobile/
├── app/                    # Expo React Native app
│   ├── src/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── navigation/
│   │   ├── lib/            # supabase client, formatters
│   │   └── hooks/
│   └── app.json
├── packages/
│   └── shared/             # billForm, schemas, types (from base-app)
├── supabase/
│   ├── migrations/
│   ├── functions/          # save-bill, cancel-bill
│   └── seed.sql
├── research/               # This folder
└── sample/
    └── base-app/           # Reference implementation (unchanged)
```

---

## Effort Estimate

| Phase | Relative effort | Risk |
|-------|-----------------|------|
| 0 Setup | Low | Low |
| 1 DB + Auth | Medium | Medium (RLS correctness) |
| 2 Masters | Medium | Low |
| 3 Bills | **High** | High (form complexity) |
| 4 Print | Medium | Medium (PDF layout) |
| 5 Polish | Low | Low |

**Total:** ~4–5 weeks part-time with scope reduction (ADR-012).

---

## MVP Feature Cut Line

**In MVP:**
- Login, FY picker, all masters, bills CRUD, bill print/share, loads list

**Out of MVP (ADR-012):**
- Dashboard, menu admin, bill navigator
- UI metadata registry + screen API
- Endpoint permission registry
- Batch master operations
- Expanded row panels (use detail screens)
- Offline drafts, web client, iOS build
- Full metadata-driven column admin
