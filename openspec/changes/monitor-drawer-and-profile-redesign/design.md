# Design: Monitor Custom Sidebar and Profile Redesign

## Navigation Architecture

Instead of a heavy Drawer Navigator dependency, we will implement a **Custom Sidebar Overlay** within the `MonitorHomeScreen`.

### Custom Sidebar Implementation
- **Component**: `MonitorSidebar.tsx`
- **Animation**: React Native `Animated` API (`translateX` from -width to 0).
- **Overlay**: A semi-transparent black background that closes the sidebar on tap.

### Navigation Hierarchy (Maintains Current Stack)
```
MonitorStack (Stack)
└── MonitorTabs (Tabs)
    ├── Home (Contains the Sidebar Logic)
    └── Profile
```
*Note: We will use the existing Stack for sub-screens like Support and Classes.*

## UI Design

### Sidebar Layout
- **Header**: Monitor name and avatar.
- **Menu Items**:
  - `home-outline` -> Início (Close sidebar)
  - `account-group-outline` -> Minhas Turmas (Navigate to screen)
  - `history` -> Histórico (Navigate to screen)
  - `help-circle-outline` -> Suporte (Navigate to screen)

## Profile Redesign
- **Statistics Section**: Added below the header.
- **Menu Items**: Focused on Account and Settings.

## Technical Details

### Animation Logic
We will use a `useRef(new Animated.Value(-DRAWER_WIDTH))` to control the sidebar position. This avoids any Babel plugin requirements.
