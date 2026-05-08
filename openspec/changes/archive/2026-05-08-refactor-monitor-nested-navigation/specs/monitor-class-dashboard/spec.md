## ADDED Requirements

### Requirement: Nested Class Dashboard
O aplicativo deve prover um ambiente isolado (dashboard) para as rotinas operacionais de uma turma específica (Chamada, Fotos, Avisos, Agenda), garantindo que essas operações ajam sempre sobre o escopo da turma explicitamente selecionada.

#### Scenario: Navigating to Class Dashboard
- **WHEN** the monitor selects a class from the 'Minhas Turmas' list on the Home screen
- **THEN** the app transitions to the Class Dashboard nested navigation, pushing a new route state that automatically provides the selected `classId` to all internal tabs (Attendance, Photos, Notices, Agenda)

#### Scenario: Consistent Class Context
- **WHEN** the monitor switches between the Attendance, Photos, Notices, and Agenda tabs within the Class Dashboard
- **THEN** the context (`classId`) remains securely and immutably bound to the originally selected class without falling back to mock or undefined states

#### Scenario: Exiting the Class Dashboard
- **WHEN** the monitor is inside the Class Dashboard and presses the 'Back' button in the header
- **THEN** the nested dashboard is closed and popped from the stack, returning the user safely to the global Home screen (Minhas Turmas) to select another class
