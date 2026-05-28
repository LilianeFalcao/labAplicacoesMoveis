## Why

Monitores costumam registrar momentos do dia a dia das turmas em áreas externas do Centro Recreativo (pátios, quadras de esporte) onde o sinal de rede/Wi-Fi é inexistente ou oscilante. Atualmente, a tentativa de compartilhar fotos offline resulta em falha e perda imediata do momento capturado. Esta mudança resolve o problema garantindo enfileiramento offline resiliente e sincronização automática de fotos escolares em background assim que a conexão for restabelecida.

## What Changes

*   **Enfileiramento Offline de Fotos (Monitor):** Permite capturar fotos e digitar legendas sem conexão ativa de internet. A imagem é preservada localmente no dispositivo e a ação é enfileirada no banco SQLite local.
*   **Feedback de Sincronização (Monitor):** Exibe as fotos tiradas offline com um status visual sutil de "Sincronizando..." para dar segurança de que o registro foi armazenado.
*   **Sincronização em Background (Serviço):** Estende o `OfflineSyncService` para que, ao detectar rede, leia a imagem local em Base64, faça o upload para o bucket `children-photos` do Supabase Storage, recupere a URL pública e grave o registro correspondente no banco Supabase remoto.
*   **Mural de Fotos Dinâmico (Pai):** Garante que, uma vez que a sincronização seja concluída, as fotos fiquem disponíveis dinamicamente no feed do pai de acordo com as permissões de turma e as regras da LGPD (consentimento de uso de imagem).

## Capabilities

### New Capabilities
- `offline-photo-sync`: Capacidade de capturar, enfileirar offline no SQLite, realizar o upload em segundo plano no Supabase Storage e exibir fotos escolares com conformidade de segurança e controle de conectividade.

### Modified Capabilities
*Nenhuma capacidade existente modificada (as capacidades anteriores de fotos escolares não possuíam persistência ou sincronização offline).*

## Impact

*   **Interfaces de Usuário (Monitor):** `PhotoCaptureScreen.tsx` é modificada para lidar com falhas de rede de forma graciosa e agendar o sync.
*   **Interfaces de Usuário (Pai):** `PhotoFeedScreen.tsx` e `ParentFeedScreen.tsx` exibirão os momentos sincronizados.
*   **Repositórios:** `SupabaseActivityRepository.ts` passa a suportar enfileiramento no SQLite local e verificação de rede.
*   **Serviços Offline:** `OfflineSyncService.ts` ganha o tipo de ação `POST_PHOTO` para upload de mídia e sincronização de metadados.
*   **Segurança (LGPD):** O upload respeita estritamente as políticas RLS do Supabase Storage bucket `children-photos`.
