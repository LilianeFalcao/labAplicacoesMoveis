## Context

The current login system is too hardcoded. To make it "public app ready", we must allow users to use their own email identifiers while still providing mock roles for testing navigation.

## Goals / Non-Goals

**Goals:**
- Allow any valid email string to be passed into the simulated session.
- Keep the `selectedRole` differentiator to decide which navigation stack to load.
- Prevent automatic email overrides if a user has already provided input.

**Non-Goals:**
- Removing the role selector entirely (it's still needed to "tell" the app which mock personality to adopt).
- Implementing password hashing or database lookups.

## Decisions

- **Updated Service Signatures**:
  ```typescript
  signIn: (email: string, role: UserRole) => void;
  ```
  The `User` entity will be constructed using the provided `email` and the `role` value object.
- **Role Selection Behavior**:
  - Tapping a role card will set the `selectedRole`.
  - It will only set the `email` field if `email.trim().length === 0`.
- **Validation**: Continue to require the demo password `123456` regardless of the email entered.

## Risks / Trade-offs

- **Confusion**: Users might think their email is being saved. We will keep the "Simulation" indicators clear in the UI.
