## ADDED Requirements

### Requirement: Geração de ID Compatível com UUID v4
O sistema mobile do Monitor MUST gerar um ID no formato padrão RFC 4122 versão 4 UUID ao criar uma nova atividade localmente, garantindo compatibilidade com o tipo de dados `uuid` da chave primária no Supabase.

#### Scenario: Geração de UUID ao Adicionar Atividade
- **WHEN** o monitor preenche e envia o formulário de "Nova Atividade"
- **THEN** o sistema gera um identificador único de 36 caracteres no padrão UUID v4 e insere o registro na tabela local `class_activities` e na fila `sync_queue`.

---

### Requirement: Sincronização e Cache Online-First de Atividades
Quando o aplicativo estiver online, o repositório MUST realizar a consulta principal diretamente no servidor central do Supabase. Havendo sucesso, o sistema local limpará as atividades previamente sincronizadas e gravará os registros atualizados do servidor no SQLite. Se estiver offline ou em caso de erro na consulta remota, o sistema MUST retornar o cache do SQLite local contendo as atividades sincronizadas e as atividades locais pendentes.

#### Scenario: Consulta com Sucesso Online
- **WHEN** o monitor acessa a tela de Agenda com conexão de internet ativa
- **THEN** o sistema consulta o Supabase, atualiza a tabela SQLite `class_activities` apagando dados sincronizados antigos e inserindo os novos, e retorna a lista combinada e ordenada por horário.

#### Scenario: Consulta sem Conexão (Modo Offline)
- **WHEN** o monitor acessa a tela de Agenda sem conexão de internet ativa (ou em caso de timeout de rede)
- **THEN** o sistema recupera todas as atividades registradas localmente no SQLite, preservando o estado e exibindo o badge indicativo de modo offline.

---

### Requirement: Ausência Completa de Dados Mockados
O repositório de atividades da turma SHALL retornar unicamente registros reais e persistidos no banco de dados (SQLite/Supabase) na listagem da Agenda e na tela de Chamada do Monitor. Em nenhuma hipótese dados mockados de simulação devem ser injetados se a lista de atividades estiver vazia.

#### Scenario: Agenda sem Atividades
- **WHEN** a turma selecionada não possui nenhuma atividade cadastrada no banco de dados
- **THEN** o sistema retorna uma lista vazia e a interface gráfica apresenta a mensagem "Nenhuma atividade cadastrada. Cadastre atividades para a turma!".
