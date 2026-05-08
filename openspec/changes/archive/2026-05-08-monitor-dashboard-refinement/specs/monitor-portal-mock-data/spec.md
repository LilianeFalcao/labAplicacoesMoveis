## ADDED Requirements

### Requirement: Centralized Mock Data
Dashboard content for the monitor portal must be managed in a centralized utility file to simplify testing and future backend migration.

#### Scenario: Data Consistency
- **WHEN** the Monitor Home screen renders its content
- **THEN** it retrieves the agenda items and summary metrics from the `MonitorMockData` utility.
- **AND** the data structure must match the `TurmaAgendaItem` domain interface.
