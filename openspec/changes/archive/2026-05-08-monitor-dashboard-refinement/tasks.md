## 1. Mock Data Integration

- [x] 1.1 Create `src/presentation/screens/monitor/MonitorMockData.ts` with comprehensive agenda and metrics data
- [x] 1.2 Update `MonitorHomeScreen.tsx` to import and consume data from `MonitorMockData.ts`

## 2. Layout & Clipping Fixes

- [x] 2.1 Update `MonitorHomeScreen.tsx` to ensure `SafeAreaView` edges include `top`
- [x] 2.2 Adjust the Title and Header containers to prevent clipping of the "Solicitar Turma" button
- [x] 2.3 Refine `ScrollView` content padding to ensure all cards are fully visible above the tab bar

## 3. Verification

- [ ] 3.1 Verify layout on small-screen devices to ensure the action button doesn't wrap or clip
- [ ] 3.2 Confirm that mock data is rendered correctly and consistently
