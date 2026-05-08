## Why

Currently, the Bambolê application handles activity photos for monitors and profile photos for children (managed by admins). To improve the personalization and identification within the school community, users expect to be able to set their own profile photos. This contributes to a safer and more welcoming environment for parents and staff.

## What Changes

We will introduce profile photo capture and management for all user roles:
- **Parents**: Can update their personal profile photo.
- **Monitors**: Can update their personal profile photo.
- **Administrators**: Can update their personal profile photo.

Since some roles (Monitor and Admin) currently lack a dedicated profile screen in their tab navigation, we will also introduce these screens or integrate the profile management actions into their existing headers/dashboards.

## Capabilities

### New Capabilities
- `profile-photo-management`: Generic capability for capturing, previewing, and storing user profile photos.
- `parent-profile-management`: Specific UI integration for parents to manage their own data.
- `monitor-profile-management`: Specific UI integration and screen for monitors for self-management.
- `admin-profile-management`: Specific UI integration and screen for administrators for self-management.

### Modified Capabilities
- `camera-infrastructure`: Expanding the service to handle user-scoped storage (conceptual change for future implementation).

## Impact

- **UI Components**: New or updated profile screens for all roles.
- **Navigation**: Update `RoleTabs` and `RoleStacks` to include new profile routes.
- **Infrastructure**: Reuse `ExpoCameraService` and `ICameraService` for all capture flows.
