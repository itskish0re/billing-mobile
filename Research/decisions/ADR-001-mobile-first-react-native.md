# ADR-001: Mobile-first with React Native

**Status:** Accepted  
**Date:** 2026-07-03

## Context

The existing Billing v3 app is a React SPA optimized for desktop grids and sidebar navigation. The client has stated that **mobile functionality is more important than desktop**, with a user base of fewer than 10 people in a single organization.

The current web app has responsive breakpoints (`useIsMobile` at 768px) but this only hides columns and adjusts table layout — it is not a native mobile experience. Bill entry, lookup pickers, and print/share are awkward on mobile browsers.

## Decision

Build a **native mobile app using React Native** as the primary client. The existing web app in `sample/base-app/` remains as a reference implementation, not the production target.

## Consequences

### Positive

- Native navigation, gestures, and platform integrations (share sheet, print)
- Better UX for bill entry in the field (scrollable forms, modal pickers)
- App distribution via APK/TestFlight/App Store
- Aligns with client's stated priority

### Negative

- Full UI rewrite required (cannot reuse shadcn/TanStack Table components)
- Two codebases if web is ever needed again (mitigated: shared business logic package)
- App store or sideload distribution overhead

### Neutral

- Team's React/TypeScript skills transfer directly to React Native
- API contracts from base-app inform Supabase schema design

## Alternatives considered

| Alternative | Why not |
|-------------|---------|
| Responsive web only | Doesn't meet mobile-first requirement |
| Capacitor wrapper | Poor UX, doesn't solve architecture goals |
| Flutter | Team has React experience; rewrite cost higher |
