## 1. Type Definitions

- [x] 1.1 Add `Photos` and `Notices` routes to `MonitorTabsParamList` in `src/presentation/navigation/types.ts`

## 2. Navigation Refactor

- [x] 2.1 Update `MonitorTabs` in `src/presentation/navigation/tabs/RoleTabs.tsx` to include "Fotos" and "Avisos" screens
- [x] 2.2 Reassign `PhotoCaptureScreen` and `MonitorObservationsScreen` as base tab components

## 3. Dashboard Cleanup

- [x] 3.1 Remove the `quickActionsSection` from `src/presentation/screens/monitor/MonitorHomeScreen.tsx`
- [x] 3.2 Adjust scroll view padding and layout for the new simplified look

## 4. Verification

- [x] 4.1 Verify all monitor tabs are functional and intuitive
- [x] 4.2 Ensure no broken navigation links exist in other monitor screens
- [x] 4.3 Validate that the Home screen correctly displays the turma schedule without quick actions
