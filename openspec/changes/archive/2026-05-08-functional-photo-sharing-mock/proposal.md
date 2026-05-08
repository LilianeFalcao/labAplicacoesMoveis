## Why

Currently, the photo sharing feature uses hardcoded class IDs and local repository instances, which prevents a true functional simulation across monitor and parent roles. Transitioning to a shared mock state and dynamic class association is necessary to validate the end-to-end user experience during the mock stage.

## What Changes

- **Shared Mock Persistence**: Refactor `MockActivityRepository` to a singleton pattern to ensure data consistency across screen transitions within the same app session.
- **Monitor Class Selection**: Update the monitor's photo capture flow to allow selection from their assigned classes (using existing `MONITOR_DASHBOARD_DATA`).
- **Dynamic Parent Feed**: Update the parent's feed to dynamically fetch photos based on their children's enrolled classes.
- **Integrated Mock Context**: Wire the monitor and parent screens to the same shared repository instance.

## Capabilities

### New Capabilities
- `shared-mock-storage`: Centralized in-memory storage for activity photos during the mock phase.

### Modified Capabilities
- `activity-photo`: Update monitor capture to include dynamic class selection.
- `parent-activity-feed`: Update parent feed to filter photos by child-enrolled classes.

## Impact

- **Infrastructure**: Refactored `MockActivityRepository` (Singleton).
- **Presentation**: UI updates for class selection in `PhotoCaptureScreen` and filtered retrieval in `ParentFeedScreen`.
- **Application**: Use cases will interact with the shared singleton repository.
