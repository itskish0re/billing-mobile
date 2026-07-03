# ADR-007: Bill Memo / Print via HTML + PDF

**Status:** Proposed  
**Date:** 2026-07-03

## Context

The base-app has a detailed **bill memo template** (`bill-memo-template.tsx`) with A4 HTML/CSS layout matching physical freight bills used in the Indian trucking industry. It supports:

- Company header, bill number, date
- Load lines table with dynamic row heights
- Charge breakdown (commission, mamul, diesel, others)
- Advance summary and payment details
- Print via browser `window.print()`

Mobile users need to **preview, print, and share** bills (typically via WhatsApp as PDF).

## Decision (proposed)

1. **Port the HTML template** from base-app to a string template function in `packages/shared/` (framework-agnostic HTML)
2. **Generate PDF** on device using `expo-print.printToFileAsync({ html })`
3. **Share** via `expo-sharing.shareAsync(fileUri)` for WhatsApp, email, etc.
4. **Preview** in a WebView or native PDF viewer before share

Do not attempt to rebuild the layout in React Native View components — the HTML template is already proven and matches physical bills.

## Consequences

### Positive

- Reuses existing A4 layout with minimal changes
- PDF output familiar to users (same as printed bills)
- WhatsApp sharing is a primary workflow in Indian business

### Negative

- HTML/CSS rendering on mobile may have minor differences from desktop print
- WebView adds dependency; must test on both Android and iOS
- Font embedding may be needed for consistent print

### Neutral

- Alternative `react-native-html-to-pdf` exists but `expo-print` is simpler in Expo workflow

## Open items before accepting

- [ ] Test `expo-print` output against physical bill sample on Android and iOS
- [ ] Confirm font availability (JetBrains Mono for numbers, system fonts for text)
- [ ] Decide if thermal printer support is needed (out of scope for v1)

## Alternatives considered

| Alternative | Why not |
|-------------|---------|
| RN View-based layout | Duplicate effort; hard to match A4 print layout |
| Server-side PDF generation | Adds Edge Function + storage; unnecessary for on-device print |
| Screenshot of form | Poor quality, doesn't match bill format |
