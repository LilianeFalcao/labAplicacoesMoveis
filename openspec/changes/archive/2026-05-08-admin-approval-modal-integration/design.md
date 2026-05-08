# Design: Admin Approval Modal and Badge Integration

## UI Components

### Notification Badge
A small red circle with a white number, positioned at the top-right corner of the `ActionItem` icon in `AdminHomeScreen`.

### PendingRequestsModal
A slide-up modal (similar to the monitor's `ClassSelectionModal`) containing the list of pending requests.

## State Management
The `AdminHomeScreen` will subscribe to the `MockAccessRequestRepository` to update the badge count reactively.

## Flow
1. `AdminHomeScreen` mounts and subscribes to `AccessRequestRepository`.
2. Badge count is calculated via `repository.findPending().length`.
3. Admin clicks the button; `isModalVisible` state becomes true.
4. `PendingRequestsModal` loads data and provides Approve actions.
5. Approving a request triggers the repository's notification, causing the `AdminHomeScreen` badge to update automatically.
