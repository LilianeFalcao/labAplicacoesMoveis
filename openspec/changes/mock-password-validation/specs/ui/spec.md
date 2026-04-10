## ADDED Requirements

### Requirement: Email Field Synchronization
Tapping on any Role Selection card must immediately update the **E-MAIL** input field with its corresponding demonstration address:
- **Pai/Mãe**: `ana.parent@bambole.app`
- **Monitor**: `pedro.monitor@bambole.app`
- **Escola**: `diretoria@bambole.app`

### Requirement: Password Validation Rule
The **Entrar** button must only allow navigation to the role stacks if the following conditions are met:
1. The **SENHA** field is not empty.
2. The value entered in **SENHA** matches exactly `123456`.

### Requirement: Error Handling
- **Missing Password**: If the password field is empty, show an `Alert` with title "Erro" and message "Por favor, preencha sua senha."
- **Incorrect Password**: If the password is not `123456`, show an `Alert` with title "Erro" and message "Por favor, use a senha de demonstração '123456'."
