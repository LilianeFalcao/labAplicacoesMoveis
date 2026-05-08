## Context

The Bambolê app needs to integrate camera functionality for monitors (activity photos) and admins (profile photos). The project follows Clean Architecture, so camera interactions must be abstracted behind an interface.

## Goals / Non-Goals

**Goals:**
- Provide a unified `ICameraService` for camera operations.
- Implement `ExpoCameraService` using `expo-camera`.
- Create a reusable `CapturePhotoScreen` for photo acquisition.
- Ensure 100% test coverage for camera logic (permissions, photo URI handling) using TDD.
- Integrate with child profile capture and activity photo flows.

**Non-Goals:**
- Connecting to Supabase Storage (will be handled in a future task).
- Image editing (cropping, filters).
- Video recording.

## Decisions

- **Domain Abstraction**: Create `ICameraService` in `src/domain/services` to decouple core logic from Expo.
- **Infrastructure Layer**: Implement `ExpoCameraService` in `src/infrastructure/camera`.
- **Presentation Layer**: 
  - Use a dedicated screen for capture to keep UI clean.
  - State management via `CapturePhotoViewModel` (or equivalent pattern in the project).
- **TDD Strategy**:
  - Unit tests for `ExpoCameraService` mocks.
  - Component tests for the Camera UI using `@testing-library/react-native`.

## Risks / Trade-offs

- **Permissions**: Handling different states (granted, denied, limited) on iOS and Android. **Trade-off**: Stick to basic "granted" requirement for now.
- **Mocking Expo Camera**: Mocking the native `Camera` component in tests can be complex. **Decision**: Use `jest-expo` and manual mocks for `expo-camera`.
