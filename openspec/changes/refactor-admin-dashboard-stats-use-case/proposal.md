## Why

The `GetAdminDashboardStatsUseCase` currently imports the Supabase client directly from the infrastructure layer. This violates the Clean Architecture principles followed in the project, which state that the application layer should not depend on concrete infrastructure implementations. This tight coupling makes the use case difficult to test in isolation and locks it into a specific database technology.

## What Changes

- **Repository Interface**: Define a new `IAdminRepository` in the domain layer to handle administrative data queries.
- **Use Case Refactor**: Update `GetAdminDashboardStatsUseCase` to receive an `IAdminRepository` via dependency injection instead of using the Supabase client directly.
- **Infrastructure Implementation**: Implement `SupabaseAdminRepository` in the infrastructure layer to fulfill the `IAdminRepository` interface using Supabase.
- **Dependency Injection**: Ensure the new repository is instantiated and passed to the use case in the presentation layer (or a central registry).

## Capabilities

### New Capabilities
- **Abstracted Admin Data**: Admin-related queries are now abstracted behind a domain interface.
- **Improved Testability**: `GetAdminDashboardStatsUseCase` can now be tested with mock repositories.

### Modified Capabilities
- **GetAdminDashboardStatsUseCase**: Now follows dependency injection patterns.

## Impact

- **Developer Experience**: Clearer separation of concerns and easier unit testing for admin features.
- **Architectural Integrity**: Aligns the admin context with the rest of the project's Clean Architecture standards.
