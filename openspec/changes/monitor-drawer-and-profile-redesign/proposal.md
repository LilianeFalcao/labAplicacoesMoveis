# Proposal: Monitor Drawer and Profile Redesign

## Why

The current monitor interface has an unused "sandwich menu" icon and a profile screen that is becoming cluttered with navigation links. By implementing a Drawer (sidebar), we can separate "Operational Navigation" (Classes, History, Support) from "Account Management" (Profile, Settings). This aligns with modern mobile UX patterns and makes the app more efficient for the monitor's daily use.

## What Changes

1.  **Drawer Integration**:
    *   Implement `@react-navigation/drawer`.
    *   Create a `MonitorDrawer` navigator that wraps the `MonitorTabs`.
    *   Add Drawer items: "Início", "Minhas Turmas", "Histórico de Atividades", and "Suporte".
2.  **Monitor Profile Update**:
    *   Remove "Minhas Turmas" and "Histórico" from the Profile menu.
    *   Add a new "Resumo de Atividades" section with statistics cards (e.g., Photos taken today, Attendances recorded).
    *   Focus the profile on Identity, Settings, and Security.
3.  **Support Screen**:
    *   Create a simple `MonitorSupportScreen.tsx` placeholder.
4.  **Header Interactivity**:
    *   Update `MonitorHomeScreen.tsx` to open the drawer when the menu icon is pressed.
5.  **Dependencies**:
    *   Add `@react-navigation/drawer` and `react-native-reanimated` to `package.json`.

## Capabilities

### New Capabilities
- `monitor-drawer-navigation`: Access operational tools via a side drawer.
- `monitor-performance-metrics`: View daily activity statistics on the profile.

## Impact

- `src/presentation/navigation/stacks/RoleStacks.tsx`: Refactor `MonitorStack` to include the Drawer.
- `src/presentation/screens/monitor/MonitorProfileScreen.tsx`: Updated layout and logic for statistics.
- `src/presentation/screens/monitor/MonitorHomeScreen.tsx`: Hooked up the drawer toggle.
- `src/presentation/screens/monitor/MonitorSupportScreen.tsx`: New screen.
