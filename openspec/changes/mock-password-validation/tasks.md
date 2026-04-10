## 1. UI Synchronization

- [ ] Update role selection `onPress` in [LoginScreen.tsx](file:///home/alunos/Desktop/www/linnr/bambole-app/src/presentation/screens/auth/LoginScreen.tsx) to also update the `email` state with the corresponding mock address.

## 2. Validation Logic Implementation

- [ ] Modify `handleLogin` to require a non-empty password.
- [ ] Implement the check for the demo password '123456'.
- [ ] Show appropriate `Alert` messages for validation failures.

## 3. Verification

- [ ] Confirm that selecting the "Monitor" card pre-fills "pedro.monitor@bambole.app".
- [ ] Verify that clicking "Entrar" without a password shows an error.
- [ ] Verify that typing anything other than "123456" shows the "Acesso Negado" alert.
- [ ] Verify that typing "123456" correctly navigates to the selected role portal.
