# Tasks: Implement Monitor Profile Screens

- [x] Navigation & Types
    - [x] Update `MonitorStackParamList` in `src/presentation/navigation/types.ts`
    - [x] Register screens in `MonitorStack` within `src/presentation/navigation/stacks/RoleStacks.tsx`
    - [x] Update `MonitorProfileScreen.tsx` to handle menu item presses using `useNavigation`
- [x] Infrastructure Updates
    - [x] Add `getFeedByMonitor()` to `MockActivityRepository`
    - [x] Add `getIncidentsByMonitor()` to `MockIncidentRepository`
- [x] Implementation of Screens
    - [x] Create `MonitorClassesScreen.tsx` (Reuse `TurmaAgendaCard` if possible)
    - [x] Create `ActivityHistoryScreen.tsx` with unified feed of photos and incidents
    - [x] Create `MonitorSettingsScreen.tsx` with theme management UI
- [x] Verification
    - [x] Verify navigation from Profile to all 3 screens
    - [x] Test filtering of history by the current monitor's ID
    - [x] Confirm settings correctly reflect the current app state
