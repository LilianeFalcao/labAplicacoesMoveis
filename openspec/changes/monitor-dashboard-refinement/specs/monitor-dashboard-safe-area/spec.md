## ADDED Requirements

### Requirement: Robust Safe Area Layout
The dashboard header and primary actions must remain visible and non-clipped across various device screen geometries (notches, dynamic islands, etc.).

#### Scenario: Header Rendering on Notched Device
- **WHEN** the Monitor Home screen is rendered on a device with a top notch
- **THEN** the custom header (menu, title, notifications) and the "Solicitar Turma" button must be fully visible and padded correctly from the screen edges.
