## Why

A especificação do app define que os monitores podem gerenciar múltiplas turmas e a navegação deve permitir a troca de contexto entre elas. Atualmente, o aplicativo implementa uma navegação global via Bottom Tabs (`MonitorTabs`) que expõe as telas de Chamada, Fotos e Avisos em todas as instâncias, inclusive na Home. Isso gera um grave conflito de UX: ao clicar nessas abas inferiores, o aplicativo perde o contexto de qual turma o monitor está gerenciando, forçando a leitura de turmas mockadas (`DEMO_CLASS_01`). Precisamos corrigir essa inconsistência técnica aninhando essas funcionalidades no escopo de uma turma específica.

## What Changes

Iremos refatorar a arquitetura de rotas da visão do monitor (`MonitorStack` e `MonitorTabs`).
- A raiz do monitor deixará de ter abas para as rotinas diárias e passará a ter apenas uma tab global `Home` (Minhas Turmas) e `Perfil`.
- Quando o monitor selecionar uma turma na `MonitorHomeScreen`, ele será direcionado para uma nova tela contendo um **Nested Tab Navigator** (Dashboard da Turma).
- Esse navegador aninhado se encarregará de exibir as opções Chamada, Fotos, Avisos e Agenda, **passando automaticamente o `classId` selecionado** para todas essas views de forma transparente.
- Removeremos a duplicação indevida de telas (Chamada, Fotos, Avisos) registradas concomitantemente no `MonitorStack` e no `MonitorTabs`.

## Capabilities

### New Capabilities
- `monitor-class-dashboard`: Centralização das funcionalidades operacionais (Chamada, Fotos, Avisos, Agenda) dentro de um ambiente isolado para uma turma específica, controlado por um Nested Tab Navigator.

### Modified Capabilities
- Não há mudança de requisitos de negócio, apenas uma adequação arquitetural para cumprir o que a especificação já exigia.

## Impact

- `src/presentation/navigation/tabs/RoleTabs.tsx`: Alteração profunda no `MonitorTabs` e criação do `ClassDashboardTabs`.
- `src/presentation/navigation/stacks/RoleStacks.tsx`: Atualização do `MonitorStack` para suportar as mudanças.
- `src/presentation/screens/monitor/MonitorHomeScreen.tsx`: Alteração na ação de `onPress` do card de turma para direcionar para o `ClassDashboardTabs`.
- `AttendanceScreen`, `PhotoCaptureScreen`, `MonitorObservationsScreen`, `GroupAgendaScreen`: Adequação para receber e respeitar o `classId` oriundo da navegação aninhada.
