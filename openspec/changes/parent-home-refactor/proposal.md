## Why

The "Quick Access" (Acesso Rápido) section on the Parent Home screen contains redundant or less frequently used actions that take up significant vertical space. Removing this section will allow the focus to shift to the core content: child activity tracking and important announcements (Notices).

## What Changes

- **Section Removal**: Delete the "ACESSO RÁPIDO" section from the `ParentHomeScreen`.
- **Layout Adjustments**: Adjust the remaining sections ("MEUS FILHOS", "AVISOS RECENTES") to fill the screen more naturally and improve readability.
- **Component Cleanup**: Remove unreferenced styles and icons related to the quick access grid.

## Capabilities

### New Capabilities
- `parent-dashboard-focus`: Streamlined dashboard focused on real-time content.

## Impact

- **UI Components**: `ParentHomeScreen.tsx` layout and style simplification.
- **UX**: Less cluttered home screen, prioritizing child status and school communications.
