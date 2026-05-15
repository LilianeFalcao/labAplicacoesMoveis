## Why

The application currently has a dormant offline infrastructure (SQLite database and sync service) that is not integrated into the production workflow. This leads to a poor user experience when network connection is unstable, particularly for Monitors (who need to mark attendance in outdoor areas) and Parents (who want to check announcements on the go). Activating these capabilities will make the app resilient and reliable in real-world scenarios.

## What Changes

- **Offline-First Attendance**: Enable Monitors to mark attendance offline. Data will be saved to a local `sync_queue` and synchronized when connection is restored.
- **Cached Announcements**: Enable Parents and Monitors to read recently fetched announcements without an active internet connection.
- **Offline Student Catalog**: Provide access to student profiles (including medical alerts) via local cache.
- **Background Synchronization**: Integrate the `OfflineSyncService` into the app's lifecycle (on login, on app resume, and periodically).

## Capabilities

### New/Enhanced Capabilities
- **Resilient Attendance**: Support for marking presence without network dependency.
- **Offline Reading**: Cached access to school communications.

## Impact

- **Monitors**: Can perform their primary duty (attendance) anywhere in the school, regardless of Wi-Fi coverage.
- **Parents**: Improved perceived performance and availability of the "Family Portal".
- **Infrastructure**: Reduced number of redundant API calls by utilizing the local cache for read-heavy data.
