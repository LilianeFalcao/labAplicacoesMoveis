## 1. Monitor Stack Refactor

- [x] 1.1 Remove `shadow*` properties from `footer` in [AttendanceScreen.tsx](file:///home/alunos/Desktop/www/linnr/bambole-app/src/presentation/screens/monitor/AttendanceScreen.tsx).
- [x] 1.2 Remove shadows from the FAB in [GroupAgendaScreen.tsx](file:///home/alunos/Desktop/www/linnr/bambole-app/src/presentation/screens/monitor/GroupAgendaScreen.tsx) and verify its position above the tab bar.
- [x] 1.3 Audit and remove elevation/shadows from [PhotoCaptureScreen.tsx](file:///home/alunos/Desktop/www/linnr/bambole-app/src/presentation/screens/monitor/PhotoCaptureScreen.tsx).

## 2. Admin Stack Refactor

- [x] 2.1 Audit [CreateAnnouncementScreen.tsx](file:///home/alunos/Desktop/www/linnr/bambole-app/src/presentation/screens/admin/CreateAnnouncementScreen.tsx) and remove any footer-related shadows.
- [x] 2.2 Audit [GroupManagementScreen.tsx](file:///home/alunos/Desktop/www/linnr/bambole-app/src/presentation/screens/admin/GroupManagementScreen.tsx) and [MonitorManagementScreen.tsx](file:///home/alunos/Desktop/www/linnr/bambole-app/src/presentation/screens/admin/MonitorManagementScreen.tsx) for layout consistency.
- [x] 2.3 Verify all admin action buttons are positioned above the navigation bar/safe area without absolute floating shadows.

## 3. Verification

- [x] 3.1 Perform a visual audit of both Monitor and Admin roles to ensure a uniform "flat" UI for footers.
- [x] 3.2 Confirm that no screen uses `elevation: 20` for footer-like elements.
