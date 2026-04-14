## Context

The `LoginScreen.tsx` currently includes a custom header with "Menu" and "Notifications" buttons. These buttons trigger alerts stating that the features are "under development", but more importantly, these features should only be available for authenticated users whose roles have been identified.

## Goals / Non-Goals

**Goals:**
- Clean up the Login screen by removing clutter (icons for unavailable features).
- Maintain the visual symmetry of the header for the centered logo.

**Non-Goals:**
- Implementing actual global navigation or notification systems (this is just the UI cleanup).
- Changing the design of other screens.

## Decisions

- **Hide vs Remove**: The `TouchableOpacity` elements will be removed, but placeholder `View` elements with the same `headerIconButton` style will be added. This ensures that the logo remains centered in a flexbox layout with `justifyContent: 'space-between'`.
- **Authenticated Flows**: The authenticated headers (like in `ParentHomeScreen.tsx`) remain unchanged as they will eventually handle role-specific notification logic.

## Risks / Trade-offs

- **Symmetry**: If placeholders are not used, the logo might shift to the left or right depending on the flex configuration.
