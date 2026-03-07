# Muscle Build

## Current State
Full-stack fitness app with nutrition tracking, workout logging, weight tracking, muscle heatmap, barcode food scanner, QR share, goal onboarding, user counter, and Stripe integration. Five tabs: Dashboard, Nutrition, Workouts, Weight, Body. Backend uses Motoko with authorization, food/workout/weight data per user.

## Requested Changes (Diff)

### Add
- **Leaderboard / Competition tab** (6th nav tab): shows a ranked list of all users by total workout volume (sets × reps × weight) over the last 7 days and all-time. Users can see their own rank highlighted. Display username, total volume score, number of workouts.
- **Public display name**: users can set a display name shown on the leaderboard (defaults to truncated principal).
- **Backend leaderboard API**: `getLeaderboard()` returns top users with aggregated workout stats (public query). `setDisplayName(name: Text)` stores user's leaderboard handle.
- **Muscular deer mascot**: custom generated image used as the app mascot shown on the leaderboard page header and login page.

### Modify
- **BottomNav**: add a 6th "Compete" tab with a trophy icon.
- **App.tsx**: wire the new "compete" tab.
- **UserProfile type**: add optional `displayName` field.
- **Login page**: show mascot image.

### Remove
- Nothing removed.

## Implementation Plan
1. Generate mascot image (muscular deer).
2. Update backend: add `displayName` to UserProfile, add `getLeaderboard` public query, add `setDisplayName` mutation.
3. Frontend: create `LeaderboardTab.tsx` with weekly/all-time toggle, ranked user list, own rank highlight, display name setter dialog.
4. Update `BottomNav` to add Compete tab.
5. Update `App.tsx` to include the new tab.
6. Show mascot on leaderboard header and login page.
