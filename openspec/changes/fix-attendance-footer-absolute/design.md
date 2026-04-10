## Context

The current `AttendanceScreen` has a floating footer that overlaps the list. The goal is to move this footer into the layout flow, ensuring the list stops before the footer starts. Additionally, we need to match the UX pattern from the design docs where attendance progress is shown just above the action button in the footer.

## Goals / Non-Goals

**Goals:**
- Convert the footer to a static layout element (non-absolute).
- Integrate the attendance progress indicator into the footer.
- Ensure the layout is responsive and respects bottom safe area insets.

**Non-Goals:**
- Changing the student card design.
- Altering the backend submission logic.

## Decisions

- **Structural Update**: The screen root will remain a `SafeAreaView`. The main content area will be a `View` with `flex: 1` containing the `FlatList`. The `footer` will be moved outside this flex container or placed after it to occupy its own space at the bottom.
- **Footer Components**:
    - **Progress Info**: A new row containing "X de Y marcados" and a subtle progress bar.
    - **Action Button**: The "Finalizar Chamada" button, now styled to match the blue primary color with an icon as seen in the mockup.
- **Safe Area Implementation**: The footer will use `paddingBottom: Theme.spacing.md` (or similar) while the parent `SafeAreaView` handles the device insets.

## Risks / Trade-offs

- **Risk**: On screens with very few students, there might be a large empty gap between the list and the footer.
- **Trade-off**: Improved clarity and professional appearance outweigh the potential whitespace on rare short lists.
