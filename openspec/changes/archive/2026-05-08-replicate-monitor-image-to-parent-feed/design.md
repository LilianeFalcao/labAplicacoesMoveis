## Context

Monitors currently use the `PhotoCaptureScreen` (which uses `ExpoCameraService`) to capture activity photos. These photos are intended to be shared with parents of the children in the same class. The current implementation is in a "mock" stage, and we need to follow TDD to implement the replication logic that makes these images visible in a parent's feed.

## Goals / Non-Goals

**Goals:**
- Define the flow from monitor capture to parent feed visibility.
- Implement a `ParentFeedScreen` using a TDD approach.
- Ensure data privacy by filtering photos by `class_id` and respecting LGPD consent.
- Use mocks for storage and database interactions during initial development.

**Non-Goals:**
- Real-time chat between parents and monitors.
- Advanced image editing or filtering.
- Automatic tag/face recognition.

## Decisions

### 1. Domain Event Integration
We will introduce a `PhotoCaptured` domain event. When a monitor captures a photo, this event is published. A subscriber (in the Application layer) will then handle the "replication" logic, which involves ensuring the photo metadata is indexed for the relevant class.
**Rationale**: Decouples the UI capture from the backend replication logic, making it easier to test and extend.

### 2. Activity Feed Service
A new `GetActivityFeed` use case will be created in the `application` layer. It will interact with the `ActivityRepository`.
**Rationale**: Follows Clean Architecture by keeping retrieval logic in the application layer.

### 3. Repository Mocking
We will extend the `ActivityRepository` interface and its mock implementation to support feed operations.
**Rationale**: Allows TDD without a live Supabase instance.

### 4. Visibility Logic
Visibility will be controlled by a combination of `class_id` matching and a mandatory `image_consent` check on the parent's child profiles.
**Rationale**: Essential for LGPD compliance.

## Risks / Trade-offs

- **[Risk] Sync Latency** → [Mitigation] Implement a pull-to-refresh and local cache in the parent app.
- **[Risk] Large Image Data** → [Mitigation] Use thumbnail generation (mocked for now, eventually handled by Supabase Storage or Edge Functions).
- **[Risk] Consent Revocation** → [Mitigation] The feed retrieval logic MUST check consent status every time it fetches metadata.
