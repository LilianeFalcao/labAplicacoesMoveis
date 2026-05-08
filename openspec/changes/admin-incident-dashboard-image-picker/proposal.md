# Proposal: Admin Incident Dashboard and Image Picker Integration

## Why

Currently, the Bambolê app allows monitors to report incidents through a "Relatar Incidente" quick action, but there is no interface for administrators to view, manage, or respond to these reports. Additionally, the current incident reporting flow uses mock data for photos, which does not reflect real-world usage. Integrating `expo-image-picker` will allow monitors to capture real evidence or select existing photos from their gallery, significantly improving the utility of the feature.

## What Changes

1.  **Admin Incident Dashboard**: A new dedicated screen for administrators to list and filter incidents reported by monitors.
2.  **Incident Details**: Ability for administrators to view details of a specific incident, including timestamps, descriptions, and photos.
3.  **Image Picker Integration**: Replace the current mock photo logic in `IncidentReportModal` with `expo-image-picker` to support camera and gallery photo selection.
4.  **Mock Repository Extension**: Update `MockIncidentRepository` to support retrieving all incidents (reading) in addition to saving them.

## Capabilities

### New Capabilities
- `admin-incident-management`: Capability to view and manage incident reports from the admin panel.
- `media-selection`: Capability to select media from the device gallery or camera using standard Expo APIs.

### Modified Capabilities
- `monitor-incident-reporting`: Updated to support real image selection.

## Impact

- `package.json`: Addition of `expo-image-picker`.
- `src/infrastructure/activity/repositories/MockIncidentRepository.ts`: Added `getAll()` method.
- `src/presentation/components/monitor/IncidentReportModal.tsx`: Integrated `expo-image-picker` and updated photo handling.
- `src/presentation/screens/admin/AdminIncidentListScreen.tsx`: New screen for listing incidents.
- `src/presentation/screens/admin/AdminHomeScreen.tsx`: Updated "Relatórios e Logs" to navigate to the new incident list.
