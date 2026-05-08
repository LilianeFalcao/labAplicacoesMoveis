# Tasks: Admin Incident Dashboard and Image Picker

- [x] Setup Infrastructure
    - [x] Install `expo-image-picker` (Manually added to package.json)
    - [x] Add `getAll()` method to `MockIncidentRepository`
- [x] Implement Image Picker in Monitor Role
    - [x] Update `IncidentReportModal.tsx` to include `expo-image-picker` logic
    - [x] Add permissions check for Camera and Media Library
    - [x] Replace mock photo logic with real picker results
- [x] Implement Admin Incident Dashboard
    - [x] Create `AdminIncidentListScreen.tsx`
    - [x] Implement incident listing with filtering for emergencies
    - [x] Add navigation from `AdminHomeScreen.tsx` ("Relatórios e Logs")
- [x] Verification
    - [x] Test incident creation with real photo selection
    - [x] Verify incidents appear correctly in Admin Dashboard
    - [x] Confirm emergency styling works as expected
