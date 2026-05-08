# Proposal: Admin Approval Modal and Badge Integration

## Goal
Improve the administrator's experience by providing immediate visibility of pending access requests and streamlining the approval process via a modal.

## Context
Currently, the administrator must navigate to a separate screen to see if there are any pending requests. This improvement adds a notification badge to the home screen and uses a modal for quick approvals without losing context.

## Proposed Changes
- Add a notification badge to the "Solicitações de Acesso" button in `AdminHomeScreen`.
- Implement `PendingRequestsModal` component.
- Replace navigation to `PendingRequestsScreen` with the new modal.
- Ensure the badge updates in real-time using existing repository subscriptions.
