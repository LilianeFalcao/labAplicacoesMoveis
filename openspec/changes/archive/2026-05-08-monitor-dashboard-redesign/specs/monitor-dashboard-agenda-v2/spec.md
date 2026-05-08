## ADDED Requirements

### Requirement: Differentiated Agenda Cards
Daily activities must be represented by cards that clearly show their type, status, and metadata.

#### Scenario: Pending Attendance Card
- **WHEN** a turma has a "pending" attendance status
- **THEN** it displays a "Chamada Pendente" badge in red.
- **AND** a prominent "Realizar Chamada" button is visible at the bottom of the card.

#### Scenario: Completed Activity Card
- **WHEN** a turma attendance is complete
- **THEN** it displays a "Concluída" badge in green.
- **AND** it shows the "Finalizada às [Time]" metadata and a "Ver detalhes" link.

#### Scenario: Upcoming Activity Card
- **WHEN** a turma is scheduled for later
- **THEN** it displays an "Em breve" badge in light blue.
- **AND** it shows the student avatars and the scheduled time range.
