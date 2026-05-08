## Context

The `AttendanceScreen` is a child of the `MonitorStack`, which is hosted within a `RoleTabs` (bottom tab navigator). Our previous safe area standardization applied `insets.bottom` to fixed footers across all screens. However, screens within a tab navigator already have their bottom boundary set by the tab bar, which itself handles the device's bottom safe area. Applying `insets.bottom` again in the footer style creates an unnecessary double gap.

## Goals / Non-Goals

**Goals:**
- Eliminate the redundant vertical gap between the attendance footer and the tab bar.
- Ensure the "Finalizar Chamada" button is visually centered and vertically consistent with other UI elements.
- Maintain proper interaction safety.

**Non-Goals:**
- Changing the overall color scheme or button styles.
- Modifying the tab bar implementation itself.

## Decisions

- **Remove Redundant Insets**: Modify [AttendanceScreen.tsx](file:///home/alunos/Desktop/www/linnr/bambole-app/src/presentation/screens/monitor/AttendanceScreen.tsx) to remove `insets.bottom` from the `footer` style's `paddingBottom`.
- **Spacing Standardization**: Use only `Theme.spacing.md` (or a similar constant) for the footer's bottom padding to provide consistent internal whitespace.
- **SafeAreaView Edge Review**: Ensure the root `SafeAreaView` in the screen does not apply a bottom edge if the tab bar is present, or verify that it doesn't conflict with absolute-positioned footers.

## Risks / Trade-offs

- **Risk**: Content might be too close to the tab bar on devices with very small safe areas.
- **Trade-off**: By removing the inset, we rely more on the navigator's layout, which is generally more stable for tab-based screens.
