## 1. Sub-Components Implementation

- [x] 1.1 Create `MonitorSummaryCard.tsx` with support for color themes and distinct icons
- [x] 1.2 Create `TurmaAgendaCard.tsx` with conditional rendering for Pending, Completed, and Upcoming statuses
- [x] 1.3 Implement `TurmaDetailItem` for consistent metadata display (Age, Students, Time, Location)

## 2. Dashboard Refactor

- [x] 2.1 Update `MonitorHomeScreen.tsx` to include the Metric Summary section at the top
- [x] 2.2 Redesign the header to include the Drawer menu, Title, and Notifications
- [x] 2.3 Implement the "Solicitar Turma" primary action button in the header section
- [x] 2.4 Replace the old horizontal/simple turma list with the new `TurmaAgendaCard` list

## 3. Interaction & Styles

- [x] 3.1 Implement a Floating Action Button (FAB) at the bottom right for new activity requests
- [x] 3.2 Add "Ver tudo" navigation links to sections
- [x] 3.3 Ensure the layout follows the professional typography and spacing of the design reference

## 4. Verification

- [x] 4.1 Verify the responsive layout of the summary cards on different screen widths
- [x] 4.2 Validate the visual state transitions for different turma statuses
- [x] 4.3 Ensure no regression in existing navigation (e.g., clicking a card still navigates to the details/agenda)
