## Context

The application has implemented screens for three roles: Parent, Monitor, and Administrator. Currently, navigating between these requires an authenticated user with a specific role record in the database. To facilitate UI/UX review, we need a way to simulate these roles instantly.

## Goals / Non-Goals

**Goals:**
- Provide a entry point on the Login screen to start a simulation.
- Allow the user to select between "Parent", "Monitor", and "Admin" roles.
- Inject a mock user object into the `AuthContext` to trigger the correct `AppNavigator` stack.
- Display a clear "SIMULATION MODE" indicator in the app UI.
- Provide a simple way to exit the simulation and return to the real login screen.

**Non-Goals:**
- Persistence of simulate state across app restarts (intentional).
- Integration with real Supabase authentication.
- Saving any data modified during the simulation.

## Decisions

- **Entry Point**: A "Preview Role-Based UI" button will be added below the Login button.
- **Role Selection**: A simple `ActionSheet` or `Alert` with options (Parent, Monitor, Admin) will appear upon clicking the preview button.
- **Context Injection**: The `AuthContext` will be updated to include a `simulatedUser` property. When this is set, the app will treat it as a logged-in session for navigation purposes.
- **Visual Indicator**: An overlay banner or a modified `AppHeader` will show "Modo de Pré-visualização" to ensure the user knows data is not real.
- **Mock Data**: We will use standardized "DEMO" IDs (e.g., `DEMO_CLASS_01`, `DEMO_PARENT_01`) to ensure the mocked screens have data to display.

## Risks / Trade-offs

- **Security**: Must ensure that simulated users cannot accidentally trigger real API calls. This will be guarded by checking the `isSimulated` flag in the repository layer if necessary.
- **State Confusion**: The simulation is volatile. Navigating away or refreshing the app will reset it. This is acceptable for its intended purpose of rapid UI review.
