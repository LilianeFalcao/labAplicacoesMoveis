## MODIFIED Requirements

### Requirement: Chamada de presença bloqueada fora do horário da grade com tolerância
O sistema SHALL bloquear o registro de chamada de presença geral quando o horário atual estiver fora da janela de tolerância da grade semanal da turma. A janela de tolerância SHALL ser de **60 minutos** antes do início e após o término do horário agendado, permitindo que monitores realizem chamadas com pequenos desvios de horário sem erros bloqueantes.

#### Scenario: Chamada dentro do horário agendado
- **WHEN** o monitor realiza chamada durante o horário exato da grade da turma
- **THEN** o sistema SHALL permitir o registro de presença sem erros

#### Scenario: Chamada dentro da janela de tolerância de 60 minutos antes do início
- **WHEN** o monitor realiza chamada até 60 minutos antes do início do horário agendado da turma
- **THEN** o sistema SHALL permitir o registro de presença sem erros

#### Scenario: Chamada dentro da janela de tolerância de 60 minutos após o término
- **WHEN** o monitor realiza chamada até 60 minutos após o término do horário agendado da turma
- **THEN** o sistema SHALL permitir o registro de presença sem erros

#### Scenario: Chamada fora da janela de tolerância de 60 minutos
- **WHEN** o monitor realiza chamada mais de 60 minutos antes do início ou mais de 60 minutos após o término do horário agendado
- **THEN** o sistema SHALL lançar o erro "Attendance outside schedule" e bloquear o registro

#### Scenario: Chamada vinculada a atividade específica mantém tolerância de 30 minutos
- **WHEN** o monitor realiza chamada com `activityId` selecionado (vinculada a uma atividade específica)
- **THEN** o sistema SHALL aplicar a tolerância de 30 minutos (antes e após) em relação ao horário da atividade, sem alterar este comportamento existente

#### Scenario: Validação de horário com tolerância zero para testes
- **WHEN** o método `isCallAllowedNow(now, 0)` é chamado com `toleranceMinutes = 0`
- **THEN** o sistema SHALL validar o horário sem nenhuma tolerância (comportamento legado para testes unitários)

## ADDED Requirements

### Requirement: Polyfill de crypto disponível em todos os contextos de execução globais
O sistema SHALL garantir que `crypto.getRandomValues` e `crypto.randomUUID` estejam disponíveis em `globalThis`, `global` e `window` antes do carregamento do cliente Supabase, prevenindo crashes no motor Hermes do React Native.

#### Scenario: Inicialização sem crash no Hermes
- **WHEN** o aplicativo inicializa no motor Hermes (produção React Native)
- **THEN** o sistema SHALL ter `globalThis.crypto`, `global.crypto` e `window.crypto` (quando aplicável) preenchidos com `getRandomValues` e `randomUUID` antes de qualquer chamada do Supabase

#### Scenario: Não sobrescreve implementação nativa existente
- **WHEN** o ambiente já possui `crypto.getRandomValues` ou `crypto.randomUUID` nativos
- **THEN** o sistema SHALL preservar as implementações nativas existentes sem sobrescrever

### Requirement: Footer da tela de chamada com design premium flutuante
O sistema SHALL exibir o rodapé contendo o botão "Confirmar Chamada" como um card flutuante elevado, posicionado absolutamente sobre a lista de alunos com `borderRadius` arredondado, sombra expressiva e leve transparência, conferindo estética premium consistente com o restante do aplicativo.

#### Scenario: Exibição do card flutuante sobre a lista
- **WHEN** o monitor está na tela de chamada com a lista de alunos visível
- **THEN** o sistema SHALL exibir o card do rodapé flutuando sobre a lista, com `borderRadius` de 24, `elevation` mínimo de 12 e margem horizontal de 16dp das bordas da tela

#### Scenario: Lista com scroll não fica oculta atrás do card
- **WHEN** o monitor rola a lista de alunos até o último item
- **THEN** o sistema SHALL garantir que o último item da lista seja acessível com scroll, com `paddingBottom` adequado para não ser obstruído pelo card flutuante
