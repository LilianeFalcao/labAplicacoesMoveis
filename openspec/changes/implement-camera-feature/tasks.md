## 1. Setup and Infrastructure

- [ ] 1.1 Add dependencies: `npx expo install expo-camera expo-media-library`
- [ ] 1.2 Define `ICameraService` interface in `src/domain/services/ICameraService.ts`
- [ ] 1.3 Create unit test for `ExpoCameraService` mock in `src/infrastructure/camera/__tests__/ExpoCameraService.test.ts`
- [ ] 1.4 Implement `ExpoCameraService` in `src/infrastructure/camera/ExpoCameraService.ts`

## 2. Monitor: Activity Photo Capture

- [ ] 2.1 Create component tests for `CapturePhotoScreen` in `src/presentation/screens/monitor/__tests__/CapturePhotoScreen.test.tsx`
- [ ] 2.2 Implement `CapturePhotoViewModel` for state and logic
- [ ] 2.3 Implement `CapturePhotoScreen` with Expo Camera integration
- [ ] 2.4 Update Monitor navigation flow to include the new screen

### Admin: Child Profile Photo

- [/] Integrate camera capture for profile photos [/]
- [ ] Ensure captured photos are previewed before saving locally [ ]

## 4. Verification

- [ ] 4.1 Run all tests: `npm test`
- [ ] 4.2 Perform manual verification of camera permissions and photo capture in Expo Go/Simulator
