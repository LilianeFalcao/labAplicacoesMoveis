## 1. AuthContext Refactor

- [ ] 1.1 Update `AuthContextData` interface to accept `email` in `signIn` and `startSimulation`.
- [ ] 1.2 Refactor `signIn` implementation in [AuthContext.tsx](file:///home/alunos/Desktop/www/linnr/bambole-app/src/presentation/contexts/AuthContext.tsx) to use the provided email instead of hardcoded profiles.
- [ ] 1.3 Refactor `startSimulation` implementation to use the provided email.

## 2. Login Screen Logic Update

- [ ] 2.1 Update `handleLogin` in [LoginScreen.tsx](file:///home/alunos/Desktop/www/linnr/bambole-app/src/presentation/screens/auth/LoginScreen.tsx) to pass the `email` state to the `signIn` function.
- [ ] 2.2 Update role card `onPress` handlers to only pre-fill the email if the current `email` state is empty.
- [ ] 2.3 Remove the `MOCK_PROFILES` dependency in `LoginScreen` if applicable.

## 3. Verification & UI Check

- [ ] 3.1 Verify that entering `user@google.com` and selecting "Monitor" results in a session for `user@google.com` with the Monitor role.
- [ ] 3.2 Confirm that existing navigation logic still works for all three stacks.
- [ ] 3.3 Ensure "Sign Out" still resets all states correctly.
