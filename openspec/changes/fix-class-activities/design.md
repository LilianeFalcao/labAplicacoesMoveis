## Context

O monitor do Centro Bambolê pode registrar atividades diárias para as turmas (como oficinas, refeições e intervalos). Atualmente, a criação de novas atividades falha silenciosamente ao sincronizar com o Supabase remoto devido à geração de IDs em formato incompatível (`act_177...`) para chaves primárias do tipo `uuid`. Além disso, a estratégia de consulta de atividades no `SupabaseAgendaRepository.findByClass` é ineficiente e ignora atualizações do servidor caso o cache local contenha qualquer registro, impedindo a sincronização em tempo real de novas atividades adicionadas remotamente por outros monitores. Por fim, o `MockAgendaRepository` apresenta dados simulados (mockados) que prejudicam a percepção de um MVP funcional completo.

## Goals / Non-Goals

**Goals:**
* **Conformidade de ID com UUID v4**: Substituir a geração mobile de ID no modal de criação por UUID v4 robusto e compatível com Postgres/Supabase.
* **Estratégia de Sincronização Online-First com Fallback Resiliente**: Atualizar `SupabaseAgendaRepository.findByClass` para primeiro buscar os dados mais recentes do Supabase (quando online), limpar os registros sincronizados antigos daquela turma no SQLite local, salvar os novos e então recuperar a lista unificada contendo as atividades sincronizadas e atividades locais pendentes de envio.
* **Resiliência Estrita Offline**: Em caso de falha de conexão ou timeout na consulta remota, buscar diretamente e de forma transparente no SQLite local.
* **Exclusão Absoluta de Mock de Agenda**: Garantir que o `MockAgendaRepository` atue puramente como um delegador transparente para o repositório de persistência real, eliminando mock-ups como "Oficina de Slime Colorido".
* **Preservação Verde de Testes**: Garantir que toda a suíte de testes de unidade e componentes continue passando com 100% de sucesso.

**Non-Goals:**
* Implementar alteração ou exclusão de atividades no aplicativo móvel.
* Implementar toggles de notificações no perfil de usuário.
* Modificar a lógica de upload de fotos de atividades neste ciclo.

## Decisions

### Decisão 1: Geração de UUID v4 no QuickAddActivityModal
* **Opção A (Escolha)**: Utilizar a função utilitária `generateUUID` existente no arquivo `src/infrastructure/utils/uuid.ts` com fallback gracioso para mock global em testes (`global.crypto.randomUUID`).
  * **Código**: `const id = (globalThis as any).crypto?.randomUUID?.() ?? generateUUID();`
  * **Rationale**: O ambiente React Native (especialmente Hermes no Expo Go) não expõe a API padrão `crypto` de forma consistente. O utilitário `generateUUID` implementa uma geração compatível com RFC 4122 v4 pura e segura. Manter a verificação do mock de `crypto` no escopo global preserva inteiramente o comportamento dos testes Jest sem necessidade de reescrever as asserções de mock do `QuickAddActivityModal.test.tsx`.
* **Alternativa considerada**: Adicionar uma biblioteca externa como `uuid` ou `react-native-get-random-values`. Rejeitada para evitar aumentar a pegada de dependências do app móvel e complexidades de linkagem nativa.

### Decisão 2: Estratégia de Caching Online-First com Resiliência Offline em findByClass
* **Opção A (Escolha)**: Fluxo síncrono remoto com atualização local incremental:
  1. Verificar conexão ou tentar realizar chamada direta à API do Supabase remotamente.
  2. Se a chamada remota for bem-sucedida:
     - Limpar registros previamente sincronizados da turma no cache SQLite: `DELETE FROM class_activities WHERE class_id = ? AND synced = 1`.
     - Inserir/substituir as linhas atualizadas no cache SQLite com `synced = 1`.
  3. Se a chamada falhar (offline, timeout ou erro de rede):
     - Logar o aviso silenciosamente e prosseguir diretamente para a leitura local.
  4. Executar uma consulta consolidada no SQLite local para a turma (`class_id = ? ORDER BY start_time ASC`), abrangendo registros recém-sincronizados e qualquer atividade local pendente (`synced = 0`).
  5. Mapear e retornar a lista.
* **Rationale**: Garante que o monitor sempre veja a versão mais recente da nuvem se estiver online (evitando dados desatualizados), enquanto preserva atividades criadas offline que ainda aguardam sincronização de fila (`synced = 0`).
* **Alternativa considerada**: Retornar os dados online imediatamente sem salvar no SQLite local. Rejeitada, pois quebraria a experiência de uso off-line subsequente na tela de Agenda e Chamada.

### Decisão 3: Delegação Total no MockAgendaRepository
* **Opção A (Escolha)**: Configurar `MockAgendaRepository` para ignorar completamente a flag `useMock` nas listagens reais de produção (mantendo flexibilidade apenas se configurado externamente em testes herméticos específicos) e repassar todas as requisições para a instância singleton do `SupabaseAgendaRepository`.
* **Rationale**: Como os componentes e use cases importam diretamente o `MockAgendaRepository` como a interface central da agenda de atividades, delegar transparentemente para o `SupabaseAgendaRepository` garante a remoção imediata de dados mockados em todo o aplicativo de forma centralizada e segura.

## Risks / Trade-offs

* **[Risco]** Limpeza excessiva de dados locais durante a sincronização online.
  * **Mitigação**: Filtrar estritamente a remoção com a cláusula `synced = 1`. Registros criados localmente pelo monitor que ainda não foram enviados com sucesso ao Supabase terão `synced = 0` e serão integralmente mantidos e exibidos de forma consolidada.
* **[Risco]** Latência percebida em redes móveis instáveis durante a chamada online-first.
  * **Mitigação**: As requisições ao Supabase possuem tempo de resposta ágil e, caso haja falha completa ou timeout de conexão, o fallback para SQLite local é instantâneo e imperceptível ao usuário final.
