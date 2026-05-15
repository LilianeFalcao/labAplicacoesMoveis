## 1. Infrastructure (Offline Sync Engine)

- [x] 1.1 Unify the two SQLite database definitions (Cleanup `SQLiteDatabase.ts` vs `SqliteStorageService.ts`). (1.5h)
- [x] 1.2 Update `OfflineSyncService.ts` to implement the `syncUp` logic using the `sync_queue` table. (2h)
- [x] 1.3 Create a `ConnectivityService` to monitor network status changes. (1h)

## 2. Repositories (Offline Integration)

- [x] 2.1 Refactor `SupabaseAttendanceRepository` to implement local caching and `sync_queue` fallback. (2h)
- [x] 2.2 Refactor `SupabaseChildRepository` (or similar) to provide cached student data for Monitors. (1.5h)
- [x] 2.3 Refactor Announcement fetching logic to use the `cache_announcements` table. (1.5h)

## 3. Presentation (User Feedback)

- [x] 3.1 Implement an "Offline Badge" indicator in the `AttendanceScreen`. (1h)
- [x] 3.2 Add a "Sync Status" indicator in the `AdminHomeScreen` / `MonitorHome`. (1h)
- [x] 3.3 Ensure the `ParentHomeScreen` handles empty/offline states gracefully using cached data. (1h)

## Priorização
🔴 Core: 1.1, 1.2, 2.1
🟡 Importante: 1.3, 2.2, 3.1
