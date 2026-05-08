# Tasks: Dynamic Class Agenda Management

- [x] Repository Implementation
    - [x] Create `src/infrastructure/activity/repositories/MockAgendaRepository.ts`
    - [x] Populate mock data with at least 5 activities for the monitor's main class
- [x] Component Refactoring
    - [x] Update `src/presentation/components/monitor/TurmaAgendaCard.tsx` to handle dynamic data and interactivity
    - [x] Add checkbox and completion visual states to the card
- [x] Dashboard Integration
    - [x] Fetch dynamic agenda data in `MonitorHomeScreen.tsx`
    - [x] Implement the `toggleActivityStatus` function in the Home screen
    - [x] Add the agenda progress bar and stats (e.g., "X de Y concluídas")
- [x] Verification
    - [x] Verify that clicking an activity toggles its completed state
    - [x] Confirm that completed activities change their visual appearance
    - [x] Verify the progress bar updates correctly when an activity status changes
