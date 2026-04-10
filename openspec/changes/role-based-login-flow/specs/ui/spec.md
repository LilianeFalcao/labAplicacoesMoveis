## ADDED Requirements

### Requirement: Role Quick-Access Cards
The Login screen must feature three distinct interactive cards representing the available user roles:
- **Responsável**: Redirection to `ParentStack`.
- **Monitor**: Redirection to `MonitorStack`.
- **Administrador**: Redirection to `AdminStack`.

### Requirement: One-Tap Redirection
- **GIVEN** the user is on the Login screen.
- **WHEN** the user taps any of the Role Quick-Access cards.
- **THEN** the application must instantly simulate a login session with the corresponding role and navigate to the associated home screen.

### Requirement: Profile Metadata
The mocked `User` object created during this flow must contain:
- A unique ID based on the role.
- A descriptive email address (e.g., `monitor@bambole.app`).
- The correct `UserRole` value object.

### Requirement: Visual Differentiation
The cards should be visually distinct (using icons and descriptive text) to clearly identify the different portals.
