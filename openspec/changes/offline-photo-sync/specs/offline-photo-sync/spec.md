## ADDED Requirements

### Requirement: Captura Offline de Fotos e Enfileiramento Local
O aplicativo SHALL permitir que o monitor capture fotos da turma e insira legendas mesmo na ausência de conexão de internet. O repositório de atividades MUST interceptar falhas de rede de forma graciosa e registrar as informações (incluindo o caminho físico local da imagem no celular) na fila de sincronização `sync_queue` do banco SQLite local.

#### Scenario: Captura de foto sem conectividade
- **WHEN** o monitor está sem acesso à internet e confirma o envio da foto na tela de captura
- **THEN** o sistema salva o registro na tabela local `sync_queue` com tipo `POST_PHOTO` e status `pending`, apresentando ao monitor uma confirmação de salvamento seguro offline.

### Requirement: Sincronização Automática em Background
O serviço `OfflineSyncService` SHALL processar registros do tipo `POST_PHOTO` pendentes na fila de sincronização quando a conectividade for restabelecida. O serviço MUST converter o arquivo de imagem local em binário Base64, realizar o upload do arquivo para o bucket do Supabase Storage `children-photos`, obter a URL pública correspondente e salvar o registro com a URL e metadados na tabela `activity_photos` do banco de dados remoto, alterando o status da fila para `completed`.

#### Scenario: Processamento de foto enfileirada ao retomar internet
- **WHEN** o `OfflineSyncService.syncUp` é executado com conexão ativa e encontra um item `POST_PHOTO` pendente
- **THEN** o sistema faz o upload físico da imagem para o Supabase Storage, insere o registro na tabela remota do banco de dados e marca o item da fila local como finalizado, disparando uma notificação push de sucesso.

### Requirement: Exibição no Feed do Pai sob Conformidade da LGPD
O mural de fotos do aplicativo SHALL ler dados em tempo real da tabela `activity_photos` usando a ID da turma da criança vinculada ao pai logado. O sistema MUST bloquear a exibição de quaisquer fotos de atividades a menos que o termo de consentimento de imagem da LGPD seja assinado ativamente pelo pai/responsável.

#### Scenario: Visualização do feed real com consentimento assinado
- **WHEN** o pai possui o consentimento de uso de imagem ativado e acessa a tela de fotos da turma
- **THEN** o feed do pai lê dinamicamente as fotos sincronizadas e as exibe em um mural clássico com layout premium, permitindo curtidas e interações.
