## ADDED Requirements

### Requirement: Monitor pode criar atividade rapidamente pelo FAB da Home Screen
O sistema SHALL permitir que o monitor crie uma nova atividade da agenda da turma diretamente pela tela inicial (Home Screen), através de uma ação no SpeedDial (FAB), sem precisar navegar para outra tela. A criação SHALL funcionar offline, persistindo localmente no SQLite e enfileirando sincronização automática.

#### Scenario: Acesso ao atalho "Nova Atividade" no SpeedDial
- **WHEN** o monitor abre o SpeedDial na Home Screen
- **THEN** o sistema SHALL exibir a ação "Nova Atividade" com ícone `calendar-plus` na lista de ações disponíveis

#### Scenario: Abertura do modal de criação rápida
- **WHEN** o monitor pressiona a ação "Nova Atividade" no SpeedDial
- **THEN** o sistema SHALL exibir um modal BottomSheet com formulário de criação contendo: campo de título (obrigatório), campo de descrição (opcional), seletor de horário de início (HH:MM), seletor de horário de término (HH:MM), seletor de categoria (Atividade / Refeição / Intervalo), e seletor de turma pré-preenchido com a primeira turma do monitor

#### Scenario: Validação de campos obrigatórios
- **WHEN** o monitor tenta confirmar a criação sem preencher o título
- **THEN** o sistema SHALL exibir mensagem de erro inline "Título é obrigatório" e impedir o envio

#### Scenario: Validação de horário inválido
- **WHEN** o monitor define um horário de término anterior ao horário de início
- **THEN** o sistema SHALL exibir mensagem de erro "Horário de término deve ser após o início" e impedir o envio

#### Scenario: Criação bem-sucedida com conexão online
- **WHEN** o monitor preenche o formulário válido e confirma, estando online
- **THEN** o sistema SHALL inserir a atividade na tabela local `class_activities` (SQLite) com `synced = 0`, enfileirar uma ação `ADD_ACTIVITY` na `sync_queue`, exibir feedback de sucesso ("Atividade criada!"), fechar o modal, e atualizar a seção "Agenda de Hoje" da Home Screen com a nova atividade

#### Scenario: Criação bem-sucedida no modo offline
- **WHEN** o monitor preenche o formulário válido e confirma, estando offline
- **THEN** o sistema SHALL inserir a atividade localmente (SQLite) com `synced = 0`, enfileirar `ADD_ACTIVITY` na `sync_queue`, exibir feedback "Atividade salva localmente. Será sincronizada quando houver conexão.", e fechar o modal

#### Scenario: Monitor sem turma atribuída tenta acessar o atalho
- **WHEN** o monitor que não possui nenhuma turma atribuída pressiona "Nova Atividade" no SpeedDial
- **THEN** o sistema SHALL exibir um Alert informando "Você precisa ter uma turma atribuída para criar atividades." e não abrir o modal

#### Scenario: Sincronização automática ao reconectar
- **WHEN** o dispositivo reconecta à internet após criação offline de atividade
- **THEN** o sistema SHALL executar `OfflineSyncService.syncUp()`, processar a ação `ADD_ACTIVITY` da fila, upsert o registro na tabela `class_activities` do Supabase, e marcar `synced = 1` localmente
