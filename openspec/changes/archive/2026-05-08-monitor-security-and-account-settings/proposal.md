# Proposal: Monitor Security and Account Settings

## Why

Currently, the "Segurança e Senha" button in the monitor's profile is a dead link. Security is paramount in an app that manages student data and attendance. Monitors need a way to change their passwords and enable biometric protection to ensure that only they can access the application's sensitive operations (like taking attendance or reporting incidents).

## What Changes

1.  **Security Screen Implementation**:
    *   Create `MonitorSecurityScreen.tsx` with sections for "Password Change" and "Biometric Lock".
2.  **Biometric Integration**:
    *   Use `expo-local-authentication` to implement a "Lock App with Biometrics" feature.
    *   Save this preference in `AsyncStorage` (or a dedicated security context).
3.  **Password Change Flow**:
    *   A simple UI flow (Current Password, New Password, Confirm New Password) with validation.
4.  **Access Request Enhancement**:
    *   Update the `ClassSelectionModal` to show the "Pending" status of requests more clearly.
    *   Add a notification or alert when a temporary access request is approved.

## Capabilities

### New Capabilities
- `monitor-password-management`: Ability for monitors to securely update their account credentials.
- `monitor-biometric-lock`: Added layer of physical security using device biometrics.

## Impact

- `src/presentation/navigation/types.ts`: Add `MonitorSecurity` route.
- `src/presentation/navigation/stacks/RoleStacks.tsx`: Register the new security screen.
- `src/presentation/screens/monitor/MonitorSecurityScreen.tsx`: New screen implementation.
- `src/presentation/screens/monitor/MonitorProfileScreen.tsx`: Link the button to the new screen.
