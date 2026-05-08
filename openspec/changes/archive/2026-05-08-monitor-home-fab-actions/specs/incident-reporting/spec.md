# Capability: Incident Reporting

## Requirements

### Requirement: Digital Incident Creation
O monitor deve ser capaz de registrar um incidente digitalmente, incluindo descrição e evidências fotográficas.

#### Scenario: Reporting a medical incident
- **GIVEN** a monitor is on the Home screen
- **WHEN** they open the Speed Dial and select "Relatar Incidente"
- **AND** they select the affected student (optional) and type "Criança caiu e ralou o joelho"
- **AND** they attach a photo of the knee
- **THEN** the system should save the record with an "Emergency" flag and notify the administrator.

# Capability: Multi-class Communication

## Requirements

### Requirement: Cross-class Announcement
O monitor deve ser capaz de enviar um único aviso para todas as suas turmas ativas de uma só vez.

#### Scenario: Warning about weather change
- **GIVEN** a monitor manages "Turma A" and "Turma B"
- **WHEN** they select "Comunicado Global" from the FAB
- **AND** they select both "Turma A" and "Turma B"
- **AND** they type "Estamos entrando devido à chuva"
- **THEN** parents of both classes should receive the push notification simultaneously.
