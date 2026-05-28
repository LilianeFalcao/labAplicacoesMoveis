## ADDED Requirements

### Requirement: Integração de Consentimento com Galeria Dinâmica
O sistema mobile do responsável MUST garantir que a galeria de fotos da turma só faça requisições ao caso de uso `GetActivityFeedUseCase` se o consentimento do responsável estiver registrado como ativo (`hasConsent === true`). Se não estiver ativo, o feed não SHALL carregar ou fazer qualquer chamada de dados de mídia do Supabase ou SQLite local para preservar a privacidade e conformidade com a LGPD.

#### Scenario: Galeria Dinâmica com Consentimento Ativo
- **WHEN** o pai/responsável acessa a aba de fotos e o consentimento está ativo (`hasConsent === true`)
- **THEN** o sistema executa o `GetActivityFeedUseCase` para carregar as fotos reais associadas às turmas registradas dos seus filhos e exibe o novo feed com estilo Instagram.

#### Scenario: Galeria Oculta sem Consentimento
- **WHEN** o pai/responsável acessa a aba de fotos e o consentimento não está ativo (`hasConsent === false`)
- **THEN** o sistema suspende qualquer chamada ao repositório de atividades e renderiza o termo legal e botão de consentimento LGPD para o usuário.
