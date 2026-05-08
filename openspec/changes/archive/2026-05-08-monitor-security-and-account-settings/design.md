# Design: Monitor Security and Account Settings

## UI Components

### MonitorSecurityScreen
- **Header**: Standard app header with back button.
- **Section: Senha**: 
    - Input: "Senha Atual" (Secure).
    - Input: "Nova Senha" (Secure).
    - Input: "Confirmar Nova Senha" (Secure).
    - Button: "Atualizar Senha".
- **Section: Proteção**:
    - Toggle Switch: "Bloqueio Biométrico" (Digital/FaceID).
    - Description: "Exigir autenticação ao abrir o aplicativo".

## Technical Implementation

### Biometric Lock Flow
1. User enables biometric lock in settings.
2. Preference is saved to `AsyncStorage`.
3. In `AppNavigator` or a specialized `SecurityGate`, if the preference is `true`, call `LocalAuthentication.authenticateAsync()` before showing the main app content.

### Password Validation
- Minimum 8 characters.
- Must match "Confirm Password".
- Mock implementation will simulate a successful update after a 1-second delay.

## UX Considerations
- **Visual Feedback**: Use a success toast or alert when the password is changed.
- **Biometric Availability**: Check if the device supports biometrics before showing the toggle switch.
