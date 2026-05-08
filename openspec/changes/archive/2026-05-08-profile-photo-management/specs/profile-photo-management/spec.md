## ADDED Requirements

### Requirement: Shared Profile Photo Capture
The system must provide a consistent way for all user roles to capture and preview a profile photo.

#### Scenario: Successful Photo Capture
- **WHEN** a user initiates a profile photo change and grants camera permissions
- **THEN** a circular overlay is displayed to help center the face, and the captured photo is shown as a preview before confirmation.

### Requirement: Permission Handling
The system must handle camera permission requests gracefully.

#### Scenario: Permission Denied
- **WHEN** a user denies camera access
- **THEN** an alert is shown explaining why the permission is needed, and the user remains on the profile screen with the previous photo (or default avatar).
