## Context

Atualmente, `PhotoCaptureScreen` mantém a referência da imagem e a legenda mesmo após o use case de upload ser executado com sucesso. Embora a tela atualmente execute um `navigation.goBack()`, o usuário deseja um comportamento de "limpeza" para facilitar múltiplos registros.

## Goals / Non-Goals

**Goals:**
- Garantir que `image` e `caption` voltem ao estado inicial após sucesso.
- Permitir que o monitor continue na tela para novas fotos se desejar (opcional, mas o reset é mandatório).

**Non-Goals:**
- Alterar a lógica de persistência ou o use case de upload.
- Adicionar galeria de fotos enviadas nesta tela.

## Decisions

- **State Reset Logic**: A limpeza ocorrerá no bloco `try` de `handleSave`, logo após a execução bem-sucedida do `useCase.execute()`.
- **UI Feedback**: Manteremos o Alerta de sucesso, mas a limpeza do estado ocorrerá antes ou durante a exibição do alerta para que o fundo da tela já reflita o estado limpo.
- **Workflow Change**: Modificar o `onPress` do botão de sucesso no Alerta para não forçar o `goBack()` imediatamente, ou adicionar uma opção "Capturar outra".

## Risks / Trade-offs

- [Risco] O usuário pode achar que a foto não foi enviada se ela sumir rápido demais. → [Mitigação] Manter o Alerta de confirmação claro.
