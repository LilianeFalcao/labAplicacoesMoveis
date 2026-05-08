## Context

The current login implementation allows one-tap access to different roles. The user wants to re-introduce a password step to make the flow more realistic.

## Goals / Non-Goals

**Goals:**
- Sync the `email` field with the selected role.
- Require the constant '123456' as a valid demo password.
- Maintain the visual role-selection cards for convenience.

**Non-Goals:**
- Authenticating against a real database.
- Supporting multiple different passwords for different roles.

## Decisions

- **Email Sync Logic**: When a user selects a role (e.g., 'Monitor'), the email field will be updated to `pedro.monitor@bambole.app`.
- **Validation Rule**: The `handleLogin` function will be modified to:
  ```javascript
  if (!password) { 
    Alert.alert('Erro', 'Por favor, digite sua senha.');
    return;
  }
  if (password !== '123456') {
     Alert.alert('Acesso Negado', "Para fins de demonstração, use a senha '123456'.");
     return;
  }
  ```
- **Password Masking**: The password input will continue to use `secureTextEntry`.

## Risks / Trade-offs

- **User Friction**: Users have to type '123456' manually. We will provide a placeholder or hint if needed, but the current plan is to use a clear alert message on failure.
