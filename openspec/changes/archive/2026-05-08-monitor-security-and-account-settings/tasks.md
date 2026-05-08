# Tasks: Monitor Security and Account Settings

- [x] Navigation Setup
    - [x] Add `MonitorSecurity` to `MonitorStackParamList` in `src/presentation/navigation/types.ts`
    - [x] Register `MonitorSecurityScreen` in `RoleStacks.tsx`
- [x] Security Screen Implementation
    - [x] Create `src/presentation/screens/monitor/MonitorSecurityScreen.tsx`
    - [x] Implement the password change form with validation
    - [x] Implement the Biometric toggle using `expo-local-authentication`
- [x] Integration
    - [x] Update `MonitorProfileScreen.tsx` to navigate to `MonitorSecurity`
    - [x] Implement a basic `SecurityGate` (or logic in `AuthProvider`) to handle biometric lock on app startup
- [x] Verification
    - [x] Verify that the "Segurança" button opens the new screen
    - [x] Test password validation logic (errors and success)
    - [x] Verify biometric toggle state persists after app restart (mocked if device not available)
