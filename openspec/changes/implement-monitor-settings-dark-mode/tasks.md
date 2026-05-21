## 1. Theme Infrastructure

- [x] 1.1 Create `src/presentation/contexts/ThemeContext.tsx`. Implement the `ThemeProvider` with system detection logic.
- [x] 1.2 Update `src/presentation/styles/Theme.ts` to export `LightTheme` and `DarkTheme` constants.
- [x] 1.3 Wrap the root application in `App.tsx` with the new `ThemeProvider`.

## 2. Settings Screen

- [x] 2.1 Create `src/presentation/screens/monitor/MonitorSettingsScreen.tsx`. Include a toggle/picker for Appearance (System, Light, Dark).
- [x] 2.2 Register `MonitorSettingsScreen` in the navigation stack.
- [x] 2.3 Link the "Configurações" item in `MonitorProfileScreen` to navigate to the new screen.

## 3. Component Refactoring (Core)

- [x] 3.1 Update `AppHeader`, `AppButton`, and `AppCard` to consume theme from the context.
- [x] 3.2 Update `MonitorHomeScreen` and `MonitorProfileScreen` to support the new dark colors.

## 4. Verification

- [x] 4.1 Verify that the app theme changes when toggling the phone's system appearance.
- [x] 4.2 Verify that the manual override in Settings works correctly.
