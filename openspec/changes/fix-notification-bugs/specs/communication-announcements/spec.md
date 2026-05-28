## ADDED Requirements

### Requirement: Robust Delivery of Targeted Announcements
The system SHALL ensure that announcements targeted to a specific class are correctly delivered to all guardians associated with that class without fragmenting the class identifier string.

#### Scenario: Dispatching class announcement
- **WHEN** an administrator sends an announcement targeted at a specific class (e.g., "TURMA_A")
- **THEN** the system SHALL save exactly one announcement record in the database for that class and SHALL fetch push notification tokens using the complete class identifier to send notifications.
