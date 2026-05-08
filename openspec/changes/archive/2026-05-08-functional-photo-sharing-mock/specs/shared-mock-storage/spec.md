## ADDED Requirements

### Requirement: Persistent Mock Data
The system SHALL use a single shared instance of the `MockActivityRepository` during the app session.

#### Scenario: Shared state across screens
- **WHEN** a monitor saves a photo in the Monitor tab
- **AND** the user switches to the Parent tab
- **THEN** the photo SHALL be available in the Parent feed without a page reload.

## MODIFIED Requirements

### Requirement: Monitor Class Selection
The system SHALL allow the monitor to select a class from their assigned list before capturing or saving a photo.

#### Scenario: Selection from assigned classes
- **WHEN** the monitor opens the photo capture screen
- **THEN** they see a list of their assigned classes (e.g., Futebol, Artes)
- **WHEN** they select a class and save a photo
- **THEN** the photo SHALL be associated with that class ID.

### Requirement: Parent-Child Dynamic Filtering
The system SHALL filter the activity feed based on the enrolled classes of the parent's children.

#### Scenario: Multi-child feed
- **WHEN** a parent has one child in Class 1 and another in Class 2
- **THEN** the feed SHALL display photos from both Class 1 and Class 2.
