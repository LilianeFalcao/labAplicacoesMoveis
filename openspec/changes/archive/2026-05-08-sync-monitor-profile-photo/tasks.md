# Tasks: Sync Monitor Profile Photo

- [x] Global State Implementation
    - [x] Update `AuthContextData` interface in `src/presentation/contexts/AuthContext.tsx`
    - [x] Add `profilePhotoUri` state and `updateProfilePhoto` function to `AuthProvider`
- [x] Profile Screen Integration
    - [x] Update `MonitorProfileScreen.tsx` to use `profilePhotoUri` from context
    - [x] Replace `onCapture` local state logic with `updateProfilePhoto`
- [x] Sidebar Integration
    - [x] Update `MonitorSidebar.tsx` to fetch `profilePhotoUri` from context
    - [x] Implement conditional rendering in Sidebar header (Photo vs Icon)
- [x] Verification
    - [x] Change photo in Profile and verify it updates in the Sidebar immediately
    - [x] Verify photo persists while navigating between tabs and drawer items
