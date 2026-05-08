## Why

The recent dashboard redesign introduced layout clipping issues where some elements, specifically the "Solicitar Turma" button, are cut off on certain device configurations. Additionally, the dashboard data is currently hardcoded within the screen component, making it difficult to maintain and test. Moving to a centralized mock data source will improve code quality and facilitate future backend integration.

## What Changes

- **Layout Refinement**: Adjust the `MonitorHomeScreen` header and container styles to respect `SafeAreaInsets` properly across different device models (avoiding top-bar clipping).
- **Centralized Mock Data**: Create a dedicated file for monitor dashboard mock data and update the home screen to consume it.
- **Scroll Optimization**: Ensure the scroll view and padding interact correctly with the new elements to avoid visual truncated content.

## Capabilities

### New Capabilities
- `monitor-dashboard-safe-area`: Robust safe area handling for the port-centric dashboard.
- `monitor-portal-mock-data`: Centralized domain-mapped mock data for monitor workflows.

## Impact

- **UI Components**: `MonitorHomeScreen.tsx` will be updated for layout and data consumption.
- **Data Layers**: Introduction of a new mock data utility.
- **UX**: Professional, non-clipped interface on all devices.
