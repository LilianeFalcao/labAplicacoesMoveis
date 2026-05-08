## Context

A implementação atual da navegação do Monitor (`MonitorTabs` e `MonitorStack`) utiliza uma abordagem global, mantendo todas as abas funcionais (Chamada, Fotos, Avisos) ativas desde a raiz. No entanto, os monitores gerenciam múltiplas turmas, e essas telas operacionais precisam saber *em qual turma* estão agindo. Atualmente, clicar na aba "Chamada" via BottomTabNavigator sem parâmetros prévios resulta em fallback para uma turma mockada (`DEMO_CLASS_01`), quebrando a UX e o fluxo definido na especificação do sistema.

## Goals / Non-Goals

**Goals:**
- Remover as telas de operação da turma (Chamada, Fotos, Avisos) do navegador de abas raiz do Monitor (`MonitorTabs`).
- Criar um novo componente `ClassDashboardTabs` (um Nested Tab Navigator) que englobe 4 telas: Chamada, Fotos, Avisos e Agenda da Turma.
- Ao clicar em uma turma na `MonitorHomeScreen`, navegar para o `ClassDashboardTabs` passando o parâmetro de rota `classId`.
- Garantir que as telas aninhadas consumam esse `classId` do escopo pai de forma imutável durante a sessão.

**Non-Goals:**
- Alterar as regras de negócio ou lógicas de Use Cases (`application/` ou `domain/`).
- Refatorar a estrutura visual e os componentes de UI internos das telas de operação (o foco é estritamente a navegação).

## Decisions

1. **Navegação Raiz Limpa**: `MonitorTabs` (a raiz da UI) conterá exclusivamente `Home` (Minhas Turmas) e `Perfil`. 
2. **`ClassDashboardTabs`**: Será um BottomTabNavigator dedicado à visão da turma. Ele será registrado no `MonitorStack`. Quando acionado na Home, ele cobrirá as abas antigas e exibirá o seu próprio conjunto de abas focadas naquela turma (`classId`).
3. **Acesso aos Parâmetros**: As telas filhas do `ClassDashboardTabs` não precisarão fazer fallback perigoso, pois o pai (`ClassDashboardTabs`) garantirá a existência do `classId` na rota.
4. **Remoção de Duplicatas**: Em `RoleStacks.tsx`, as antigas referências soltas das telas de operação que causavam duplicidade serão apagadas e substituídas pela referência única do `ClassDashboardTabs`.

## Risks / Trade-offs

- **Experiência de Navegação**: Usuários terão que clicar explicitamente no botão de "Voltar" no cabeçalho do `ClassDashboardTabs` para retornar à tela inicial de turmas. Este é um trade-off favorável e intencional, pois garante de forma estrita que não haverá mistura de dados ou registros de presença inseridos acidentalmente em turmas erradas.
