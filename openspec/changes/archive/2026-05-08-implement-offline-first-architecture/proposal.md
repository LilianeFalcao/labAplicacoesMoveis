# Proposal: Implement Offline-First Architecture

## Why

Recreation monitors often work in parks, clubs, or remote areas where internet connectivity is unreliable. Currently, the Bambolê app stores data in memory (Mocks), meaning any data recorded (attendance, photos, incidents) is lost if the app is closed or if the device runs out of battery before a sync is performed. To be a reliable professional tool, the app must work 100% offline, persisting data locally and syncing automatically when the connection is restored.

## What Changes

1.  **Local Persistence Layer**:
    *   Implement a `LocalStorageService` using `AsyncStorage`.
    *   Refactor existing Mock Repositories (`MockChildRepository`, `MockAttendanceRepository`, `MockIncidentRepository`, `MockAgendaRepository`) to read/write to `AsyncStorage` instead of memory arrays.
2.  **Outbox (Sync Queue)**:
    *   Create a `SyncQueueRepository` to store operations that need to be sent to the server.
    *   Each operation will have a `retryCount`, `status` (pending, error, synced), and the actual `payload`.
3.  **Connectivity Monitoring**:
    *   Integrate `@react-native-community/netinfo` to track network status.
4.  **Sync Manager Service**:
    *   A service that listens to network changes and automatically triggers synchronization of the Outbox.
5.  **Offline UI Indicators**:
    *   Add a "Cloud" icon in the `AppHeader` to show sync status:
        - Blue: All synced.
        - Orange: Syncing...
        - Gray/Slash: Offline (with pending items count).

## Capabilities

### New Capabilities
- `system-offline-persistence`: All critical data survives app restarts and crashes.
- `system-auto-sync`: Automatic background synchronization of pending data.

## Impact

- `src/infrastructure/storage/LocalStorageService.ts`: New service.
- `src/infrastructure/sync/SyncManager.ts`: New service.
- `src/infrastructure/*/repositories/Mock*Repository.ts`: Major refactoring of all repositories.
- `src/presentation/components/base/AppHeader.tsx`: UI update for sync status.
