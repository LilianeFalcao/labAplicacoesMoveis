## ADDED Requirements

### Requirement: Carregar turmas reais do monitor
O sistema SHALL carregar de forma dinâmica e em tempo real as turmas vinculadas ao monitor que está logado no aplicativo, consultando a tabela `monitor_activities` e as solicitações de acesso aprovadas em `class_access_requests` no Supabase.

#### Scenario: Carregamento bem-sucedido de turmas
- **WHEN** o monitor acessa a tela principal (Home) ou a tela de turmas (Classes)
- **THEN** o sistema realiza a busca das turmas ativas associadas ao ID do monitor
- **AND** exibe os cards das turmas reais carregadas do backend remoto

### Requirement: Exibir alunos reais e badge LGPD na lista de presença
O sistema SHALL obter a lista de alunos matriculados nas turmas do monitor a partir das tabelas reais (`class_enrollments` / `children`) do Supabase e exibir o badge visual vermelho de restrição de foto (LGPD) caso o consentimento de imagem do aluno não esteja ativo.

#### Scenario: Visualizar folha de chamada com alunos reais e badges LGPD
- **WHEN** o monitor abre a folha de presença (Attendance) de uma de suas turmas
- **THEN** o sistema exibe os nomes e fotos dos alunos matriculados reais
- **AND** exibe o badge vermelho com ícone de câmera desativada para alunos sem consentimento de imagem ativo
