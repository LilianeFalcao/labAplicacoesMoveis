## Why

The monitor's "Attendance" screen currently exhibits a layout distortion where an incorrect vertical gap exists between the "Finalizar Chamada" footer button and the system's tab bar/home indicator. This issue likely stems from redundant safe area paddings being applied simultaneously by a `SafeAreaView` container and manual inset calculations in the footer style.

## What Changes

- **Style Refinement**: Update `AttendanceScreen.tsx` to ensure `insets.bottom` is not applied twice when a `SafeAreaView` with `edges={['bottom']}` is also present.
- **Layout Alignment**: Adjust the footer positioning to ensure the button is correctly placed above the tab bar with standard spacing, improving visual consistency and touch targets.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- None: This is a purely presentation-level UI fix.

## Impact

- **UI/UX**: Improved visual alignment on modern devices with notches or software-based navigation bars.
- **Files Affected**: `bambole-app/src/presentation/screens/monitor/AttendanceScreen.tsx`.
