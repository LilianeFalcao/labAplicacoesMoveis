# Design: Implement Offline-First Architecture

## Architecture Diagram

```mermaid
graph TD
    UI[UI Components] --> UC[Use Cases]
    UC --> Repo[Repositories]
    Repo --> LS[LocalStorage (AsyncStorage)]
    Repo --> OB[Outbox / SyncQueue]
    OB --> SM[Sync Manager]
    SM --> Net[NetInfo API]
    SM --> API[Remote API (Mocked)]
```

## Data Schema (AsyncStorage Keys)
- `bambole@children`: List of students.
- `bambole@attendance`: Attendance records.
- `bambole@incidents`: Reported incidents.
- `bambole@agenda`: Class activities.
- `bambole@outbox`: Queue of pending POST/PUT operations.

## Sync Logic

### The "Write" Flow:
1. Use Case calls `Repository.save(entity)`.
2. Repository saves to `LocalStorage`.
3. Repository adds a `SyncAction` to the `Outbox`.
4. If online, `SyncManager` immediately tries to process the `Outbox`.

### The "Read" Flow:
1. Use Case calls `Repository.find()`.
2. Repository returns data from `LocalStorage`.
3. (Optional) In background, if online, Repository fetches fresh data from API and updates `LocalStorage`.

## UI/UX: Sync Indicator (AppHeader)
A small cloud icon in the top right of the `AppHeader`, acting as a status bridge:
- **Cloud with Check (Theme.colors.success)**: Everything up to date.
- **Animated Rotating Cloud (Theme.colors.primary)**: Syncing in progress.
- **Cloud with Warning (Theme.colors.warning)**: Offline mode. Displays a badge with the number of pending items (e.g., "3").
- **Cloud with Error (Theme.colors.error)**: Sync failed after retries. Clicking shows a "Retry All" option.

### Interaction
Tapping the Cloud icon opens a `SyncStatusPopover`:
- Last successful sync timestamp.
- List of item types currently in queue (e.g., "2 Fotos, 1 Chamada").
- Toggle for "Sync only on Wi-Fi".

## Sync Logic Details

### 1. Event-Driven Sync
Every time a `save` operation occurs, the repository:
1. Persists data to `AsyncStorage`.
2. Adds the task to `SyncQueue`.
3. Notifies `SyncManager` to attempt an immediate background sync if connectivity is available.

### 2. Connectivity Listener
`SyncManager` uses `@react-native-community/netinfo` to subscribe to network state changes. 
- **Offline -> Online transition**: Triggers a full queue flush.
- **Online -> Offline transition**: Suspends background tasks to save battery.

### 3. Background Fetch (Future)
Integration with `expo-background-fetch` to ensure data is synced even if the monitor leaves the app in the background.
