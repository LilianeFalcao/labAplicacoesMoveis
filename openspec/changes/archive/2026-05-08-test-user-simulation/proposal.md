## Why

The user wants to preview all application screens (Admin, Monitor, and Parent) using a simulated test user with mocked data. This solves the problem of needing real authenticated accounts and complex data setups to review the UI/UX across different roles during development.

## What Changes

- Implement a "Simulated User" mode in the authentication flow.
- Add a specialized toggle or button on the Login screen to activate simulation.
- Provide mocked data for students, monitors, groups, and activities specifically for the simulation.
- Configure `AppNavigator` to handle simulated roles seamlessly.

## Capabilities

### New Capabilities
- `test-user-simulation`: A simulation layer that bypasses real auth and provides rich mocked data for UI/UX evaluation across all roles.

## Impact

- **Auth Layer**: Minor change to `useAuth` or `AuthContext` to support a non-persistent simulation state.
- **UI**: Add simulation trigger to `LoginScreen`.
- **Navigation**: `AppNavigator` will consume the simulated role.
- **Mocks**: New mocked data sets for the simulation.
