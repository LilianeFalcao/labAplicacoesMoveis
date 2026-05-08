## 1. Core Component Refactoring

- [x] 1.1 Update `AppHeader` in `src/presentation/components/base/AppHeader.tsx` to use `useSafeAreaInsets` instead of standard `SafeAreaView`, ensuring top margin accounting for simulation banner and status bar.
- [x] 1.2 Refactor `RoleTabs` in `src/presentation/navigation/tabs/RoleTabs.tsx` to dynamically adjust `tabBarStyle` padding and height based on `insets.bottom`, ensuring icons and text are consistently positioned above system navigation.

## 2. Platform/Global Configuration

- [x] 2.1 Verify `SafeAreaProvider` configuration in `src/presentation/App.tsx`.
- [x] 2.2 Standardize status bar behavior (e.g., using `expo-status-bar` and ensuring it doesn't conflict with headers).

## 3. Screen Audit and Updates (Parent Stack)

- [x] 3.1 Update `ParentHomeScreen.tsx` to use standardized safe area container.
- [x] 3.2 Update `ParentProfileScreen.tsx`, `PhotoFeedScreen.tsx`, and `NoticesScreen.tsx`.
- [x] 3.3 Update specialized parent screens like `ChildDetailsScreen.tsx`.

## 4. Screen Audit and Updates (Monitor Stack)

- [x] 4.1 Update `MonitorHomeScreen.tsx`.
- [x] 4.2 Update `AttendanceScreen.tsx`, specifically checking the fixed footer overlap with bottom insets.
- [x] 4.3 Update other monitor-specific screens.

## 5. Screen Audit and Updates (Admin Stack)

- [x] 5.1 Update `AdminHomeScreen.tsx`.
- [x] 5.2 Update `CreateAnnouncementScreen.tsx` and other admin management screens.

## 6. Verification and Polish

- [/] 6.1 Perform visual audit on iOS and Android simulators (notches, home indicators).
- [x] 6.2 Verify consistent behavior of `AppHeader` across all roles.
- [x] 6.3 Run regression tests for domain and application layers.
- [ ] 6.3 Ensure no regression in existing screen functionalities.
