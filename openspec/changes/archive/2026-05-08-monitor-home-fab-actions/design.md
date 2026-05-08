## Context

Atualmente, o monitor precisa navegar até o Dashboard de uma turma específica para realizar qualquer ação (Foto, Aviso). Isso cria fricção para fotos espontâneas e impossibilita o envio de comunicados para várias turmas ao mesmo tempo. Além disso, não há um fluxo formal para reportar incidentes/emergências que exijam registro com imagem e notificação imediata.

## Goals / Non-Goals

**Goals:**
- Implementar um FAB Speed Dial funcional na `MonitorHomeScreen`.
- Permitir postagem de avisos em massa para múltiplas turmas.
- Implementar um fluxo de "Foto Primeiro, Turma Depois" para capturas rápidas.
- Criar um formulário de incidente digital com upload de imagens.

**Non-Goals:**
- Não iremos alterar a estrutura do Dashboard da Turma já existente.
- Não incluiremos edição de incidentes nesta fase (apenas criação).

## Decisions

- **Speed Dial UI:** Usaremos o componente `react-native-paper` (ou similar customizado) para o menu flutuante, garantindo que o ícone de `+` mude para `x` ao abrir.
- **Fluxo de Captura:** A câmera abrirá em tela cheia (reutilizando lógica da `PhotoCaptureScreen`). O resultado será passado para um modal de seleção onde o monitor marca a(s) turma(s) destino.
- **Entidade de Incidente:** Criaremos uma nova tabela `incidents` no Supabase para separar registros críticos de atividades pedagógicas normais (`activity_media`). Isso facilita a auditoria e alertas específicos para o Admin.
- **Imagens em Incidentes:** Usaremos o mesmo `UploadActivityPhotoUseCase` ou um similar adaptado para salvar fotos de incidentes em um bucket específico (`incidents-media`) com permissões restritas.

## Risks / Trade-offs

- **Complexidade do Estado:** Gerenciar a seleção de múltiplas turmas exige um estado limpo no modal para evitar disparos duplicados ou erros de rede parciais.
- **Permissões de Câmera:** O FAB na Home exigirá que as permissões de câmera sejam solicitadas já na tela inicial ou no primeiro clique, o que deve ser tratado com cuidado para não degradar a UX.
