## Context

The parent dashboard currently ends with a large "Quick Access" grid that the user wants to remove to simplify the experience.

## Goals / Non-Goals

**Goals:**
- Remove the "Acesso Rápido" section and its dual-column button grid.
- Re-index styles to remove unused properties.
- Ensure the remaining content (Children and Notices) is well-spaced.

**Non-Goals:**
- Adding new features or navigation.
- Changing the card design of the children list or notices.

## Decisions

1. **Section Removal**: Completely remove the the block starting with `<Text style={styles.sectionTitle}>ACESSO RÁPIDO</Text>`.
2. **Spacing**: Maintain the `Theme.spacing.xl` margin between sections. The screen will now conclude with the "Avisos Recentes" section.
3. **Refuse Code Optimization**: Delete styles: `quickAccessGrid`, `quickActionButton`, `quickActionIcon`, `quickActionLabel`.

## Risks / Trade-offs

- **Empty Bottom**: The screen may feel "shorter" if there are few announcements.
  - *Mitigation*: The current `paddingBottom: Theme.spacing.xl` in `scrollContent` is sufficient to avoid the content sticking to the bottom edges.
