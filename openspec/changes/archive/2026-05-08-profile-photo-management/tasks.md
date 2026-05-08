## 1. Shared Components

- [x] 1.1 Create `ProfilePhotoCaptureModal.tsx` in `src/presentation/components/shared`
- [x] 1.2 Implement camera logic using `ExpoCameraService` with a circular overlay
- [ ] 1.3 Add TDD unit tests for the modal logic (mocking `CameraView`)

## 2. Parent Profile Integration

- [x] 2.1 Update `ParentProfileScreen.tsx` to include an "Edit" button on the avatar
- [x] 2.2 Integrate `ProfilePhotoCaptureModal` into the screen state
- [x] 2.3 Verify profile photo updates locally (URI preview)

## 3. Monitor Profile Implementation

- [x] 3.1 Create `MonitorProfileScreen.tsx` with identity management features
- [x] 3.2 Update `MonitorTabs` in `RoleTabs.tsx` to include the "Profile" tab
- [x] 3.3 Register the route in `MonitorStackParamList` (types.ts)
- [x] 3.4 Integrate `ProfilePhotoCaptureModal` into `MonitorProfileScreen`

## 4. Admin Profile Implementation

- [x] 4.1 Create `AdminProfileScreen.tsx` for administrative account management
- [x] 4.2 Update `AdminTabs` in `RoleTabs.tsx` to include the "Profile" tab
- [x] 4.3 Register the route in `AdminStackParamList` (types.ts)
- [x] 4.4 Integrate `ProfilePhotoCaptureModal` into `AdminProfileScreen`

## 5. Verification

- [x] 5.1 Perform manual verification of the camera flow on all three roles
- [x] 5.2 Ensure consistent UI/UX behavior for permission denials
- [x] 5.3 Validate responsive design across different screen sizes
