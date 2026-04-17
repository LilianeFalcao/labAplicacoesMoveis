# Tasks: Admin Approval & Monitor Sync

## Domain
- [ ] Add `subscribe` to `IAccessRequestRepository` <!-- id: d4 -->
- [ ] Add `update` or `approve` method to `IAccessRequestRepository` <!-- id: d5 -->

## Application
- [ ] Create `ApproveAccessRequestUseCase` <!-- id: a3 -->
- [ ] Create `GetPendingAccessRequestsUseCase` <!-- id: a4 -->

## Infrastructure
- [ ] Implement observer pattern in `MockAccessRequestRepository` <!-- id: i3 -->

## Presentation
- [ ] Add "Solicitações Pendentes" link to `AdminHomeScreen` <!-- id: p4 -->
- [ ] Create `PendingRequestsScreen` for Admin <!-- id: p5 -->
- [ ] Refactor `MonitorHomeScreen` to use dynamic data from repositories <!-- id: p6 -->
- [ ] Implement subscription/sync in `MonitorHomeScreen` <!-- id: p7 -->
