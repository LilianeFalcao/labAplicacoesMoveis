## Context

The application already has a domain-level `ICameraService` and an infrastructure-level `ExpoCameraService`. We have successfully implemented activity photo capture for monitors and child photo capture for admins. The next step is to allow users (Parents, Monitors, Admins) to manage their own profile photos.

## Goals / Non-Goals

**Goals:**
- Provide a consistent UI for profile photo capture across all user roles.
- Implement a reusable `ProfilePhotoCaptureModal` component.
- Ensure Parents can update their photo from the existing `ParentProfileScreen`.
- Introduce profile management for Monitors and Administrators.

**Non-Goals:**
- Persistence to Supabase Storage (will be handled in a separate "Cloud Storage" task).
- Image editing/cropping (basic capture only).

## Decisions

1. **Shared Modal Component**: A new component `ProfilePhotoCaptureModal` will be created in `src/presentation/components/shared`. This modal will:
   - Request permissions using `ICameraService`.
   - Display a circular overlay to guide profile framing.
   - Return the captured URI to the parent component.

2. **Parent UI**:
   - Modify `ParentProfileScreen.tsx` to include a camera icon overlay on the avatar.
   - Hook up the `ProfilePhotoCaptureModal`.

3. **Monitor/Admin UI**:
   - Since these roles lack a dedicated profile tab, we will add a "Profile" tab to `MonitorTabs` and `AdminTabs`.
   - Create `MonitorProfileScreen.tsx` and `AdminProfileScreen.tsx` as lightweight versions of the profile management UI.

4. **Navigation**:
   - Update `RoleTabs.tsx` to include the new "Profile" tabs for Monitor and Admin.
   - Update `types.ts` to include the new screen routes.

## Risks / Trade-offs

- **Redundancy**: Adding a Profile tab for all roles might crowd the tab bar.
  - *Mitigation*: Use concise icons and labels. For Admin, consider a settings-based approach if the tab bar is too full.
- **Permission Denial**: Users might deny camera access.
  - *Mitigation*: Show clear alerts and fallback to a default avatar.
