## ADDED Requirements

### Requirement: View Activity Feed
The system SHALL provide a chronological feed of activity photos for the parent.

#### Scenario: Successful feed retrieval
- **WHEN** a parent with a child in class "Class A" views the activity feed
- **THEN** they see photos captured by monitors for "Class A" in descending order of capture time.

### Requirement: Filter by Class
The feed SHALL only display photos from classes where the parent has at least one child enrolled.

#### Scenario: Child enrolled in multiple classes
- **WHEN** a parent has one child in "Class A" and another in "Class B"
- **THEN** the feed displays photos from both "Class A" and "Class B".

### Requirement: Image Visibility Consent
The system MUST ONLY display photos to parents who have provided mandatory image consent for their children.

#### Scenario: Consent not provided
- **WHEN** a parent has not accepted the image consent agreement
- **THEN** the system displays a placeholder or a request to provide consent instead of the activity photos.
