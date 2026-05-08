## Why

Após o envio bem-sucedido de uma foto de atividade pelo monitor, o estado da tela (foto capturada e legenda) permanece preenchido. Isso dificulta o registro imediato de novas atividades e pode gerar confusão sobre se o envio anterior foi realmente concluído.

## What Changes

- Redefinição automática do estado da tela (`image` e `caption`) imediatamente após a confirmação do envio.
- Introdução de uma transição visual (ou transição de estado) que prepare a tela para uma nova captura sem a necessidade de sair e voltar à tela.
- Atualização do feedback de sucesso para permitir que o usuário escolha entre "Capturar Nova" ou "Voltar".

## Capabilities

### New Capabilities
- `monitor-photo-reset`: Lógica de limpeza de formulário e controle de fluxo pós-captura na interface do monitor.

### Modified Capabilities
- Nenhuma.

## Impact

- **Presentation**: `PhotoCaptureScreen` será modificado para gerenciar o reset de estado.
- **UX**: Melhoria no fluxo de trabalho do monitor para capturas sequenciais.
