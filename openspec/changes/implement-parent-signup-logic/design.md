## Context

Registration is a multi-step process in our Clean Architecture:
1. **Authentication Layer**: Create the user in Supabase Auth.
2. **Identity Layer**: Create the `users` record with role `parent`.
3. **Enrollment Layer**: Create the `guardians` record linked to the user.

## Architecture: The SignUp Flow

### 1. SignUpParentUseCase
This use case will coordinate three operations:
- `authService.signUp(email, password)`: Returns the `userId`.
- `userRepository.create(user)`: Inserts a new record into the `users` table with the name and role.
- `guardianRepository.save(guardian)`: Inserts a new record into the `guardians` table.

### 2. Repository Changes
- **IUserRepository**: Add `create(user: User): Promise<void>`.
- **SupabaseUserRepository**: Implement `create` using `supabase.from('users').insert(...)`.

## Data Model Integration

When a parent signs up:
- **Table `users`**: `role` = 'parent', `full_name` = [User Input].
- **Table `guardians`**: linked to the new `user.id`.

## UI/UX Integration

- **SignUpScreen.tsx**:
  - Add input validation (empty fields, password mismatch).
  - Call `signUp` from `AuthContext`.
  - On success: Show a welcome alert and navigate to `ParentHome`.
  - On error: Show a specific error message (e.g., "Email already in use").

## Decisions

- **Transactional Consistency**: While Supabase doesn't support cross-table transactions easily from the client, we will implement the use case to fail gracefully if the profile creation fails after auth creation.
- **Role Assignment**: The `SignUpParentUseCase` will hardcode the 'parent' role to ensure security and prevent unauthorized role selection.
