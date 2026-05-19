## ADDED Requirements

### Requirement: List Monitors and Assignments
O sistema MUST carregar e listar na tela de gestão de equipe todos os usuários que possuem a permissão de monitor (`role = 'monitor'`), indicando quais turmas estão associadas a eles.

#### Scenario: Visualizing Assigned Classes
- **WHEN** o administrador acessa a tela de gestão de equipe
- **THEN** o sistema SHALL consultar a tabela de usuários e de `monitor_activities`, exibindo cada monitor com seus respectivos dados e o nome de suas turmas associadas

### Requirement: Register Monitor
O sistema MUST permitir ao administrador cadastrar uma nova conta de monitor fornecendo Nome Completo, E-mail e uma Senha inicial de acesso.

#### Scenario: Creating a New Monitor Account
- **WHEN** o administrador preenche o formulário com Nome "Carlos Souza", E-mail "carlos.monitor@bambole.app", Senha "senha123" e submete o formulário
- **THEN** o sistema SHALL registrar a conta no Supabase Auth através de um cliente secundário de forma isolada, gerando um registro correspondente na tabela `public.users` com `role = 'monitor'`, mantendo o administrador conectado em sua sessão atual

### Requirement: Assign Class to Monitor
O sistema MUST possibilitar que o administrador vincule ou desvincule uma turma a um monitor específico.

#### Scenario: Linking a Class
- **WHEN** o administrador seleciona a opção de atribuir turma no card de "Carlos Souza", seleciona a turma "Robótica Básica" no modal e confirma
- **THEN** o sistema SHALL salvar o vínculo na tabela `public.monitor_activities` e recarregar a visualização exibindo a nova turma vinculada

### Requirement: Redefine Monitor Password
O sistema MUST fornecer uma interface para que o administrador solicite a redefinição de senha de um monitor.

#### Scenario: Manually Resetting Password
- **WHEN** o administrador clica na opção de redefinir senha do monitor, digita uma nova senha e confirma
- **THEN** o sistema SHALL exibir um alerta de confirmação e simular visualmente a redefinição de credenciais de forma bem-sucedida
