## Why

In a public-facing application, users should be able to enter their own email addresses during login. The current implementation forces specific mock emails when a role is selected, which is too restrictive for a realistic demonstration. By allowing dynamic emails while keeping the role selection for mockup purposes, we create a more flexible and realistic login experience.

## What Changes

- **Decoupled Auth Logic**: Update `AuthContext` to accept dynamic email addresses as arguments for `signIn` and `startSimulation`, rather than picking from a fixed pool.
- **Improved UI Behavior**: Modify `LoginScreen` so that selecting a role only determines the *target flow* and *sample formatting*, but does not override custom email entries if the user has already typed one.
- **Enhanced Mock User Creation**: Ensure the `User` object in the context reflects the actual email typed by the user, regardless of the role selected.

## Capabilities

### New Capabilities
- **Flexible Mock Entry**: Users can login as any role using any email address they choose.

### Modified Capabilities
- **AuthContext.signIn(email, role)**: Now takes both email and role parameters to create a truly dynamic mock session.

## Impact

- **UX**: More realistic login flow where the user sees their own credentials reflected in the app.
- **Public Readiness**: Prevents the perception that the app only works with a few hardcoded accounts.
