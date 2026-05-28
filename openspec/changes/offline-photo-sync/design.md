## Context

Atualmente, o fluxo de compartilhamento de fotos no monitor depende de rede ativa e falha instantaneamente se a conexão falhar. Para prover resiliência completa (offline-first), a arquitetura precisa desacoplar a captura de mídia do envio físico à nuvem, enfileirando as ações offline no SQLite local e utilizando o `OfflineSyncService` em background.

## Goals / Non-Goals

**Goals:**
*   Habilitar captura e agendamento offline de fotos escolares de forma segura.
*   Processar uploads de mídia em Base64 para o Supabase Storage e registro no Supabase DB em background.
*   Manter a integridade de dados e conformidade estrita com a LGPD (autorização prévia dos pais).
*   Prover visibilidade de status de carregamento ("Sincronizando...") na interface do monitor.

**Non-Goals:**
*   Edição de imagens offline ou filtros fotográficos.
*   Compressão ou redimensionamento avançado de imagem (usaremos a imagem capturada pelo Expo).
*   Sincronização P2P entre aparelhos de pais e monitores.

## Perfis de Usuário e Necessidades Principais

| Perfil (Role) | Necessidade Principal | Papel no Fluxo de Fotos |
| :--- | :--- | :--- |
| **monitor** | Registrar e compartilhar momentos pedagógicos das turmas de forma fluida, mesmo sem internet no pátio. | Captura fotos offline, enfileira no SQLite e visualiza o status do envio. |
| **parent** | Acompanhar a rotina dos filhos com total controle de privacidade e segurança dos dados. | Assina o consentimento da LGPD e consome as fotos sincronizadas no feed. |
| **admin** | Garantir a conformidade legal do centro recreativo e o correto vínculo de turmas. | Supervisiona os termos de consentimento e a integridade do banco de dados. |

## Decisions

### Decisão 1: Enfileiramento de Metadados e Caminho da Mídia (Não o Base64) no SQLite
Optamos por armazenar na tabela `sync_queue` do SQLite apenas os metadados e a URI local temporária da foto (`file://...`) em vez de persistir a string Base64 completa da imagem. 
*   **Razão:** Salvar strings Base64 gigantescas no SQLite local aumentaria dramaticamente o consumo de armazenamento do dispositivo e degradaria a performance de leitura/escrita do banco de dados local. A leitura em Base64 e codificação serão realizadas sob demanda, no momento do processamento no `OfflineSyncService.syncUp`.
*   **Alternativas Consideradas:** Salvar o Base64 completo no banco local (Rejeitado por ineficiência e bloat de cache).

### Decisão 2: Delegação do Processamento de Upload ao `OfflineSyncService`
A lógica de upload físico da foto para o Supabase Storage bucket `children-photos` é integrada diretamente ao sincronizador central `OfflineSyncService.syncUp()` sob a ação `POST_PHOTO`.
*   **Razão:** Centraliza o gerenciamento de conectividade, retentativas e tratamento de erros em um único serviço unificado, facilitando o disparo de notificações push e controle de falhas globais.
*   **Alternativas Consideradas:** Deixar cada repositório com sua própria lógica de background (Rejeitado por dispersão de controle e duplicidade de código).

## LGPD (Consentimento de Imagem)

*   **Validação em Camada Dupla:** O feed do pai (`PhotoFeedScreen.tsx`) obriga a assinatura ativa do Termo de Consentimento de Uso de Imagem (gravado na tabela `guardians.image_consent`). Sem a assinatura, a consulta à API do Supabase e SQLite é bloqueada e o feed exibe o termo de aceite de forma proativa.
*   **Filtro por Turma (RLS):** No Supabase Storage e na tabela `activity_photos`, a segurança de nível de linha (RLS) garante que apenas pais cujos filhos estejam matriculados na turma (`class_id`) possam ler as fotos.

## Risks / Trade-offs

*   **[Risco] Remoção de Arquivos Temporários pelo Sistema Operacional** → Se o celular do monitor ficar sem internet por vários dias, o sistema operacional do dispositivo pode limpar a pasta temporária de cache contendo a foto local antes que o sync aconteça.
    *   *Mitigação:* O `OfflineSyncService` realiza o disparo automático da sincronização assim que detecta rede. Em cenários extremos de mais de 7 dias offline, a fila marcará o item como expirado/falho de forma a manter a integridade do app.
*   **[Risco] Alta Latência no Upload de Imagens Grandes** → Em conexões móveis lentas (3G/4G instável), o upload da foto enfileirada pode falhar por timeout.
    *   *Mitigação:* Configurar um limite de tempo (timeout) de 30 segundos nas requisições do Supabase Storage no `OfflineSyncService.ts`, permitindo retentar automaticamente na próxima iteração do sync.
