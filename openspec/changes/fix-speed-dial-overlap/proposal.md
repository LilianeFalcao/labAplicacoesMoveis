## Why

Recentemente implementamos o componente `SpeedDial` no FAB da tela inicial do monitor. No entanto, as opções do menu (Relatar Incidente, Foto Rápida, Comunicado Global, Solicitar Turma) estão se sobrepondo visualmente ao abrir o menu, impedindo o clique correto em cada uma delas e degradando a experiência do usuário.

## What Changes

Ajustaremos a lógica de posicionamento e animação do `SpeedDial` para garantir que:
1. As opções se distribuam verticalmente com espaçamento adequado.
2. A ordem de empilhamento (z-index) e os eventos de toque (pointerEvents) não interfiram na usabilidade.
3. O layout se adapte corretamente a diferentes tamanhos de tela e insets.

## Capabilities

### Modified Capabilities
- `monitor-quick-actions`: Ajuste no posicionamento visual e interação do menu Speed Dial.

## Impact

- `src/presentation/components/base/SpeedDial.tsx`: Refatoração dos estilos e cálculos de animação.
