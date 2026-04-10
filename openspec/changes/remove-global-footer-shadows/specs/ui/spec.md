## ADDED Requirements

### Requirement: Shadow-Free Footers
All footer containers in the Monitor and Admin roles must NOT use any of the following styling properties:
- `elevation`
- `shadowColor`
- `shadowOffset`
- `shadowOpacity`
- `shadowRadius`

### Requirement: Visual Separation
Separation between the main screen content (e.g., a list) and the bottom footer must be achieved using:
- `borderTopWidth: 1`
- `borderTopColor: Theme.colors.gray[100]`

### Requirement: Tab Bar Integration
Footers containing action buttons must be part of the Flexbox layout flow (non-absolute) so they are positioned predictably above the navigation tab bar without overlapping content.

#### Scenario: Footer Appearance
- **WHEN** viewing any monitor screen with a bottom button (e.g., Attendance, Photo Capture).
- **THEN** the footer should appear flat against the background, with a subtle divider line separating it from the list above.
