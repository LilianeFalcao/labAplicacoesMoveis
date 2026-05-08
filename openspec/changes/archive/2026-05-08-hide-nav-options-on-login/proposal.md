## Why

The current login screen displays menu and notification icons that are not relevant for unauthenticated users. Additionally, the specific actions associated with these icons (such as role-specific notifications) can only be determined after a successful login. Removing these icons provides a cleaner UI and avoids confusion about unavailable features.

## What Changes

- Removal of the "Menu" (hamburger) icon from the login screen header.
- Removal of the "Notifications" (bell) icon from the login screen header.
- Maintenance of the centered logo layout on the login screen.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `auth-flow`: Hide unauthenticated navigation options on the login screen.

## Impact

- `LoginScreen.tsx`: Header modification.
- UI/UX: cleaner entry point for all users.
