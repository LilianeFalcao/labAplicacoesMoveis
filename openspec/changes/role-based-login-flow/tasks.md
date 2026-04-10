## 1. AuthContext Enrichment

- [ ] 1.1 Update `AuthContext.tsx` to include rich mock profiles for `parent`, `monitor`, and `admin`.
- [ ] 1.2 Refactor `startSimulation` to populate name and other metadata in the `User` object.

## 2. Login Screen UI Refactor

- [ ] 2.1 Implement a `RoleSelector` component in [LoginScreen.tsx](file:///home/alunos/Desktop/www/linnr/bambole-app/src/presentation/screens/auth/LoginScreen.tsx).
- [ ] 2.2 style the role selections as distinct "Quick Login" cards.
- [ ] 2.3 Connect selection state to the `handleLogin` function for one-tap role access.

## 3. Navigation & Flow Verification

- [ ] 3.1 Verify redirection to the `MonitorStack` when selecting the Monitor role.
- [ ] 3.2 Verify redirection to the `AdminStack` when selecting the Admin role.
- [ ] 3.3 Verify redirection to the `ParentStack` when selecting the Parent role.
- [ ] 3.4 Ensure the "Sign Out" button in all stacks correctly returns the user to the Login screen with reset state.
