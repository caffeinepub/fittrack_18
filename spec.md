# Muscle Build

## Current State
- Full-stack fitness tracker with: calorie/macro logging, workout sessions, body weight tracking, goal onboarding
- Authorization via Internet Identity
- QR code sharing, barcode food scanner
- Components: authorization, qr-code, camera
- No payment or subscription system
- No muscle heatmap or advanced analytics

## Requested Changes (Diff)

### Add
- **Stripe $3/month subscription** gating the "Advanced Settings" (muscle heatmap) feature
- **Muscle Heatmap page** (premium feature behind paywall):
  - SVG human body diagram (front and back view)
  - Each major muscle group colored by workout intensity:
    - Grey = not worked
    - Blue = lightly worked (1 session in 7 days)
    - Yellow = moderately worked (2-3 sessions)
    - Green = well worked (4+ sessions or heavy sets)
    - Red = overworked / very recently trained (trained today or yesterday)
  - Muscle groups mapped from workout exercise names (e.g. "Bench Press" → chest, triceps; "Squat" → quads, glutes, hamstrings)
  - Color legend shown below the diagram
- **Premium paywall UI**: when user taps the body icon (human figure) in the bottom nav or header, if not subscribed, show an upgrade dialog with "$3/month" CTA linking to Stripe checkout
- **Subscription status**: stored/checked via Stripe component; premium tab only unlocked after successful payment

### Modify
- **Bottom navigation**: add a 5th tab — "Body" — with a human figure icon; this is the entry point to the muscle heatmap (premium)
- **Workout exercise data**: map exercise names to muscle groups for heatmap computation (client-side mapping, no backend changes needed)

### Remove
- Nothing removed

## Implementation Plan
1. Select Stripe component
2. Generate updated Motoko backend with subscription status tracking (premium users)
3. Build MusclHeatmapTab page with SVG body diagram, color coding, and muscle group mapping logic
4. Build PremiumUpgradeDialog component shown when non-premium users access the Body tab
5. Integrate Stripe checkout flow for $3/month
6. Add "Body" tab to BottomNav and App.tsx tab routing
7. Wire subscription check: after Stripe success, mark user as premium and unlock heatmap
