## 1. Infrastructure Refactoring

- [x] 1.1 Refactor `MockActivityRepository` to use the Singleton pattern (static instance)
- [x] 1.2 Update all use-cases and screens to use the singleton instance

## 2. Monitor Context

- [x] 2.1 Implement a `GetMonitorClassesUseCase` using `MONITOR_DASHBOARD_DATA`
- [x] 2.2 Add a class selector (e.g., simple Picker or horizontal list) to `PhotoCaptureScreen`
- [x] 2.3 Update `handleSave` in `PhotoCaptureScreen` to use the selected class ID

## 3. Parent Context

- [x] 3.1 Create `MockEnrollmentService` to associate parent children with class IDs
- [x] 3.2 Update `ParentFeedScreen` to fetch children class IDs via the enrollment service
- [x] 3.3 Ensure the feed refresh uses the dynamic list of class IDs

## 4. Verification

- [ ] 4.1 Verify photo replication by capturing a photo in Monitor tab and viewing it in Parent tab
- [x] 4.2 Run all automated tests to ensure no regressions
