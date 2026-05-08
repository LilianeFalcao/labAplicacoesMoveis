# Design: Monitor Temporary Access Request

## Architecture
We will use a clean architecture approach, defining the entity and repository interfaces in the domain layer, use cases in the application layer, and mock implementations in the infrastructure layer.

## Data Model

### ClassAccessRequest
```typescript
interface ClassAccessRequest {
  id: string;
  monitorId: string;
  classId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: Date;
}
```

## UI Component
A Modal triggered by the "Solicitar" button in `MonitorHomeScreen`. It will list classes returned by the repository.
