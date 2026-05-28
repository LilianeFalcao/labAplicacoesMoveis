## 1. Geração de IDs Válidos (UUID v4)

- [x] 1.1 Importar o utilitário `generateUUID` em `QuickAddActivityModal.tsx` a partir de `../../../infrastructure/utils/uuid`.
- [x] 1.2 Atualizar a inicialização da variável `id` no método `handleCreate` de `QuickAddActivityModal.tsx` para `(globalThis as any).crypto?.randomUUID?.() ?? generateUUID();`.

## 2. Refatoração de Persistência com Estratégia Online-First

- [x] 2.1 Atualizar `SupabaseAgendaRepository.findByClass` para consultar prioritariamente a tabela `class_activities` no Supabase remoto.
- [x] 2.2 Ao obter sucesso remoto, remover os registros sincronizados antigos no SQLite local com a query `DELETE FROM class_activities WHERE class_id = ? AND synced = 1`.
- [x] 2.3 Gravar incrementalmente os novos registros retornados do Supabase remoto no SQLite local com `synced = 1`.
- [x] 2.4 Consultar e retornar todos os registros da tabela local `class_activities` (combinando os novos sincronizados com os eventuais itens locais pendentes de envio com `synced = 0`).
- [x] 2.5 Em caso de erro remoto (offline ou falha de rede), capturar a exceção e realizar fallback transparente buscando direto da base local SQLite.

## 3. Eliminação Completa de Atividades Mockadas

- [x] 3.1 Refatorar `MockAgendaRepository.ts` para que todos os seus métodos (`findByClass`, `save`, `updateStatus`) deleguem chamadas diretamente à instância de `SupabaseAgendaRepository`.

## 4. Revisão e Refinamento de Notificações de Sincronização

- [x] 4.1 Revisar os textos de notificações em `OfflineSyncService.ts` para garantir linguagem amigável em português brasileiro (PT-BR) e visual refinado.
- [x] 4.2 Assegurar que notificações de sucesso e erro sejam devidamente salvas no repositório de notificações (`MockNotificationRepository`) para visualização na aba de notificações ("sininho").

## 5. Validação e Testes Automatizados

- [x] 5.1 Executar a suíte de testes de componentes (`QuickAddActivityModal.test.tsx`) para confirmar que a geração de UUID funciona integradamente com os mocks de Jest.
- [x] 5.2 Rodar os testes de unidade de use cases (`TakeAttendanceUseCase.test.ts`) e verificar que toda a suíte permanece verde.
