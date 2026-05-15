## 1. Domain Layer (Contract)

- [x] 1.1 Create `IAdminRepository.ts` in `src/domain/admin/repositories/`. Define `getDashboardStats()` method. (1h)
- [x] 1.2 Move `AdminDashboardStats` type to `src/domain/admin/entities/` if not already there, or keep it in a shared domain location. (0.5h)

## 2. Infrastructure Layer (Implementation)

- [x] 2.1 Create `SupabaseAdminRepository.ts` in `src/infrastructure/identity/repositories/` (or `src/infrastructure/admin/repositories/`). (1.5h)
- [x] 2.2 Implement `getDashboardStats()` using the existing Supabase logic from the current use case. (1h)

## 3. Application Layer (Use Case Refactor)

- [x] 3.1 Update `GetAdminDashboardStatsUseCase.ts` to accept `IAdminRepository` in its constructor. (1h)
- [x] 3.2 Refactor the `execute()` method to call `this.adminRepo.getDashboardStats()`. (0.5h)
- [x] 3.3 Update unit tests for the use case to use a mock repository. (1.5h)

## 4. Presentation Layer (Integration)

- [x] 4.1 Update `AdminHomeScreen.tsx` to instantiate `SupabaseAdminRepository` and pass it to the use case. (1h)
- [x] 4.2 Verify the dashboard still displays correct data after refactoring. (1h)

## Priorização
🔴 Core: 1.1, 2.1, 3.1, 4.1
🟡 Importante: 3.3, 4.2
🟠 Bônus: 1.2
