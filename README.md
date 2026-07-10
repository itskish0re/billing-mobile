# Billing Mobile

Expo **SDK 57** Android app for freight/truck billing, backed by Supabase.

## Stack

| Layer | Choice |
|-------|--------|
| App | Expo SDK 57, Expo Router, `@expo/ui` |
| Backend | Supabase (Billing Dev) |
| State | TanStack Query + Zustand + MMKV |
| Auth storage | expo-secure-store |

## Setup

```powershell
copy .env.example .env
# Fill EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env

npm install
npx expo start
```

For **Android APK** (MMKV + native modules), use a dev client or EAS build:

```powershell
npx expo run:android
# or
eas build --platform android --profile preview
```

## Project layout

```
src/app/           Expo Router screens (4 bottom tabs)
src/components/    UI components (@expo/ui)
src/lib/           Supabase client, MMKV
src/providers/     React Query provider
src/stores/        Zustand (theme, active FY)
supabase/          Migrations, seed, config
research/          Architecture decisions
sample/            Reference web app (gitignored)
```

See `supabase/README.md` and `research/` for backend and product decisions.
