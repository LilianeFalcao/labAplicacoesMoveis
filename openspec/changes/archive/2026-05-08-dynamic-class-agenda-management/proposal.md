# Proposal: Dynamic Class Agenda Management

## Why

The current class agenda in the monitor's dashboard is a static placeholder. For a recreation monitor, the agenda is the heart of their shift. They need to know what's next, mark activities as finished, and stay on track with the schedule. Making the agenda dynamic will allow monitors to actively manage their day, track progress, and ensure no activity is missed.

## What Changes

1.  **Agenda Data Model**:
    *   Create a `ClassActivity` entity with properties like `startTime`, `endTime`, `title`, `description`, and `status` (Pending, Ongoing, Completed).
2.  **Dynamic Agenda UI**:
    *   Refactor the agenda display in the monitor's dashboard to render a list of dynamic activities.
    *   Implement an interactive checklist where monitors can toggle the status of an activity.
3.  **Real-time Progress**:
    *   Add a progress indicator (e.g., "3/5 atividades concluídas") to the agenda section.
4.  **Contextual Actions**:
    *   Allow monitors to directly start a photo capture or incident report linked to a specific agenda activity.
5.  **Mock Repository Update**:
    *   Implement `MockAgendaRepository` to provide daily activities for different classes.

## Capabilities

### New Capabilities
- `monitor-agenda-tracking`: Ability to view and update the status of scheduled class activities.
- `monitor-agenda-progress-view`: Visual feedback on the completion status of the day's agenda.

## Impact

- `src/presentation/screens/monitor/MonitorHomeScreen.tsx`: Updated to render dynamic agenda cards.
- `src/presentation/components/monitor/TurmaAgendaCard.tsx`: Enhanced with interactive states and checkboxes.
- `src/infrastructure/activity/repositories/MockAgendaRepository.ts`: New repository for agenda data.
