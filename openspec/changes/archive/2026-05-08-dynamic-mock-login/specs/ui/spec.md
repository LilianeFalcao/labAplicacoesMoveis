## ADDED Requirements

### Requirement: Dynamic Email Input
The **E-MAIL** field on the Login screen must allow arbitrary text input. The application must not restrict valid logins to a predefined list of mock addresses.

### Requirement: Role-Navigation Linkage
The **Role Selection Cards** (Responsável, Monitor, Admin) remain the primary method for simulating user differentiation in the absence of a backend. Tapping a card:
1. Sets the internal `selectedRole` state.
2. Updates the **E-MAIL** field ONLY IF it is currently empty.

### Requirement: Accurate Session Reflection
Once logged in, the application's header and profile sections must display the EXACT email entered by the user during the login process, confirming that the mock session is dynamic.

### Requirement: Standard Password
The password `123456` remains the required entry for all simulated logins to maintain a consistent testing environment.
