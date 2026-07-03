# ADR-003: Expo for React Native Toolchain

**Status:** Accepted  
**Date:** 2026-07-03

## Context

React Native can be bootstrapped via Expo (managed workflow) or bare React Native (manual native project setup). The billing app needs:

- Supabase client integration
- PDF generation and print (`expo-print`)
- File sharing (`expo-sharing`)
- Secure token storage (`expo-secure-store`)
- Future app store builds

## Decision

Use **Expo** (SDK 52+) with TypeScript for the React Native app.

- **Development:** Expo Go or development build
- **Production builds:** EAS Build
- **OTA updates:** EAS Update (for JS-only patches post-launch)

## Consequences

### Positive

- Fast project setup and consistent toolchain
- First-party modules for print, sharing, secure storage
- EAS simplifies Android APK and iOS builds without local Xcode/Android Studio for every dev
- Strong Supabase + Expo documentation and community examples

### Negative

- Some native modules may require custom dev client (acceptable)
- Slightly larger app binary than bare RN (negligible for this app)

### Neutral

- Can eject to bare workflow later if needed (unlikely for this scope)

## Alternatives considered

| Alternative | Why not |
|-------------|---------|
| Bare React Native | Slower setup; no clear benefit for this app size |
| React Native CLI without Expo | More native config burden |
