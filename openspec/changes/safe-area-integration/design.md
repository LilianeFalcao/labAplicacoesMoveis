## Context

The `bambole-app` currently has fragmented safe area handling. `AppHeader` uses `SafeAreaView` from `react-native`, while `RoleTabs` uses `useSafeAreaInsets` for dynamic padding. Some screens use `SafeAreaView` at the root, while others use a `View` with manual padding. This leads to inconsistent UI behavior across different Android and iOS devices.

## Goals / Non-Goals

**Goals:**
- Standardize on `react-native-safe-area-context` for all safe area needs.
- Ensure the Tab Bar buttons are always vertically centered in their safe-padded area or consistently positioned above the home indicator.
- Ensure the `AppHeader` handles top insets correctly, including the simulation mode banner.
- Audit and fix all 20+ screens to ensure content doesn't bleed into unsafe areas.

**Non-Goals:**
- Redesigning the visual look of the components (except for spacing/padding).
- Implementing global state management for safe area (relying on the existing `SafeAreaProvider` and hooks).

## Decisions

- **Decision: Standardize on `useSafeAreaInsets` hook**: For core components like `AppHeader` and `RoleTabs`, `useSafeAreaInsets` provides the most granular control over padding and height adjustments.
- **Decision: Root `SafeAreaView` for simple screens**: For screens without complex fixed headers/footers, we will use the `SafeAreaView` from `react-native-safe-area-context` at the root for simplicity.
- **Decision: Manual Insets for Complex Layouts**: For screens with fixed components (like `AttendanceScreen`'s footer), we will use `useSafeAreaInsets` to add padding-bottom to the scroll content and the footer itself.

## Risks / Trade-offs

- **Risk: Layout shifts on Android**: Some Android devices report safe areas inconsistently depending on whether the navigation bar is shown or hidden. We must ensure our paddings are robust against these variations.
- **Trade-off: Complexity vs Simplicity**: Using hooks everywhere adds slightly more boilerplate than a simple wrapper, but is necessary for the level of control requested by the user.
