## ADDED Requirements

### Requirement: Friendly Class Name Display
The system SHALL replace technical UUID class identifiers with their corresponding user-friendly class names in student cards.

#### Scenario: Active class assignment
- **WHEN** the student cards are loaded and a child has a valid `classId`
- **THEN** the system SHALL resolve and display the corresponding friendly class name (e.g., "🏫 Turma: Jardim II")

#### Scenario: No class assignment
- **WHEN** the student cards are loaded and a child does not have an assigned `classId`
- **THEN** the system SHALL display a "Sem turma" badge indicator

### Requirement: Current Linked Guardians List
Each student card SHALL display a list of all current linked guardians with their full name and email address.

#### Scenario: Student with linked guardians
- **WHEN** the student cards are loaded and the student has one or more linked guardians
- **THEN** the card SHALL render a list containing each guardian's full name and email in a clean, readable layout

#### Scenario: Student with no linked guardians
- **WHEN** the student cards are loaded and the student has no linked guardians
- **THEN** the card SHALL render an attention badge with the text "⚠️ Nenhum responsável vinculado"

### Requirement: Smart Autocomplete Parent Selection
The Guardian Link Modal SHALL replace the plain e-mail text input with a real-time autocomplete search field that allows filtering and selecting parents by name or email.

#### Scenario: Filtering parent users
- **WHEN** the administrator inputs text into the search field inside the Guardian Link Modal
- **THEN** the system SHALL dynamically filter the list of all registered parents, matching by name or email address

#### Scenario: Selecting a parent from suggestions
- **WHEN** the administrator taps on a parent user from the dynamic autocomplete suggestion list
- **THEN** the system SHALL select that parent user, update the search input to reflect the selection, and populate the linking email state with the chosen parent's email
