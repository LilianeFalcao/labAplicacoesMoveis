## Context

The `LoginScreen.tsx` currently uses a `selectedRole` state to determine the navigation flow after sign-in. We will extend the use of this state to conditionally render the footer section.

## Goals / Non-Goals

**Goals:**
- Eliminate the self-registration link for non-parent roles.
- Provide clear instructions for Monitors and Admins on how to obtain access.
- Rebrand the SignUp screen as a "Family Portal" to avoid identity confusion.
- Implement clear instructions for parents about using their official school-provided email.
- Maintain the existing visual style and theme consistency.

**Non-Goals:**
- Changing the authentication logic or the `AuthContext` (logic will be mock/placeholder as currently implemented, but correctly structured).

## Decisions

- **Conditional Rendering**: Use a simple switch or mapping object inside the `render` logic of `LoginScreen` to select the footer content.
- **Visual Feedback**: Use subtle animations (if possible with existing components) or clear transitions when switching roles to draw attention to the changing footer.
- **Support Link**: For monitors, include a "ghost" button or text link that points to a placeholder support flow or email.

## Risks / Trade-offs

- **Clutter**: We must be careful not to add too much text to the footer, keeping it concise and premium-looking.
