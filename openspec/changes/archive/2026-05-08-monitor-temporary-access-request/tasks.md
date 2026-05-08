# Tasks: Monitor Temporary Access Request

## Domain
- [ ] Create `ClassAccessRequest` entity <!-- id: d1 -->
- [ ] Add `findAllWithoutMonitor` to `IClassRepository` <!-- id: d2 -->
- [ ] Create `IAccessRequestRepository` interface <!-- id: d3 -->

## Application
- [ ] Create `GetClassesWithoutMonitorUseCase` <!-- id: a1 -->
- [ ] Create `RequestTemporaryAccessUseCase` <!-- id: a2 -->

## Infrastructure
- [ ] Implement `MockAccessRequestRepository` <!-- id: i1 -->
- [ ] Implement `MockClassRepository` (extension) <!-- id: i2 -->

## Presentation
- [ ] Create `MonitorHomeScreen.test.tsx` for TDD <!-- id: p1 -->
- [ ] Implement `ClassSelectionModal` component <!-- id: p2 -->
- [ ] Integrate Modal into `MonitorHomeScreen` <!-- id: p3 -->
