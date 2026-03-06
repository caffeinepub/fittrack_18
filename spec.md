# Muscle Build

## Current State
Full-stack fitness tracking app with food logging, workout sessions, body weight tracking, a muscle heatmap (Body tab), Stripe integration, QR code sharing, and goal selection on first login. Authorization uses role-based access control with admin and user roles.

## Requested Changes (Diff)

### Add
- Backend: `getUserCount` query function accessible only to admins, returns the total number of registered users (size of `userProfiles` map).
- Frontend: A visible user counter displayed in the admin area (or a dedicated Stats section) showing the total number of accounts created.

### Modify
- Backend: No changes to existing functions.
- Frontend: Admin panel or dashboard to include a "Total Users" stat card showing the count returned by `getUserCount`.

### Remove
- Nothing removed.

## Implementation Plan
1. Add `getUserCount` query to `main.mo` that checks for admin role and returns `userProfiles.size()`.
2. Expose it in `backend.d.ts` bindings.
3. In the frontend admin section, add a stat card that calls `getUserCount` and displays the number of registered users.
4. Add `data-ocid` markers to the stat card and any new interactive elements.
