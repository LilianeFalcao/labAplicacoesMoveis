## Why

The current monitor home screen is functional but lacks a clear information hierarchy and visual impact. Reorganizing the dashboard to include summary statistics and more detailed, status-driven activity cards will help monitors prioritize their tasks (like pending attendance) and provide a more premium, professional experience.

## What Changes

- **Início Screen (Monitor)**:
    - **Summary Section**: Introduction of cards showing "Active Turmas" and "Average Attendance".
    - **Agenda Section**: Redesigned list of daily activities using high-contrast cards with status badges (Pending, Completed, Upcoming).
    - **Information Density**: Adding specific details to turma cards (Age group, Alunos, Time, Location) with clear iconography.
    - **Header/FAB**: Moving actions like "Solicitar Turma" to a more prominent header action and adding a Floating Action Button for new operations.

## Capabilities

### New Capabilities
- `monitor-dashboard-summary`: Summary metrics for monitor workload.
- `monitor-dashboard-agenda-v2`: Enhanced information layout for daily activities.
- `monitor-dashboard-quick-actions`: Optimized placement for common monitor operations.

## Impact

- **UI Components**: Significant changes to `MonitorHomeScreen.tsx`. New sub-components for summary cards and detailed turma cards.
- **Visuals**: Alignment with modern design aesthetics (glassmorphism-lite, distinct color coding for statuses).
- **Navigation**: Home screen ONLY. NO changes to tab or stack navigation.
