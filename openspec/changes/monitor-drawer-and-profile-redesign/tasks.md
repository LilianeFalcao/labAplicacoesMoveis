# Tasks: Monitor Drawer and Profile Redesign (Custom Implementation)

- [x] UI Components Implementation
    - [x] Create `src/presentation/components/monitor/MonitorSidebar.tsx` using `Animated` API
    - [x] Implement sidebar opening/closing logic in `MonitorHomeScreen.tsx`
    - [x] Add overlay (backdrop) to close the sidebar when tapping outside
- [x] Profile & Screens Implementation
    - [x] Create `src/presentation/screens/monitor/MonitorSupportScreen.tsx` placeholder
    - [x] Update `MonitorProfileScreen.tsx` with statistics cards (Photos and Attendance)
    - [x] Remove navigation items from Profile menu that are now in the Sidebar
- [x] Navigation Wiring
    - [x] Link Sidebar items to existing routes (MonitorClasses, ActivityHistory)
    - [x] Add "Suporte" to `MonitorStackParamList` and register it in `RoleStacks.tsx`
- [x] Verification
    - [x] Verify sidebar slides smoothly without any Babel plugins
    - [x] Confirm navigation from sidebar works correctly
    - [x] Ensure profile statistics reflect mock data
