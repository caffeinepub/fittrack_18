# FitTrack

## Current State
FitTrack is a full-stack fitness tracking app with calorie/macro logging, workout tracking, and body weight tracking. After Internet Identity login, users land directly on the dashboard. There is no onboarding flow. User goal preference is not stored anywhere.

## Requested Changes (Diff)

### Add
- Goal onboarding screen shown once per user after their first login, asking them to pick one of four fitness goals:
  - Lose Weight
  - Gain Weight
  - Gain Muscle
  - Make Healthier Decisions
- Store the selected goal in localStorage keyed by the user's principal ID so it only shows once and persists across sessions
- Display the selected goal on the dashboard as a personalized banner/badge (e.g. "Goal: Gain Muscle")

### Modify
- App.tsx: after login, check if the current user has already selected a goal; if not, show the GoalOnboarding screen before AppShell
- DashboardTab: show the stored goal as a small motivational badge near the welcome header

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/frontend/src/pages/GoalOnboarding.tsx` — full-screen goal picker with four large cards, animated, stores selection to localStorage under key `fittrack_goal_{principalId}`, calls `onComplete(goal)` callback
2. Create `src/frontend/src/hooks/useUserGoal.ts` — hook that reads/writes the goal from localStorage using the current user's principal as the key
3. Update `App.tsx` — after identity is confirmed, check `useUserGoal`; if no goal set, render `<GoalOnboarding>` instead of `<AppShell>`; pass goal into AppShell
4. Update `DashboardTab.tsx` — accept optional `goal` prop and display a small goal badge near the "Today's Overview" header
