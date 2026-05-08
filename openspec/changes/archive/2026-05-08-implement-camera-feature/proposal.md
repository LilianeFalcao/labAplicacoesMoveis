## Why

The Bambolê application requires camera capabilities to support two core features:
1. **Activity Monitoring**: Monitors need to take photos of children's activities to share with parents in the activity feed.
2. **Profile Management**: Administrators need to capture profile photos for children during the enrollment process to facilitate identification by monitors.

Implementing this now ensures the foundation for visual communication and identification is solid before connecting to Supabase storage.

## What Changes

- Add and configure `expo-camera` and `expo-media-library` (if needed for temporary storage) in `package.json`.
- Implement `ExpoCameraService` following `ICameraService` interface in the infrastructure layer.
- Create a dedicated `CapturePhotoScreen` for the Monitor role (Tela 12).
- Integrate camera capture into the `ChildManagementScreen` for the Admin role (Tela 15).
- All implementation will follow TDD, starting with domain/infrastructure service tests followed by presentation tests.

## Capabilities

### New Capabilities
- `camera-service`: Infrastructure service providing a unified interface for camera permissions, photo capture, and image URI management.
- `activity-photo-capture`: Core UI component and screen for monitors to take, preview, and confirm activity photos.
- `profile-photo-capture`: Camera integration within management flows to capture child profile pictures.

### Modified Capabilities
- `child-management`: Enhanced to support live camera capture for profile photos.
