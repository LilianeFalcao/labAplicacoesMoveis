## ADDED Requirements

### Requirement: Optimized Footer Layout for Tab-Hosted Screens
Screens that are part of a tab navigator should not apply independent bottom safe area insets to their footers, as the tab bar already accounts for the device's bottom safe area.

#### Scenario: Verify Footer Alignment in Attendance Screen
- **WHEN** a monitor opens the Attendance screen for a class.
- **THEN** the "Finalizar Chamada" footer button should be positioned immediately above the tab bar with a standard `Theme.spacing.md` gap, rather than an additional `insets.bottom` gap.
