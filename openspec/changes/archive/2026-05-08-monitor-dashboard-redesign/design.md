## Context

The monitor dashboard needs to be restructured to improve information flow and alignment with a professional school management aesthetic. We will move away from a simple list to a multi-layered dashboard.

## Goals / Non-Goals

**Goals:**
- Implement a summary section with metrics.
- Create differentiated card designs for active, completed, and upcoming turmas.
- Add prominent calls to action (e.g., "Realizar Chamada") directly on the cards.
- Add a floating action button for quick turma requests.

**Non-Goals:**
- Functional changes to the data fetching logic (mock data will be used initially).
- Changes to tab navigation.

## Decisions

1. **Information Hierachy**:
   - Top: Page Title and "Solicitar Turma" action.
   - Middle: Metric summary cards.
   - Bottom: "Agenda de Hoje" list.

2. **Component Architecture**:
   - `MonitorSummaryCard`: Reusable component for the big metrics (blue/green variants).
   - `TurmaAgendaCard`: Specialized card that adapts its UI based on `status` (pending, completed, upcoming).
   - `TurmaDetailItem`: Small row component with an icon and label/value pair.

3. **Visual Aesthetics**:
   - White cards with subtle border/radius (16-24px).
   - Categorization badges (e.g., "ESPORTES", "CRIATIVIDADE").
   - Status indicators with distinct color coding (Red for pending, Green for completed, Blue-ish for upcoming).

4. **FAB**: A persistent `TouchableOpacity` with absolute positioning at the bottom right.

## Risks / Trade-offs

- **Screen Real Estate**: Detailed cards take more vertical space.
  - *Mitigation*: Ensure the scroll view is optimized and completed items are slightly compacted.
- **Complexity**: Multiple card variants increase code size.
  - *Mitigation*: Use a clean mapping between data states and UI sub-renderers.
