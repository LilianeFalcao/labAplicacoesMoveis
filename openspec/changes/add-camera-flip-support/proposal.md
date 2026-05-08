## Why

Atualmente, as interfaces de câmera no aplicativo (`PhotoCaptureScreen` e o modal de Captura Espontânea na Home) estão fixas na câmera traseira. Monitores solicitaram a capacidade de alternar para a câmera frontal para permitir selfies com os alunos ou para facilitar o enquadramento em determinadas atividades pedagógicas e recreativas.

## What Changes

Adicionaremos um botão de "Flip Camera" em todas as interfaces de câmera do perfil monitor.
- Implementação de um estado de `facing` (front/back) usando a API do `expo-camera`.
- Adição de um ícone intuitivo na interface de sobreposição da câmera para realizar a alternância.

## Capabilities

### Modified Capabilities
- `monitor-quick-actions`: Suporte a alternância de câmera no fluxo de captura espontânea.
- `photo-capture`: Suporte a alternância de câmera na tela de captura de atividades da turma.

## Impact

- `src/presentation/screens/monitor/PhotoCaptureScreen.tsx`: Adição do controle de facing e botão na UI.
- `src/presentation/screens/monitor/MonitorHomeScreen.tsx`: Adição do controle de facing no modal de câmera rápida.
