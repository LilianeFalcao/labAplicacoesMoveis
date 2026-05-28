## Why

Atualmente, o processo de criação de atividades de turma ("Nova Atividade") pelo monitor exibe sucesso visual, mas falha silenciosamente na persistência remota (Supabase) e não é refletido de forma confiável nas telas do aplicativo (Agenda do Monitor, Chamada e Home). Além disso, telas essenciais continuam apresentando dados simulados (mockados), inviabilizando o status de MVP funcional da plataforma. 

Resolver essa falha de persistência e remover os mocks agora é crítico para permitir o acompanhamento em tempo real da agenda das crianças pelas famílias no Centro Bambolê.

---

## What Changes

### Alterações Principais
- **Geração de ID Válido (UUID):** Substituição da geração de IDs proprietários ou falhos no ambiente mobile por UUIDs em formato RFC 4122 versão 4. Isso resolve o erro silencioso de banco de dados do Supabase na tabela `class_activities`, cujo campo chave `id` exige o tipo nativo `uuid`.
- **Estratégia de Cache Online-First com Resiliência Offline:** O repositório de atividades da turma (`SupabaseAgendaRepository`) agora buscará primeiramente o servidor Supabase quando houver conexão ativa. Em caso de sucesso, o SQLite local é atualizado (preservando alterações locais pendentes), evitando dados desatualizados na Agenda. Em caso de falha de conexão ou modo offline estrito, o SQLite será o fallback resiliente automático.
- **Eliminação Completa de Mocks na Agenda:** O `MockAgendaRepository` será alterado para delegar todas as chamadas de salvamento, alteração de status e consulta diretamente ao repositório real, garantindo que se uma turma não tiver atividades, seja exibida uma tela vazia amigável em vez de atividades mockadas como a "Oficina de Slime Colorido".

### Tabela de Perfis e Necessidades Principais

| Perfil | Necessidade Principal em Relação às Atividades |
| :--- | :--- |
| **Monitor** | Criar atividades em tempo real (mesmo offline) para a turma e alterar o status para indicar o andamento do dia. |
| **Parent** | Visualizar a agenda real atualizada das atividades do filho para acompanhar o cronograma diário do Centro Bambolê. |
| **Admin** | Gerenciar o histórico e garantir o cumprimento da grade de atividades das turmas do centro. |

### Decisões de LGPD (Consentimento de Imagem)
Embora as atividades em si não exibam fotos diretamente neste fluxo de agenda, as telas vinculadas (como a Chamada de Alunos e a publicação de fotos de atividades) dependem estritamente do consentimento ativo de LGPD concedido pelos pais. O monitor só poderá registrar presença ou publicar fotos de atividades para crianças cujos responsáveis aceitaram expressamente o termo de consentimento de imagem da plataforma Bambolê.

### Escopo (O que NÃO está incluído no MVP)
- Não está incluída a edição/alteração dos detalhes de uma atividade (título, descrição, horário) após criada.
- Não está incluída a exclusão de atividades criadas por engano.
- Não está incluído nenhum mecanismo de notificação customizada para cada alteração individual de status da atividade.

---

## Capabilities

### New Capabilities
- `class-activities`: Gerenciamento integrado e resiliente offline/online de atividades da agenda da turma para o perfil de Monitor, com sincronização transparente para o banco centralizado Supabase.

### Modified Capabilities
*(Nenhuma modificação em contratos de especificações existentes)*

---

## Impact

- **UI/Componentes:** `QuickAddActivityModal.tsx` passará a importar `generateUUID` do arquivo de utilitários e disparar um sincronismo imediato robusto.
- **Telas:** `MonitorHomeScreen.tsx`, `GroupAgendaScreen.tsx` e `AttendanceScreen.tsx` passarão a refletir com exatidão as atividades persistidas do SQLite/Supabase em vez de mocks em memória.
- **Infraestrutura de Dados:** `SupabaseAgendaRepository.ts` e `MockAgendaRepository.ts` serão refatorados.
- **Sincronização:** `OfflineSyncService.ts` processará os payloads das filas de sincronização com UUIDs válidos e notificará o monitor na aba do sininho ao concluir conexões com sucesso.
- **Testes:** Os testes de componente `QuickAddActivityModal.test.tsx` e repositórios Jest serão ajustados para refletir a nova estratégia sem quebras.
