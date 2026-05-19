## ADDED Requirements

### Requirement: List Classes and Occupancy
O sistema MUST listar as turmas cadastradas na interface administrativa do aplicativo, exibindo para cada turma o nome, a descrição, a grade horária e a contagem real de alunos matriculados para demonstrar a ocupação da turma.

#### Scenario: Displaying Occupancy Percentage
- **WHEN** o administrador acessa a tela de gestão de turmas
- **THEN** o sistema SHALL carregar a listagem de turmas de `public.classes` e contar as crianças matriculadas em cada turma em `public.children`, exibindo a contagem na tela (ex: "12 alunos matriculados")

### Requirement: Create New Class
O sistema MUST permitir ao administrador criar uma nova turma preenchendo Nome, Descrição, Faixa Etária e definindo a Grade Horária Semanal (dias da semana e intervalo de horário).

#### Scenario: Successful Class Creation
- **WHEN** o administrador insere o nome "Berçário A", seleciona os dias "MON" e "WED", define o horário "08:00" até "12:00" e clica em "Salvar"
- **THEN** o sistema SHALL salvar os dados na tabela `public.classes` gravando a grade horária estruturada no formato JSONB e exibir uma notificação de sucesso

### Requirement: Edit Class Details
O sistema MUST possibilitar que o administrador altere o Nome, Descrição, Faixa Etária e a Grade Horária de qualquer turma cadastrada.

#### Scenario: Updating Class Schedule
- **WHEN** o administrador edita a turma "Berçário A", altera o horário final de "12:00" para "13:00" e clica em "Salvar"
- **THEN** o sistema SHALL persistir a atualização no banco de dados e recarregar os dados na tela
