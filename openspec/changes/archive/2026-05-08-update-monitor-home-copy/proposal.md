## Why

Com a recente refatoração da navegação aninhada (Nested Navigation) no painel do Monitor, o cartão de turma (`TurmaAgendaCard`) na tela inicial não direciona mais o usuário estritamente para a tela de "Chamada". Em vez disso, ele direciona para um Dashboard completo da turma (Class Dashboard) contendo Chamada, Fotos, Avisos e Agenda. A label "Realizar Chamada" no botão de ação da turma tornou-se conceitualmente defasada, limitando a percepção do monitor sobre as ações disponíveis e quebrando a intuição do fluxo.

## What Changes

Iremos atualizar as labels (microcopy) no componente `TurmaAgendaCard` para refletir adequadamente o novo fluxo da arquitetura:
- O botão "Realizar Chamada" no `TurmaAgendaCard` será alterado para "Acessar Turma".
- Uma revisão passiva da Home Screen para garantir que o painel e os cards não insinuem que a única ação possível é a chamada, mas sim a gestão integrada da turma selecionada.

## Capabilities

### New Capabilities

Nenhuma capacidade técnica ou caso de uso novo está sendo adicionado.

### Modified Capabilities

- `monitor-class-dashboard`: Modificação dos requisitos de interface (UI/Copy) da tela de entrada (Home) que leva a esta capability, ajustando o botão de roteamento para um termo que englobe todo o contexto do dashboard.

## Impact

- `src/presentation/components/monitor/TurmaAgendaCard.tsx`: Alteração do texto em `actionButtonText`.
