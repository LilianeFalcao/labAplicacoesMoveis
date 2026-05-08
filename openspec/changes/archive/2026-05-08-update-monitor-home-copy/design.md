## Context

A interface do `TurmaAgendaCard` possui um botão primário com o texto "Realizar Chamada". Isso reflete a arquitetura antiga, onde esse botão levava diretamente para a tela exclusiva de chamada de presença. Com a nova arquitetura do `ClassDashboardTabs` (introduzida na mudança anterior), o botão leva a um dashboard completo (Chamada, Fotos, Avisos, Agenda). Manter o texto "Realizar Chamada" passa a impressão errada de que essa é a única funcionalidade disponível.

## Goals / Non-Goals

**Goals:**
- Atualizar o texto do botão principal de "Realizar Chamada" para "Acessar Turma".

**Non-Goals:**
- Não haverá alteração estrutural na UI, no CSS, ou em ícones (o ícone de seta atual atende bem).
- Nenhuma alteração lógica de navegação será feita.

## Decisions

- **Copywriting**: A escolha do termo "Acessar Turma" em vez de opções verbosas como "Gerenciar Turma" foi feita para manter o botão conciso e direto, alinhado à simplicidade requerida pelo perfil Monitor.

## Risks / Trade-offs

- **Risco de Fricção Inicial**: Usuários acostumados ao fluxo mecânico de ler "Realizar Chamada" podem estranhar a mudança nas primeiras sessões, mas o resultado semântico é inegavelmente melhor a médio prazo.
