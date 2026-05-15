## Why

The current Login screen presents a generic "Sign Up" option regardless of the selected role. This causes confusion for Monitors and Administrators, who cannot self-register in the system (their accounts must be provisioned by the school). By making the footer dynamic and reactive to the selected role, we ensure that only Parents see the self-registration option, while others receive appropriate guidance.

## What Changes

- **Dynamic Footer in LoginScreen**: Implement logic to switch the footer content based on the `selectedRole` state.
- **Role-Specific Guidance**:
    - **Parent**: Display the existing "Create Account" button pointing to the SignUp screen.
    - **Monitor**: Display a message informing that monitor accounts are managed by the school and providing a support link.
    - **Admin**: Display a message about restricted administrative access.
- **Specialized SignUpScreen**: Transform the generic "Sign Up" screen into a dedicated "Parent Registration" portal with family-focused copy and instructions about the school-provided email.

## Capabilities

### Modified Capabilities
- **LoginScreen UI**: Enhanced with reactive elements that guide users based on their intended role.

## Impact

- **UX**: Reduced friction and confusion for new monitors and administrators.
- **Functional Clarity**: Reinforces the business rule that self-registration is exclusive to families.
