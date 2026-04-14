## ADDED Requirements

### Requirement: Hide unauthenticated navigation options
The login screen must not display navigation options (menu, notifications) that require an authenticated session.

#### Scenario: User visits login screen
- **WHEN** the user is on the login screen (unauthenticated)
- **THEN** the menu icon (hamburger) should not be visible
- **THEN** the notification icon (bell) should not be visible
- **THEN** the application logo remains centered
