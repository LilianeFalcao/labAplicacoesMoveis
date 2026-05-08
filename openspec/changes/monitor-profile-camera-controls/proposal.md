# Proposal: Monitor Profile Camera Controls

## Why

The current camera interface for the monitor's profile photo capture is very basic, lacking essential controls like flash and front-camera switching. Adding these features will improve the user experience, allowing monitors to take better profile photos in different lighting conditions or using the selfie camera.

## What Changes

1.  **Camera Controls UI**: Add buttons to toggle flash and switch between front and back cameras in the `ProfilePhotoCaptureModal`.
2.  **State Management**: Implement states for `facing` (front/back) and `flash` mode (on/off/auto) using `expo-camera` props.
3.  **Visual Feedback**: Show active state icons for flash and camera orientation.

## Capabilities

### Modified Capabilities
- `monitor-profile-management`: Enhanced profile photo capture with camera controls.

## Impact

- `src/presentation/components/shared/ProfilePhotoCaptureModal.tsx`: Updated with new UI controls and camera logic.
