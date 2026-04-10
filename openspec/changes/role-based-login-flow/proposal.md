## Why

The current "Preview App" functionality is hidden behind an Alert dialog, making it less intuitive for stakeholders to explore different user flows (Parent, Monitor, Admin). Integrating a role-based login mechanism directly into the login screen with rich mocked data will streamline testing and demonstrate the app's multi-role capabilities more effectively.

## What Changes

- **Login Screen UI Enhancement**: Replace the `Alert`-based preview with an integrated role selection component (e.g., segmented control or role chips).
- **AuthContext Enrichment**: Update `signIn` and `startSimulation` to populate full user profiles (names, specific permissions, linked data) based on the selected role.
- **Mock Account Integration**: Provide "Quick Login" buttons or pre-filled credentials for each role type.
- **Role-Based Redirection**: Ensure the `AppNavigator` seamlessly transitions users to their respective stack after a mock login.

## Capabilities

### New Capabilities
- **Direct Role Selection**: Users can choose their role directly on the login screen.
- **Rich Mock Data**: Mocked sessions will now include role-specific data (e.g., specific student lists for Monitors, dashboard stats for Admins).

### Modified Capabilities
- **AuthContext.signIn**: Will now accept optional role overrides for immediate redirection.

## Impact

- **User Story**: As a developer/tester, I can quickly switch between Parent, Monitor, and Admin views without repeated alert dialogs.
- **UX**: Improved onboarding for first-time users by clearly showing the different portals available in the app.
