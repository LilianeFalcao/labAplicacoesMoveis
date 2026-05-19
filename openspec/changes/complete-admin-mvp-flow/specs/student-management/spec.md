## ADDED Requirements

### Requirement: Student Registration
O sistema MUST permitir ao administrador cadastrar uma nova criança inserindo Nome Completo, Data de Nascimento e, opcionalmente, associar uma Turma e capturar uma foto de perfil usando a câmera do dispositivo.

#### Scenario: Successful Registration with Photo
- **WHEN** o administrador preenche o nome "Lucas Silva", seleciona a data "12/08/2020", associa a turma "Maternal I", captura uma foto de perfil válida com a câmera e clica em "Salvar"
- **THEN** o sistema SHALL salvar os dados da criança na tabela `public.children` e fazer upload da foto no bucket `children-photos` do Supabase Storage, exibindo uma mensagem de sucesso

#### Scenario: Successful Registration without Photo
- **WHEN** o administrador preenche o nome "Mariana Costa", seleciona a data "05/04/2019", não captura foto de perfil e clica em "Salvar"
- **THEN** o sistema SHALL salvar os dados da criança com a URL de foto nula e exibir uma mensagem de sucesso

### Requirement: List and Filter Students
O sistema MUST listar todas as crianças cadastradas na tela administrativa, oferecendo uma barra de busca textual pelo nome da criança e um dropdown de filtro para selecionar a turma correspondente.

#### Scenario: Searching Students by Name
- **WHEN** o administrador digita "Lucas" na barra de busca de alunos
- **THEN** o sistema SHALL filtrar a listagem em tempo real exibindo apenas as crianças cujos nomes contenham a palavra digitada

#### Scenario: Filtering Students by Class
- **WHEN** o administrador seleciona a turma "Maternal I" no dropdown de filtros de turmas
- **THEN** o sistema SHALL filtrar a listagem exibindo apenas as crianças vinculadas à turma selecionada

### Requirement: Edit Student Details
O sistema MUST permitir ao administrador editar o Nome Completo, Data de Nascimento e a associação de Turma de qualquer criança cadastrada.

#### Scenario: Successfully Updating Student Class
- **WHEN** o administrador seleciona uma criança vinculada à turma "Maternal I", altera a seleção de turma para "Maternal II" e clica em "Salvar"
- **THEN** o sistema SHALL persistir a atualização no banco de dados e recarregar a lista atualizada

### Requirement: Delete Student
O sistema MUST permitir ao administrador excluir o cadastro de uma criança, removendo seus registros correspondentes.

#### Scenario: Confirming and Deleting Student
- **WHEN** o administrador clica no botão de exclusão de um aluno e confirma a ação de exclusão no alerta de segurança
- **THEN** o sistema SHALL deletar o registro da tabela `public.children` e remover a foto de perfil do bucket de storage, se houver
