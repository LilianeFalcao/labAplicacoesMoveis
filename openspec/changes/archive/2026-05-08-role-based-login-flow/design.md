## Context

The application currently supports three distinct roles (Parent, Monitor, Admin), each with its own navigation stack. We need to make it easier for developers and prospective users to enter these flows directly from the login screen using mocked data.

## Goals / Non-Goals

**Goals:**
- Provide clear visual selection for user roles on the Login screen.
- Improve the "Preview" flow to feel like a real login experience.
- Populate the `AuthContext` with detailed secondary data based on the chosen role.

**Non-Goals:**
- Implementing actual backend integration for role checking (this is a mock/frontend-first task).
- Redesigning the entire login UI (keep it consistent with existing styles).

## Decisions

- **UI Component**: We will implement a `RoleSelector` component. This will consist of three horizontal cards/buttons representing "Pais", "Monitor", and "Escola" (Admin).
- **Default State**: The login screen will still allow email/password entry, but "Quick Login" role buttons will be prominently displayed below the main form.
- **AuthContext Data**: When a role is selected, we will instantiate a `User` object with a pre-defined ID and Email associated with that role (e.g., `admin@escola.com`).
- **Persistence**: Simulated sessions will not be persisted in AsyncStorage to ensure a fresh start on each app reload during this development phase.

## Risks / Trade-offs

- **Security**: CLEARLY label these as "Simulated/Demo" accounts to avoid confusion with real production auth once implemented.
- **Complexity**: Adding more UI elements to the login screen might clutter the view. We will ensure the design remains clean and follows the current `Theme`.
