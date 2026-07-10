# ADR-011: Expo UI Only (@expo/ui)

**Status:** Accepted  
**Date:** 2026-07-04

## Context

The base-app web frontend uses shadcn/ui + Tailwind. For the mobile app, the client is **explicit**: use **Expo UI only** — no third-party UI libraries.

Expo UI (`@expo/ui`, SDK 56+) provides native components backed by **Jetpack Compose** on Android and SwiftUI on iOS. Since v1 is Android-only (ADR-008), Jetpack Compose is the primary native layer.

## Decision

### Allowed UI stack

| Layer | Choice |
|-------|--------|
| Components | **`@expo/ui`** (universal) and **`@expo/ui/jetpack-compose`** (Android-specific) |
| Layout | `Host`, `Column`, `Row`, `ScrollView` from `@expo/ui` |
| Inputs | `TextInput`, `Picker`, `Checkbox`, `Switch`, `Slider` from `@expo/ui` |
| Actions | `Button`, `BottomSheet`, `AlertDialog` from `@expo/ui` |
| Community replacements | `@expo/ui/community/*` drop-ins only when needed (e.g. date picker) |
| Icons | `Icon` from `@expo/ui` (Material Symbols on Android) |
| Navigation | **Expo Router** or **React Navigation** — navigation is not a UI kit; either is fine |
| Styling | Expo UI modifiers / Compose theming — **not** NativeWind, **not** Tailwind |

### Explicitly forbidden

| Library | Reason |
|---------|--------|
| React Native Paper | Third-party UI kit |
| NativeWind / Tailwind RN | Not Expo UI |
| shadcn/ui | Web-only |
| gluestack-ui, Tamagui, UI Kitten | Third-party UI kits |
| `@gorhom/bottom-sheet` | Use `@expo/ui` BottomSheet |
| `@react-native-community/datetimepicker` | Use `@expo/ui/community` date/time |
| `@react-native-picker/picker` | Use `@expo/ui` Picker |

### Project template

```bash
npx create-expo-app@latest --template default@sdk-57
```

SDK 56 default template includes Expo UI. Pin `@expo/ui` to SDK-compatible version.

**Project uses Expo SDK 57** — create with:

```bash
npx create-expo-app@latest . --template default@sdk-57
```

### Android-first component strategy

```tsx
// Prefer universal API (works on Android via Jetpack Compose backend)
import { Host, Column, Row, Text, TextInput, Button } from '@expo/ui';

// Use Jetpack Compose imports when universal API lacks a modifier/control
import { /* ... */ } from '@expo/ui/jetpack-compose';
```

### Hosting React Native views inside Expo UI

Use `RNHostView` when a screen needs a non-Expo-UI component (e.g. WebView for bill PDF preview). Keep this **exceptional** — default to Expo UI primitives.

## Consequences

### Positive

- Native Material 3 look on Android without custom styling effort
- Fewer native dependency conflicts (one UI system)
- Aligns with Expo SDK roadmap; stable as of SDK 56
- Future Windows/web can use `@expo/ui` universal components

### Negative

- Expo UI is newer — fewer Stack Overflow answers than Paper
- Some advanced DataTable patterns have no direct Expo UI equivalent — build simple lists with `Column` + mapped rows
- Bill memo preview may still need WebView (`RNHostView`) — acceptable exception

### Neutral

- Navigation headers can use Expo Router stack options or Compose top app bar via Jetpack Compose imports

## Reference

- [Expo UI docs](https://docs.expo.dev/versions/latest/sdk/ui/)
- [Jetpack Compose components](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/)
- [Drop-in replacements](https://docs.expo.dev/versions/latest/sdk/ui/drop-in-replacements/)
