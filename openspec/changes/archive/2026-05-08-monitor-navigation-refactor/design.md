## Context

The monitor currently accesses key features (Attendance, Photos, Observations) through a "Quick Actions" grid on the dashboard. This creates a cluttered homepage and inconsistent navigation when compared to the Parent role.

## Goals / Non-Goals

**Goals:**
- Move all "Quick Actions" to the permanent bottom tab navigation.
- Expand `MonitorTabs` to include: Home, Attendance, Photos, Observations, and Profile.
- Remove redundant dashboard buttons from `MonitorHomeScreen`.

**Non-Goals:**
- Changing the functionality of the Attendance, Photo, or Observation screens.
- Modifying Admin or Parent navigation.

## Decisions

1. **Tab Navigator Expansion**: Add `Photos` and `Notices` routes to `MonitorTabsParamList`.
2. **Iconography**:
   - `Photos`: `camera-outline` (inactive) / `camera` (active).
   - `Notices`: `note-text-outline` (inactive) / `note-text` (active).
3. **Dashboard Cleanup**: Delete the `quickActionsSection` view in `MonitorHomeScreen.tsx`.
4. **Consistency**: Align the Monitor tab bar styling with the Parent tab bar (5 items).

## Risks / Trade-offs

- **Tab Overcrowding**: 5 items is the maximum recommended for a standard bottom tab bar.
  - *Mitigation*: Ensure labels are short and icons are distinct.
- **Deep Linking**: Any internal navigation that expected to "go back" to a dashboard button might need adjustment if it now resides in a root tab.
