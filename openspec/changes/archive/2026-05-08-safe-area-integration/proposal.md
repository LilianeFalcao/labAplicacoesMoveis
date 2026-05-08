## Why

Early tests and user feedback indicate that the application UI often overlaps with system navigation elements (like the home indicator on iOS and navigation buttons on Android) and device notches. Ensuring that all screens, the header bar, and the tab navigation respect the device's safe areas is critical for a premium, production-grade mobile experience. Currently, the implementation is inconsistent, with some screens using standard `SafeAreaView` and others manually adjusting insets, leading to fragile layouts.

## What Changes

I will standardize Safe Area handling across the entire `bambole-app` codebase by:
1.  Refactoring `AppHeader` to use `useSafeAreaInsets` for precise control over the top inset, or wrapping it in a consistent `SafeAreaView` from `react-native-safe-area-context`.
2.  Adjusting `RoleTabs` to ensure the tab bar height and padding correctly account for the bottom safe area across all roles, keeping buttons fully visible and accessible above system navigation.
3.  Auditing and updating all 20+ screens (Admin, Monitor, Parent, Auth stacks) to follow a consistent pattern, likely using a combination of `SafeAreaView` and `useSafeAreaInsets` where appropriate (e.g., for headers and footers).

## Capabilities

### New Capabilities
- `safe-area-standardization`: Implement a consistent, project-wide pattern for handling safe area insets at the layout level, ensuring no UI overlaps with system elements on any device.

### Modified Capabilities
- `navigation-ux`: Update navigation components (Tabs and Stacks) to better integrate with device safe areas, improving interaction ergonomics.

## Impact

- **Affected Components**: `AppHeader`, `RoleTabs`, all screen components in `src/presentation/screens`.
- **Dependencies**: Deep integration with `react-native-safe-area-context`.
- **User Experience**: Improved visual quality and accessibility on modern mobile devices.
