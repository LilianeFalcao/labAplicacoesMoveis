# Design: Monitor Profile Screens

## Architecture

Following the Clean Architecture:
- **Presentation**: New screens in `src/presentation/screens/monitor/`.
- **Domain**: Use existing repositories like `IClassRepository` and `IActivityRepository`.
- **Infrastructure**: Use existing mocks `MockClassRepository` and `MockActivityRepository`.

## UI Design

### Monitor Classes Screen
- Uses `MockClassRepository.getMonitorClasses(monitorId)`.
- List of cards with:
  - Class Name
  - Schedule
  - Age Group
  - Current Status (In Progress, Next, etc.)

### Activity History Screen
- Uses `MockActivityRepository.getFeedByMonitor(monitorId)` (to be implemented).
- Chronological list showing:
  - Type of activity (Photo, Attendance, Incident)
  - Time
  - Summary
- Different icons for each activity type.

### Monitor Settings Screen
- Theme Toggle: "Sincronizar com o sistema", "Modo Claro", "Modo Escuro".
- Uses a `ThemeContext` (as per the dark mode proposal).
- Section for Account info (read-only).

## Navigation Flow

1. User taps "Meu Perfil" (Tab).
2. Taps "Minhas Turmas" → `MonitorClasses` screen.
3. Taps "Histórico" → `ActivityHistory` screen.
4. Taps "Configurações" → `MonitorSettings` screen.

## Technical Details

### Repository Updates
`MockActivityRepository` needs a new method to filter by monitor ID instead of just class ID.

```typescript
async getFeedByMonitor(monitorId: string): Promise<ActivityPhoto[]> {
    return this.photos.filter(p => p.monitorId === monitorId);
}
```
*Note: We also need to fetch incidents for the history.*
