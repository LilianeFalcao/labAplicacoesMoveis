## Context

O componente `SpeedDial` foi implementado usando uma combinação de layout flexível (`View` com `flexDirection` padrão) e transformações de animação (`translateY`). Essa abordagem causou uma sobreposição indesejada, pois os itens já possuem um posicionamento natural no fluxo do Flexbox que entra em conflito com o deslocamento programático da animação.

## Goals / Non-Goals

**Goals:**
- Corrigir o posicionamento dos itens do menu para que fiquem empilhados verticalmente sem sobreposição.
- Garantir que todos os itens sejam clicáveis e visíveis quando o menu estiver aberto.
- Manter a animação suave de "leque" (fan out).

**Non-Goals:**
- Não alteraremos as funcionalidades ou ícones das ações, apenas o layout visual e interativo.

## Decisions

- **Absolute Positioning:** Os `actionWrapper` passarão a usar `position: 'absolute'`. Isso garante que todos os itens comecem do mesmo ponto de origem (acima do botão principal) e se desloquem individualmente para suas posições finais sem depender do fluxo dos irmãos.
- **Z-Index e Pointer Events:** Ajustaremos o `zIndex` para que o menu aberto sobreponha outros elementos da tela corretamente e o `backdrop` não bloqueie o clique nos botões do próprio menu.
- **Cálculo de Deslocamento:** O valor de `translateY` será revisado para garantir um espaçamento constante (ex: 60px entre centros) começando da base do `actionsContainer`.

## Risks / Trade-offs

- **Tamanho do Modal/Container:** Como os itens serão absolutos, o `actionsContainer` deve ter dimensões suficientes (ou `pointerEvents: 'box-none'`) para que os toques alcancem os itens mais altos.
