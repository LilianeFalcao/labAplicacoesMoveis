# Design: Dynamic Class Agenda Management

## Data Structure

### ClassActivity Entity
```typescript
interface ClassActivity {
    id: string;
    classId: string;
    startTime: string; // e.g., "09:00"
    endTime: string;   // e.g., "10:30"
    title: string;
    description?: string;
    status: 'pending' | 'ongoing' | 'completed';
    category: 'activity' | 'break' | 'meal'; // To use different icons
}
```

## UI Components

### Interactive Agenda Card
The `TurmaAgendaCard` will be updated to:
- **Left Column**: Time range (e.g., "09h - 10h").
- **Center**: Title and a small "badge" for the category.
- **Right Column**: A large checkbox (or Material icon button) to toggle completion.
- **Visual Feedback**: Completed activities will be slightly dimmed (0.6 opacity) and have a strikethrough on the title.

### Dashboard Integration
The "Agenda de Hoje" section on the Home screen will show the next 3 activities and a "Ver Tudo" link. It will also display a horizontal progress bar reflecting the percentage of completed activities.

## Logic & Persistence

### Local Status Update
When a monitor marks an activity as completed, the `MockAgendaRepository` will be updated in memory. In a future iteration, this will trigger an API call to sync the class progress with parents and admins.

### Auto-Ongoing
Logic to automatically mark the activity as "ongoing" based on the current device time compared to the activity's `startTime`.
