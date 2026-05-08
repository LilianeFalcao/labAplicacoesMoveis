# Design: Refine Student Attendance Flow

## UI Components

### Student Card Alerts
- **Visual**: A small yellow or orange "alert" icon (MaterialCommunityIcons `alert-circle`) next to the student's name.
- **Interaction**: Tapping the alert icon opens an `Alert.alert` or a small tooltip showing the text (e.g., "Alergia a Amendoim", "Usa Inalador").

### Attendance Summary Modal
A full-width bottom sheet or centered modal containing:
- **Title**: "Confirmar Chamada"
- **Stats**:
    - `Presentes: 18` (Green)
    - `Ausentes: 2` (Red)
- **Warning List**: If any student marked as "Absent" has a critical alert, highlight it for double-checking.
- **Actions**:
    - "Voltar e Corrigir" (Outline button)
    - "Confirmar e Enviar" (Primary button)

## Implementation Details

### State Management
In `AttendanceScreen.tsx`, we will add a state `isSummaryModalVisible`.

### Mock Data Update
Update `MockChildRepository` to return objects with:
```typescript
{
    id: string;
    name: { value: string };
    medicalAlerts?: string[];
}
```

## UX Flow
1. Monitor opens Attendance.
2. Monitor marks students (noticing alerts if present).
3. Monitor clicks "Confirmar Chamada".
4. Summary Modal appears with totals.
5. Monitor confirms, triggering geolocation and API submission.
