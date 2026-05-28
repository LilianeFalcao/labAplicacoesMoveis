## ADDED Requirements

### Requirement: Admin Notification on Monitor Access Request
The system SHALL notify all registered administrators via push notification in real-time whenever a monitor submits a request for temporary class access.

#### Scenario: Submitting access request
- **WHEN** a monitor submits a request for temporary access to a class
- **THEN** the system SHALL save the access request as pending and SHALL send a push notification to all administrator devices.
