# ADR-008: Android-Only v1 with Internal APK Distribution

**Status:** Accepted  
**Date:** 2026-07-04

## Context

The billing app serves a small internal user base (&lt;10). The client confirmed:

- **Android only** for the first release
- **Internal APK** distribution (no Play Store for v1)
- **Windows desktop app** is a possible future direction, not part of v1

## Decision

### v1 platform

- Target **Android only** — no iOS build, no iOS-specific testing in v1
- Build with **EAS Build** (`eas build --platform android --profile preview`) to produce an APK
- Distribute via **direct APK install** (USB, shared drive, WhatsApp, internal link)
- Enable **“Install from unknown sources”** on user devices (one-time setup)

### UI platform alignment

Since v1 is Android-only, prefer **`@expo/ui/jetpack-compose`** for platform-specific screens and **`@expo/ui`** universal components elsewhere. No need for SwiftUI imports in v1.

### Future: Windows desktop

Not in scope for v1. When planned, evaluate separately:

| Option | Notes |
|--------|-------|
| Expo web + `@expo/ui` universal | Shared codebase with mobile; bill print via browser |
| React Native for Windows | Experimental; higher effort |
| Tauri / Electron wrapper | Separate stack; only if web port insufficient |

Document Windows as a **future ADR** when requirements are clearer.

## Consequences

### Positive

- Single platform reduces testing matrix (Android versions only)
- Internal APK avoids store review and fees
- Jetpack Compose via Expo UI gives native Material feel on Android
- Faster iteration — sideload new APK when needed

### Negative

- No iOS users without a separate build track later
- APK updates are manual (no Play Store auto-update); mitigate with EAS Update for JS-only changes
- Users must trust sideloading

### Neutral

- EAS Build free tier includes limited builds per month — sufficient for internal use
- `app.json` / `eas.json` configured for Android APK profile only

## Build configuration (reference)

```json
// eas.json (preview profile)
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      },
      "distribution": "internal"
    }
  }
}
```
