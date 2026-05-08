## ADDED Requirements

### Requirement: header-safe-area-respect
The `AppHeader` component MUST ensure its content is always visible within the top safe area of the device, regardless of whether a notch or island is present.

#### Scenario: AppHeader on device with notch
- **WHEN** the app is rendered on a device with a top notch (e.g., iPhone 15)
- **THEN** the header content should have enough top padding to avoid being obscured by the notch.

### Requirement: tab-bar-buttons-visibility
The `RoleTabs` (Parent, Monitor, Admin) MUST ensure that all navigation buttons (icons and labels) are fully visible and touchable, placed strictly ABOVE the device's system navigation (home indicator or navigation buttons).

#### Scenario: Tab bar on device with home indicator
- **WHEN** the app is rendered on a device with a system home indicator pill
- **THEN** the tab bar should include enough bottom padding so that the navigation icons are not covered by or dangerously close to the indicator.

### Requirement: screen-content-safe-area-respect
All screens in the application MUST ensure their main content is contained within the safe area boundaries, unless a specific design choice requires full-bleed content (e.g., backgrounds).

#### Scenario: Screen content alignment
- **WHEN** a screen is displayed
- **THEN** it should not have its primary text or interactive elements obscured by the corners, notches, or system navigation bars.
