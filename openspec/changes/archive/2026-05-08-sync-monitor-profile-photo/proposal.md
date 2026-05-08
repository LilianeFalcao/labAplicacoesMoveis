# Proposal: Sync Monitor Profile Photo

## Why

Currently, when a monitor updates their profile photo in the `MonitorProfileScreen`, the change is only stored in a local state. This means the new photo is not reflected in the `MonitorSidebar` (Drawer), which continues to show the default icon. Synchronizing the profile photo across the application ensures a consistent user experience and correctly reflects the monitor's identity throughout the interface.

## What Changes

1.  **Global State (AuthContext)**:
    *   Add `profilePhotoUri` to the `AuthContext` state.
    *   Implement an `updateProfilePhoto` function in `AuthContext` to persist the photo URI during the session.
2.  **Monitor Profile Screen**:
    *   Replace the local `avatarUri` state with the global `profilePhotoUri` from `useAuth`.
    *   Call `updateProfilePhoto` when a new photo is captured.
3.  **Monitor Sidebar**:
    *   Update the sidebar header to use `profilePhotoUri` from `useAuth` if available, falling back to the default icon.

## Capabilities

### Modified Capabilities
- `monitor-profile-management`: Synchronized profile photo across the UI.

## Impact

- `src/presentation/contexts/AuthContext.tsx`: Added global photo state.
- `src/presentation/screens/monitor/MonitorProfileScreen.tsx`: Linked to global photo state.
- `src/presentation/components/monitor/MonitorSidebar.tsx`: Linked to global photo state.
