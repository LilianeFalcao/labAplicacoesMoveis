## 1. UI Refactor

- [x] 1.1 Update [AttendanceScreen.tsx](file:///home/alunos/Desktop/www/linnr/bambole-app/src/presentation/screens/monitor/AttendanceScreen.tsx) container structure to use a non-absolute footer layout.
- [x] 1.2 Implement the progress indicator ("X de Y marcados") and progress bar in the footer area.
- [x] 1.3 Update the action button label to "Confirmar Chamada" and add the "arrow-right" icon.
- [x] 1.4 Remove the redundant `statsBadge` from the `headerInfo` section.

## 2. Verification

- [x] 2.1 Visually compare the screen against `docs/chamada_de_presenca_monitor.png`.
- [x] 2.2 Confirm that the list correctly scrolls and ends at the top of the footer without overlapping.
- [x] 2.3 Verify bottom safe area padding is appropriate for the non-absolute footer.
