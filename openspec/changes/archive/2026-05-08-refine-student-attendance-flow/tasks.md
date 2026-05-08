# Tasks: Refine Student Attendance Flow

- [x] Data Preparation
    - [x] Update `MockChildRepository.ts` to include `medicalAlerts` in mock data for at least 2 students
- [x] UI Refinement
    - [x] Add "Mark All Present" helper button in the list header
    - [x] Implement the Alert icon and its popover/alert logic in the student card
- [x] Confirmation Flow
    - [x] Create the `AttendanceSummaryModal` component (internal to screen or shared)
    - [x] Update `submitAttendance` to show the modal first instead of submitting immediately
    - [x] Implement the actual submission logic triggered from the modal
- [x] Verification
    - [x] Verify that the alert icon only appears for students with medical alerts
    - [x] Confirm that the summary modal shows the correct counts
    - [x] Ensure geolocation is still requested upon final confirmation
