# Proposal: Implement Monitor Profile Screens

## Why

The current monitor profile screen lists three options ("Minhas Turmas", "Histórico de Atividades", and "Configurações"), but they are currently non-functional. Implementing these screens will allow monitors to manage their assigned groups, review past activity logs, and customize their app experience (including dark mode, which is already a planned feature).

## What Changes

1.  **Monitor Classes Screen**: A detailed list of all classes assigned to the monitor, with status and key information.
2.  **Activity History Screen**: A chronological feed of all activities performed by the monitor (attendance taken, photos uploaded, incidents reported).
3.  **Monitor Settings Screen**: A place to manage preferences, specifically the Dark Mode toggle (syncing with the system or manual override).
4.  **Navigation**: Register these new screens in the `MonitorStack`.
5.  **Profile Linking**: Update `MonitorProfileScreen.tsx` to navigate to these screens when the menu items are pressed.

## Capabilities

### New Capabilities
- `monitor-classes-management`: View and manage assigned classes from the profile.
- `monitor-activity-review`: Access historical logs of performed actions.
- `monitor-preferences`: Manage app settings like theme and notifications.

## Impact

- `src/presentation/navigation/types.ts`: Added new routes to `MonitorStackParamList`.
- `src/presentation/navigation/stacks/RoleStacks.tsx`: Registered new screens in `MonitorStack`.
- `src/presentation/screens/monitor/MonitorProfileScreen.tsx`: Added navigation logic to menu items.
- `src/presentation/screens/monitor/MonitorClassesScreen.tsx`: New screen.
- `src/presentation/screens/monitor/ActivityHistoryScreen.tsx`: New screen.
- `src/presentation/screens/monitor/MonitorSettingsScreen.tsx`: New screen.
