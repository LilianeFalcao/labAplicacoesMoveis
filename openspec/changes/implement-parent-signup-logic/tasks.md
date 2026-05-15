## 1. Domain & Infrastructure (Core Logic)

- [x] 1.1 Update `IUserRepository` and `SupabaseUserRepository` to include a `create` method. (1h)
- [x] 1.2 Create `SignUpParentUseCase.ts` in `src/application/identity/use-cases/`. (2h)
- [x] 1.3 Add `signUp` method to `AuthContext.tsx` and integrate the new use case. (1.5h)

## 2. Presentation (UI Integration)

- [x] 2.1 Refactor `SignUpScreen.tsx` to use the `signUp` method from `AuthContext`. (1.5h)
- [x] 2.2 Implement form validation (password matching, required fields). (1h)
- [x] 2.3 Add success/error feedback (Alerts) and navigation logic. (1h)

## 3. Verification

- [x] 3.1 Perform a full registration flow and verify records in `auth.users`, `public.users`, and `public.guardians`. (1h)
- [x] 3.2 Test error scenarios (existing email, network failure). (1h)

## Priorização
🔴 Core: 1.1, 1.2, 1.3, 2.1
🟡 Importante: 2.2, 2.3
