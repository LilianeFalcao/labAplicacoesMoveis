## Context

The current architecture is purely online. We have a `SupabaseAttendanceRepository` that calls the API directly. We will introduce a synchronization layer that bridges the Gap between the existing `SqliteStorageService` and the UI.

## Architecture: The Sync Flow

We will use a **Repository Decorator** or a **Smart Repository** strategy:

1. **Write Operations (e.g., Save Attendance):**
   - Attempt to save to Supabase.
   - If successful, also update the local cache for consistency.
   - If it fails (Network Error), save to the local `attendance` table and add a 'PENDING' entry to the `sync_queue`.

2. **Read Operations (e.g., List Students):**
   - Check if network is available.
   - If online: Fetch from Supabase and refresh local cache.
   - If offline: Return data from local SQLite cache.

## Decisions

- **Sync Queue Strategy**: The `sync_queue` will store the action type, payload, and timestamp. A background task (or a triggered service) will process this queue sequentially.
- **Connectivity Monitoring**: Use `expo-network` or a simple ping check to detect online/offline transitions.
- **Data Conflict Resolution**: In this first phase, "Last Write Wins" based on timestamps will be the default strategy for attendance conflicts.

## Component Integration

- **OfflineSyncService**: Will be updated to handle generic queue processing.
- **AttendanceScreen**: Will show a "Offline Mode" badge or a "Syncing" indicator when unsynced records exist.

## Risks / Trade-offs

- **Storage Limits**: SQLite has limits, but for text-based attendance data, this is not an issue.
- **Stale Data**: Parents might see old announcements if they haven't synced in a while. We will add a "Last updated" timestamp to the UI.
