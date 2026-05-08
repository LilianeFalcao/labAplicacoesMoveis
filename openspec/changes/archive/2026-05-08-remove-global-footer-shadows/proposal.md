## Why

The current UI in several monitor and admin screens uses a "heavy shadow" pattern (elevation 20, absolute positioning) for footers. This creates a floating effect that overlaps content and feels disconnected from the navigation tab bar. Standardizing these to a static flex layout without shadows will create a cleaner, more integrated professional experience.

## What Changes

- **Shadow Removal**: Remove `elevation`, `shadowColor`, `shadowOffset`, `shadowOpacity`, and `shadowRadius` properties from all footer containers in monitor and admin screens.
- **Layout Refactor**: Ensure all screens with action buttons at the bottom use a static flex layout instead of `position: absolute`, ensuring they sit naturally above the tab bar.
- **Screens Affected**:
    - **Monitor**: `AttendanceScreen.tsx`, `GroupAgendaScreen.tsx` (FAB/Footer), `PhotoCaptureScreen.tsx`.
    - **Admin**: Audit of all screens to ensure no floating shadows remain.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- None (Presentation only)

## Impact

- **UX**: More consistent and predictable screen layouts; better interaction with the home indicator and tab bar.
- **UI**: Cleaner, "flat" modern aesthetic aligned with the project's evolving design system.
