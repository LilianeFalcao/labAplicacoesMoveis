## Why

The current "Family Portal" registration screen (SignUpScreen) is a visual shell without functional logic. Parents currently cannot create accounts autonomously, which is a requirement for the system to scale and for administrators to link parents to students by email. Implementing this logic will allow parents to register, set their profiles, and automatically view their children's activities once linked by the school.

## What Changes

- **SignUp Use Case**: Create a new `SignUpParentUseCase` to orchestrate account creation, user profile generation, and guardian record instantiation.
- **Repository Updates**: Extend `SupabaseUserRepository` to handle new user insertion (avoiding reliance solely on DB triggers).
- **AuthContext Integration**: Expose a `signUp` method in the `AuthContext` to make it available globally in the UI.
- **UI Logic**: Connect the `SignUpScreen.tsx` form to the use case, including validation and navigation to the dashboard upon success.

## Capabilities

### New/Enhanced Capabilities
- **Self-Service Registration**: Parents can independently create accounts.
- **Family Profile Management**: Automatic creation of `guardian` records linked to the new user.

## Impact

- **Parents**: Can start using the app immediately after registration.
- **Admin**: Can link students to parents using the email address they registered with, fulfilling the "Automatic School Link" promise.
