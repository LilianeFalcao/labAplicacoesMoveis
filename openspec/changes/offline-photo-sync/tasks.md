## 1. Infraestrutura & Sincronização Offline

- [x] 1.1 Estender o `OfflineSyncService.ts` para suportar o tipo de ação `'POST_PHOTO'` dentro do método de sincronização `syncUp`.
- [x] 1.2 Implementar na ação `'POST_PHOTO'` a leitura em base64 do arquivo de imagem do dispositivo via `FileSystem.readAsStringAsync`.
- [x] 1.3 Implementar o upload da imagem decodificada para o bucket do Supabase Storage `children-photos` no `syncUp`.
- [x] 1.4 Implementar a gravação no banco de dados remoto da tabela `activity_photos` associando a URL pública e os metadados do momento.
- [x] 1.5 Adicionar o disparo de uma notificação push "✨ Sincronização Concluída" via `NotificationService` especificando que novos momentos das turmas foram compartilhados.

## 2. Repositórios & Casos de Uso

- [x] 2.1 Adicionar bloco `try/catch` no método `savePhoto` de `SupabaseActivityRepository.ts` para capturar falhas de rede.
- [x] 2.2 Implementar no bloco de captura de erro o enfileiramento da ação `'POST_PHOTO'` na tabela SQLite `sync_queue` com o payload de metadados e URI local.
- [x] 2.3 Estender a busca de feeds no repositório de forma que integre as fotos salvas localmente na fila pendente de envio, permitindo listá-las com flag visual temporária no app.

## 3. Apresentação & UI

- [x] 3.1 Atualizar `PhotoCaptureScreen.tsx` para exibir mensagem de confirmação amigável mesmo em caso de falha de conexão ("Momento guardado com segurança offline!").
- [x] 3.2 Adicionar selo visual de "Sincronizando..." com um ícone de relógio no feed de fotos para itens cujo status de fila local ainda esteja pendente.

## 4. Testes & Validação

- [x] 4.1 Escrever testes unitários para a ação `'POST_PHOTO'` dentro do fluxo de processamento de `OfflineSyncService.test.ts`.
- [x] 4.2 Escrever testes de integração no repositório de atividades para validar a gravação robusta de itens pendentes no SQLite local.
- [x] 4.3 Executar a suíte de testes (`npm run test`) para assegurar que não haja quebras ou regressões no fluxo.
- [x] 4.4 Validar o fluxo completo simulando perda de conectividade no aparelho/emulador e verificando o upload automático ao reconectar.
