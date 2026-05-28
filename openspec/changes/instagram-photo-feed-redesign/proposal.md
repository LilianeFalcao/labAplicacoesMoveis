## Why

Os pais dos alunos do Centro Bambolê valorizam atualizações visuais frequentes sobre as atividades diárias de seus filhos, mas a interface atual de fotos é muito básica (lista vertical estática na `ParentFeedScreen` e tela de consentimento desconectada da lógica na `PhotoFeedScreen`). Este projeto resolve isso ao criar uma experiência de feed de fotos rica, interativa e imersiva inspirada no Instagram, permitindo que os pais naveguem de forma fluida pelas memórias das atividades cotidianas.

## What Changes

- **Unificação de Telas de Fotos:** Fusão do fluxo de consentimento legal de imagem da `PhotoFeedScreen` com a busca real de dados via use cases da `ParentFeedScreen`, configurando a `PhotoFeedScreen` como a visualização ativa no menu de abas.
- **Modos de Exibição Duplos:** Introdução de uma alternância visual de 1 toque entre a visualização em Grade (Grid com 3 colunas compactas) e Visualização em Feed Detalhado (posts verticais).
- **Redesenho do Post de Foto (Instagram-Style):**
  - **Header do Post:** Exibição do avatar circular do monitor responsável, nome da turma e carimbo de data relativo amigável (ex: *"Há 2 horas"*).
  - **Interação de Toque Duplo (Double Tap to Like):** Animação fluida e de alto desempenho que exibe um coração gigante central ao tocar duas vezes na imagem.
  - **Barra de Ações:** Ícones dedicados e reativos para curtir, comentar, salvar e compartilhar internamente.
  - **Área de Legenda:** Legendas descritivas completas escritas pelo monitor da turma.
- **Barra de Filtros Ativos:** Filtros rápidos baseados em categorias de atividade (Futebol, Dança, Eventos, etc.) e na turma correspondente da criança.

## Perfis de Usuário e Necessidades Principais

| Perfil | Necessidade Principal em Relação às Fotos |
| :--- | :--- |
| **Parent** (Pais/Responsáveis) | Visualizar de forma rica, rápida e segura os registros das atividades de seus filhos, garantindo controle sob o uso das imagens. |
| **Monitor** (Monitores/Professores) | Capturar e compartilhar legendas e fotos das turmas sob sua responsabilidade de forma rápida no dia a dia. |
| **Admin** (Administradores) | Garantir que o consentimento de imagem LGPD esteja ativo para todos os usuários que acessam a galeria. |

## Decisões de LGPD (Consentimento de Imagem)

- **Obrigatoriedade de Consentimento:** O feed de fotos continuará bloqueado por padrão até que o responsável (`parent`) aceite expressamente os Termos de Consentimento de Uso de Imagem, garantindo conformidade com a Lei Geral de Proteção de Dados.
- **Persistência Local e Remota:** O consentimento é verificado na inicialização por meio do `GetGuardianConsentUseCase`. Caso revogado, a galeria é imediatamente ocultada, mostrando a tela informativa de autorização.
- **Restrição de Acesso por Turma:** Pais só têm acesso visual a fotos vinculadas às turmas em que seus filhos estão devidamente matriculados.

## Capabilities

### New Capabilities
- `instagram-photo-feed`: Abrange a criação da experiência de feed de fotos alternável (grid de 3 colunas e feed vertical detalhado), incluindo o cabeçalho do post, animação de duplo toque para curtir e interações de curtidas.

### Modified Capabilities
- `class-activities`: Integração da exibição do feed de fotos dinâmico com o fluxo de consentimento legal do responsável.

## Impact

- **Código Afetado:**
  - `bambole-app/src/presentation/screens/parent/PhotoFeedScreen.tsx` (Substituição de dados mockados por use cases reais, adição do design do Instagram e animações).
  - `bambole-app/src/presentation/navigation/tabs/RoleTabs.tsx` (Configuração para que a aba de fotos aponte para `PhotoFeedScreen` de forma consistente).
  - `bambole-app/src/presentation/screens/parent/__tests__/ParentFeedScreen.test.tsx` (Adaptação para cobrir o novo fluxo unificado).
- **APIs e Repositórios:** Uso direto de `GetActivityFeedUseCase` e `GetGuardianConsentUseCase`.
- **Desempenho:** Uso do driver nativo do React Native para garantir animações de duplo toque suaves a 60fps.

## Escopo (O que NÃO está incluído no MVP)

- Funcionalidade de chat privado ou comentários livres entre pais no feed.
- Edição de fotos ou aplicação de filtros visuais (estilo Instagram) no envio pelo monitor.
- Download direto de fotos do feed para a galeria do celular.
- Notificações push disparadas por curtidas individuais no feed.
