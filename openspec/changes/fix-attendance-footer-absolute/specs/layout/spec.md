## ADDED Requirements

### Requirement: Integrated Layout Footer
The footer in the Attendance screen must NOT be positioned absolutely. It must follow a static flex layout where it is pushed to the bottom of the screen container but remains as a separate block that the list does not scroll under.

### Requirement: Attendance Progress Information
The footer must display the progress of the attendance call.
- Text: "[X] de [Y] marcados" (where X is the number of marked students and Y is the total).
- Visual: A small horizontal progress bar representing the percentage of marked students.

### Requirement: Action Button Styling
- Label: "Confirmar Chamada"
- Icon: MaterialCommunityIcons "arrow-right" on the right side of the text.
- Color: Primary blue.

#### Scenario: Layout Visibility
- **WHEN** the student list is long.
- **THEN** the footer should remain visible at the bottom of the screen, but the last student card in the list should only reach the top of the footer section, never overlapping it.
