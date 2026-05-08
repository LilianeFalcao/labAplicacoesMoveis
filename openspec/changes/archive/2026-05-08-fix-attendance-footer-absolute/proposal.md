## Why

The current implementation of the monitor's attendance screen uses an absolute-positioned footer that floats over the student list. This can obscure content and creates a less integrated visual experience. The desired design, as seen in `docs/chamada_de_presenca_monitor.png`, requires a footer that is part of the main layout flow, situated below the list, and includes status information like the count of marked students.

## What Changes

- **Layout Structural Change**: Remove `position: absolute` from the footer and place it as a subsequent sibling to the `FlatList` within a flex container.
- **UI Alignment**: Move the "marked students" stats (e.g., "14 de 16 marcados") from the header/stats badge to the footer area, aligned with the reference image.
- **Button styling**: Adjust the button width and margins to ensure it follows the "full width with padding" pattern seen in the design docs.
- **Safe Area Respect**: Ensure the new non-floating footer correctly handles bottom safe area insets without duplicating padding.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- None: This is a purely presentation-level layout refactor.

## Impact

- **UX**: Clearer separation between content and actions; no overlapping elements.
- **Files Affected**: `bambole-app/src/presentation/screens/monitor/AttendanceScreen.tsx`.
