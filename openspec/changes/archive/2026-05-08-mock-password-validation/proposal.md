## Why

Requiring a password even in a mocked/simulated environment helps users understand the authentication flow and ensures the UI is ready for production-grade security. It also allows for a more comprehensive demonstration of the app's interactive form handling and validation logic.

## What Changes

- **Password Validation**: Restore the check for a minimum password length and a specific "demo" password ('123456') in the `handleLogin` function.
- **Email Pre-filling**: When a role card is tapped, the corresponding mock email (e.g., `monitor@bambole.app`) will automatically populate the email field.
- **Validation Feedback**: Provide clear error messages if the user attempts to log in without a password or with an incorrect one.

## Capabilities

### New Capabilities
- **Form Validation**: The login screen now actively validates the password field before allowing navigation.

### Modified Capabilities
- **LoginScreen.handleLogin**: Now requires both a valid email format and the correct demo password.

## Impact

- **UX**: A more realistic and educational onboarding experience.
- **QA**: Allows testing of error states and form validation logic before backend integration.
