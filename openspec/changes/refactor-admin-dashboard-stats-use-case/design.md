## Context

The project uses Clean Architecture + DDD. The `GetAdminDashboardStatsUseCase` is part of the `admin` application layer but currently has a direct dependency on `src/infrastructure/supabase/client.ts`. This refactoring will introduce a repository interface in the `domain` layer to mediate this interaction.

## Goals / Non-Goals

**Goals:**
- Decouple `GetAdminDashboardStatsUseCase` from the Supabase client.
- Define a clear contract for admin dashboard statistics in the domain layer.
- Implement the Supabase-specific logic in the infrastructure layer.

**Non-Goals:**
- Changing the actual logic of how stats are calculated.
- Redesigning the Admin Dashboard UI.

## Decisions

- **Domain Repository**: We will create `src/domain/admin/repositories/IAdminRepository.ts`.
- **Method Signature**: The interface will have a method `getDashboardStats(): Promise<AdminDashboardStats>`.
- **Implementation**: The concrete class will be `SupabaseAdminRepository` located in `src/infrastructure/identity/repositories/` (or a new `admin` folder if appropriate, but current pattern seems to group by domain in infrastructure too).
- **Dependency Injection**: The `AdminHomeScreen` will temporarily instantiate the repository and pass it to the use case, although a more robust DI solution should be considered in the future.

## Risks / Trade-offs

- **Temporary Direct Instantiation**: Until a full DI container or central registry is implemented, the presentation layer will still need to know about the concrete repository implementation to instantiate it. This is a step-by-step improvement rather than a complete overhaul.
