# Muscle Build

## Current State
The app is a full-stack fitness tracker (calories, protein, workouts, weight, muscle heatmap). It uses Internet Identity for login so each user has their own private account. The share dialog in the header shows a QR code and "Copy Link" button, but the URL is hardcoded to `https://musclebuild.com` — a branding placeholder that does not resolve to the real deployed app. New users who scan the QR code or receive the link cannot actually reach the app.

## Requested Changes (Diff)

### Add
- Nothing new to add.

### Modify
- Update the share URL in `AppShell` from the hardcoded `https://musclebuild.com` to `window.location.origin` so the QR code and copy link always point to the actual live deployed URL.

### Remove
- Remove the hardcoded `appUrl = "https://musclebuild.com"` constant.

## Implementation Plan
1. In `App.tsx`, replace `const appUrl = "https://musclebuild.com"` with `const appUrl = window.location.origin`.
2. No other changes needed — the QR code and copy link already use `appUrl`.
