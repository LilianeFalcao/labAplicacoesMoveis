# Proposal: Refine Student Attendance Flow

## Why

Taking student attendance is a critical task for monitors, as it involves safety and accountability. The current flow is too simple and lacks essential information that a monitor needs in real-time, such as student allergies or medical alerts. Additionally, there is no summary step to prevent accidental submissions with incorrect attendance counts. Adding critical alerts and a confirmation summary will improve safety and reduce operational errors.

## What Changes

1.  **Data Model Enhancement**:
    *   Update `Child` entity (or its mock data) to include `medicalAlerts` (e.g., allergies, chronic conditions).
2.  **Attendance UI Improvements**:
    *   Add an "Alert" icon to the student card in `AttendanceScreen.tsx` if the student has medical alerts.
    *   Implement a "Quick View" for these alerts (popover or expanding section).
3.  **Confirmation Flow**:
    *   Add a `AttendanceSummaryModal` that appears before the final submission.
    *   The modal will show the count of present vs. absent students and allow a final review.
4.  **Bulk Action**:
    *   Add a "Mark All Present" button for efficiency.

## Capabilities

### Modified Capabilities
- `monitor-attendance-management`: Improved safety and accuracy in student check-ins.

## Impact

- `src/presentation/screens/monitor/AttendanceScreen.tsx`: Major UI updates for cards and the new confirmation modal.
- `src/infrastructure/enrollment/repositories/MockChildRepository.ts`: Updated mock data with medical alerts.
