# Implementation Roadmap

Phased plan for building the React Native + Supabase billing app.

**Prerequisites:** Decisions in [03-decision-log.md](./03-decision-log.md) accepted.

---

## Phase 0 — Project Setup (Week 1)

| Task | Output |
|------|--------|
| Create Expo app at repo root (or `app/`) | `npx create-expo-app` with TypeScript |
| Create Supabase project (free tier) | Project URL + anon key |
| Init Supabase CLI + migrations folder | `supabase init`, link project |
| Extract shared package from base-app | `packages/shared/` with billForm, schemas, types |
| Configure ESLint, Prettier, env vars | `.env` with `EXPO_PUBLIC_SUPABASE_URL` |

**Exit criteria:** App boots, Supabase client connects, shared package imports work.

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
| Role-based drawer navigation | Filter routes by role (from profiles) |

**Exit criteria:** User can log in, see role-appropriate menu, RLS blocks unauthorized access.

---

## Phase 2 — Financial Year & Masters (Week 2–3)

| Task | Output |
|------|--------|
| Financial year picker (global context) | Zustand/Context, persisted in AsyncStorage |
| Master list screens (7 entities) | FlatList + search + pull-to-refresh |
| Master form screens | Create/edit with validation |
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
| Bill navigator (prev/next) | Query by bill_number in FY |

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

## Phase 5 — Loads & Polish (Week 6–7)

| Task | Output |
|------|--------|
| Loads list screen | Read-only, FY-scoped |
| Error handling + toast messages | Consistent UX |
| Loading states + empty states | All list screens |
| App icon + splash screen | Branding |
| EAS Build for Android APK | Internal distribution |
| Optional: iOS TestFlight | If iOS required |

**Exit criteria:** MVP feature-complete for field use.

---

## Phase 6 — Production Hardening (Ongoing)

| Task | Notes |
|------|-------|
| Supabase Pro upgrade | Removes inactivity pause, adds backups |
| Scheduled `pg_dump` backup | If staying on free tier |
| Inactivity keep-alive | `pg_cron` weekly ping |
| EAS Update for OTA patches | JS-only fixes without store resubmit |
| Admin menu screen | Low priority; defer |

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

**Total:** ~6–7 weeks part-time for a single developer familiar with the base-app.

---

## MVP Feature Cut Line

**In MVP:**
- Login, FY picker, all masters, bills CRUD, bill print/share, loads list

**Out of MVP:**
- Dashboard widgets
- Menu admin
- Offline drafts
- Web/desktop client
- Full metadata-driven column admin
- Batch master operations (single-record CRUD is enough for &lt;10 users)
