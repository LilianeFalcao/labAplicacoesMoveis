## 1. Navigation Infrastructure

- [x] 1.1 Create `ClassDashboardTabs.tsx` in `src/presentation/navigation/tabs/`. This component should configure a BottomTabNavigator containing `Attendance`, `Photos`, `Notices`, and `Agenda`. It must extract `classId` and `groupName` from its root route params and pass them down or ensure they are available to children.
- [x] 1.2 Update `src/presentation/navigation/types.ts` to include the new `ClassDashboardTabsParamList` and properly type the `MonitorStackParamList` to include the nested dashboard route.

## 2. Refactoring Root Navigation

- [x] 2.1 Refactor `src/presentation/navigation/tabs/RoleTabs.tsx`. Remove `AttendanceScreen`, `PhotoCaptureScreen`, e `MonitorObservationsScreen` do `MonitorTabs`. Deixe apenas `Home` (MonitorHomeScreen) e `Profile` (MonitorProfileScreen).
- [x] 2.2 Refactor `src/presentation/navigation/stacks/RoleStacks.tsx`. Remove the duplicated standalone registrations for `Attendance`, `PhotoCapture`, `Observations`, and `GroupAgenda` from `MonitorStack`.
- [x] 2.3 Register the new `ClassDashboardTabs` component as a screen within the `MonitorStack` in `RoleStacks.tsx`.

## 3. Updating Screens & Interactions

- [x] 3.1 Update `src/presentation/screens/monitor/MonitorHomeScreen.tsx`. Change the `onAction` and `onPress` events of the `TurmaAgendaCard` to navigate to the new `ClassDashboard` route, passing `{ classId: item.id, groupName: item.name }` securely.
- [x] 3.2 Update `AttendanceScreen.tsx`, `PhotoCaptureScreen.tsx`, `MonitorObservationsScreen.tsx`, and `GroupAgendaScreen.tsx` to read the `classId` from their props or route state. Ensure they do NOT fallback to `'DEMO_CLASS_01'`, but instead fail gracefully or throw if `classId` is inexplicably missing.
