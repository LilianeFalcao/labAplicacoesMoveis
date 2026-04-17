## Context

The current mock implementation uses independent repository instances for monitor and parent screens. To simulate a functional replication logic, we need a shared state that persists during the app session.

## Goals / Non-Goals

**Goals:**
- Implement a shared session state for mock data.
- Enable dynamic class-to-user associations.
- Verify photo replication across screen transitions.

**Non-Goals:**
- Persistent database (SQLite/Supabase) integration in this phase.
- Real monitor authentication flow.

## Decisions

### 1. Singleton Mock Repository
The `MockActivityRepository` will be refactored to use the Singleton pattern.
**Rationale**: Ensures that photos saved by the monitor are immediately available for the parent view in the same app session.

### 2. Monitor Class Context
We will utilize `MONITOR_DASHBOARD_DATA` to provide a list of classes to the `PhotoCaptureScreen`.
**Rationale**: Reuses existing mock data to provide a realistic class selection for the monitor.

### 3. Parent Enrollment Context
We will create a `MockEnrollmentService` that associates the current (mock) parent with children in specific class IDs (e.g., '1', '2').
**Rationale**: Dynamically filters the feed based on parent-child relationships.

## Risks / Trade-offs

- **[Risk] State Loss on Reload** → [Mitigation] This is acceptable for a mock stage; persists during active session.
- **[Risk] Sync Issues** → [Mitigation] Manual refresh in `ParentFeedScreen` will refetch from the singleton.
