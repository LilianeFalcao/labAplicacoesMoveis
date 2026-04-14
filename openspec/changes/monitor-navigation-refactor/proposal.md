## Why

The current monitor dashboard contains a "Quick Actions" section that duplicates or competes with navigation. Moving these actions to the tab navigation provides a more standard mobile UX, improves reachability, and cleans up the home feed to focus on primary content like group schedules and active status.

## What Changes

- **MonitorTabs**: Expand the tab bar from 3 to 5 items: Home, Attendance, Photos, Observations, and Profile.
- **MonitorHomeScreen**: Remove the "Quick Actions" grid (Attendance, Photo, Observations) from the scrollable feed.
- **Navigation logic**: Ensure all deep-linked actions from the old dashboard buttons are correctly pointed to the new tab routes.

## Capabilities

### New Capabilities
- `monitor-tab-navigation`: Enhanced tab navigation for monitors, including direct access to activity photos and observations.
- `monitor-dashboard-cleanup`: Refactored dashboard for monitors, focusing on current turmas and alerts.

### Modified Capabilities
- `monitor-navigation-flow`: Updated routing and screen assignments for the monitor role.

## Impact

- **UI Components**: `MonitorHomeScreen.tsx` will be simplified.
- **Navigation**: `RoleTabs.tsx` and `types.ts` will be updated with new tab definitions.
- **UX**: Improved accessibility to core features through persistent bottom navigation.
