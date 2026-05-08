## Context

The monitor dashboard layout currently exhibits clipping on some device models, particularly in the header/title row area. The hardcoded data within the component also makes it inflexible.

## Goals / Non-Goals

**Goals:**
- Fix the clipping of the "Solicitar Turma" action and other header elements.
- Centralize mock data for the monitor portal.
- Ensure consistent spacing across different device insets.

**Non-Goals:**
- Changes to the visual style of the cards already implemented.
- Real backend integration.

## Decisions

1. **Safe Area Strategy**:
   - Update `MonitorHomeScreen` to use `edges={['top', 'left', 'right']}` on the `SafeAreaView` OR ensure the custom header correctly pads all child elements including the subsequent title row.
   - Increase bottom padding on the `ScrollView` to ensure the list doesn't get hidden behind the tab bar or FAB.

2. **Mock Data Utility**:
   - New file: `src/presentation/screens/monitor/MonitorMockData.ts`.
   - Export structured `TurmaAgendaItem[]` and dashboard stats.
   - Define a `MonitorDashboardData` interface.

3. **Layout Tweak**:
   - Add extra `paddingHorizontal: Theme.spacing.lg` to the `titleRow` if it was somehow escaping the container's padding.
   - Adjust `solicitarBtn` padding to be more compact if width is the issue on smaller screens.

## Risks / Trade-offs

- **Mock Data Maintenance**: Mock data needs to be kept in sync with domain models.
  - *Mitigation*: Use the already defined `TurmaAgendaItem` interface.
