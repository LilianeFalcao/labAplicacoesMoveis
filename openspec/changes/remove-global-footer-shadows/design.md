## Context

The current application uses a mix of flat and shadowed UI elements. The user has specifically requested the removal of "heavy" elevation/shadow styles (associated with a floating/absolute footer) in favor of a flatter, more integrated layout above the bottom tab bar.

## Goals / Non-Goals

**Goals:**
- Eliminate `elevation` and `shadow*` properties from footers.
- Transition footers from `position: absolute` to flex layout.
- Ensure consistent appearance across Monitor and Admin stacks.

**Non-Goals:**
- Changing primary button colors or typography.
- Refactoring the entire component library (only screen-level styles).

## Decisions

- **Shadow Elimination**: We will remove the entire block of shadow-related styles from footer definitions.
- **Layout Reset**: For screens like `AttendanceScreen`, we will ensure the `container` for the list and the `footer` are siblings in a flex column, rather than the footer being an absolute child.
- **FAB Handling**: In screens like `GroupAgendaScreen`, the Floating Action Button (FAB) might remain absolute but should also follow the shadow-removal rule if it uses the `elevation: 20` pattern. However, the user specifically mentioned "posicionadas acima na tab bar", which might imply moving FABs into a footer row if appropriate, but usually, it refers to the fixed footer bars.

## Risks / Trade-offs

- **Risk**: Without shadows, some footers might look "flat" against a white background if there's no border.
- **Decision**: Ensure `borderTopWidth: 1` and `borderTopColor: Theme.colors.gray[100]` are present to provide subtle separation without using heavy shadows.
