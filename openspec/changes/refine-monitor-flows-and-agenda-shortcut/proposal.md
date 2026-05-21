## Why

Atualmente, os monitores do aplicativo Bambolê enfrentam pequenos atritos no uso diário do aplicativo que limitam a usabilidade no limite físico do centro recreativo:
1. O aplicativo sofre falhas no ecossistema Hermes de React Native com o erro de `"Property 'crypto' doesnt exist"` devido à ordem de inicialização do Supabase e à ausência de `globalThis.crypto`.
2. A restrição rígida de horário de chamadas gerais sem tolerância provoca o erro `"Attendance outside schedule"` impedindo chamadas com ligeiros desvios de hora ou em testes de rotina.
3. Não há uma forma ágil de cadastrar novas atividades na agenda diretamente do painel principal (Home Screen), exigindo que o monitor navegue para fora do dashboard principal.
4. O espaçamento do card do rodapé contendo o botão "Confirmar Chamada" na tela de chamada possui um layout rígido e não otimizado, que prejudica a experiência visual premium do aplicativo.

Esta proposta visa sanar estes gargalos de usabilidade, fornecendo um fluxo robusto offline-first de atividades, correção definitiva de polyfill e um atalho rápido no FAB.

## What Changes

* **Ajuste no Polyfill de Criptografia**: Redefinir a injeção do polyfill global de crypto anexando-o com redundância a `globalThis`, `window` e `global` logo no carregamento inicial do aplicativo, prevenindo quebras com o motor Hermes em React Native.
* **Tolerância Temporal nas Chamadas**: Introduzir um buffer de tolerância padrão de **60 minutos** (antes e depois do horário agendado) na validação de chamadas de classe gerais e suporte a desativação seletiva da trava em desenvolvimento para testes simplificados.
* **Atalho FAB para Cadastro Rápido de Atividades**: Incluir no SpeedDial da tela inicial do monitor uma ação direta ("Nova Atividade") que abre um modal Bottom Sheet facilitando a criação de novas atividades (título, descrição, horário de início/término e categoria) com suporte inteligente de pré-seleção de turmas e sincronização offline transparente.
* **Interface Premium na Chamada e Agenda**: Reestilizar o rodapé da tela de chamada como um card flutuante elevado e polir os cartões de atividades com micro-feedbacks e cores HSL associadas a cada categoria.

### Tabela de Perfis e Necessidades Principais

| Perfil | Necessidade Principal no Fluxo de Atividades / Chamada |
| :--- | :--- |
| **Monitor** | Lançar presenças e atividades na agenda do dia em tempo real, mesmo com oscilações de rede (offline-first) e sem impedimentos de horários superestritos. |
| **Parent** | Acompanhar a presença do filho e visualizar de forma imediata o histórico de atividades cumpridas no feed de fotos da respectiva turma. |
| **Admin** | Auditar relatórios de presença e as atividades desenvolvidas para garantir conformidade com as diretrizes do centro. |

### Decisões sobre LGPD (Consentimento de Imagem)

* A criação rápida de atividades via atalho no FAB não altera ou afeta o consentimento de privacidade e imagem das crianças cadastrado pelos pais (`hasImageConsent`). Qualquer imagem espontânea tirada pelo monitor no fluxo rápido da Home Screen continuará respeitando rigorosamente a verificação de consentimento e a RLS (Row Level Security) do banco de dados baseada em `class_id`.

## Capabilities

### New Capabilities
* `agenda-quick-action`: Atalho rápido via Floating Action Button (FAB/SpeedDial) na Home Screen do monitor para cadastrar atividades da agenda de forma instantânea com preenchimento reativo e armazenamento offline/sync automático.

### Modified Capabilities
* `attendance-validation`: Ajustar as políticas e limites de restrição do `TakeAttendanceUseCase` e do modelo `WeeklySchedule` para prover maior flexibilidade no registro de presenças através de janelas de tolerância e buffers temporais parametrizáveis.

## Impact

* **Frontend (Presentation)**:
  - `MonitorHomeScreen.tsx`: Adição da ação no SpeedDial, estado de controle e importação do modal de criação rápida.
  - `AttendanceScreen.tsx`: Modificação dos espaçamentos do rodapé substituindo-o por um card flutuante premium elevado.
  - `TurmaAgendaCard.tsx`: Polimento estético, cores HSL por categoria e pulsar dinâmico "AGORA".
* **Use Cases (Application)**:
  - `TakeAttendanceUseCase.ts`: Modificação dos parâmetros de validação para incluir tolerância na chamada geral.
* **Domain (Domain)**:
  - `Class.ts` / `WeeklySchedule`: Possível inclusão de parâmetros de tolerância no método `isCallAllowedNow(now, toleranceMinutes)`.
* **Infrastructure**:
  - `crypto-polyfill.ts`: Refatoração da raiz de injeção global.
  - `OfflineSyncService.ts`: Processamento e suporte integral à ação `ADD_ACTIVITY` inserida localmente offline via FAB.
