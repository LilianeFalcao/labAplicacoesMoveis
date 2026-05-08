## ADDED Requirements

### Requirement: Authentication Screen Flow
The app must provide a visual identity consistent with the designs for Login, Signup, and Password Recovery.

#### Scenario: Login Screen
- **WHEN** the user opens the app and is not authenticated
- **THEN** the Login screen must be displayed showing inputs for user/email and password, as seen in `login_screen.png`.

#### Scenario: Password Recovery
- **WHEN** the user clicks "Esqueci minha senha"
- **THEN** they should be taken to the Password Recovery screen as seen in `tela_de_recuperacao_senha.png`.

#### Scenario: Parent Signup
- **WHEN** a new parent wants to register
- **THEN** they should see the multi-step or single-page form as seen in `cadastro_dos_pais.png`.
