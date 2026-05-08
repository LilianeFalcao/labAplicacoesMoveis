## Why

A tela inicial do monitor (`MonitorHomeScreen`) possui um botão flutuante (FAB) que atualmente é meramente visual e não possui funcionalidade. Ao mesmo tempo, identificamos a necessidade de agilizar ações que hoje exigem navegação profunda (como postar fotos ou avisos em múltiplas turmas) e de prover um canal direto e seguro para relatórios de incidentes ou emergências que demandam atenção imediata da administração.

## What Changes

Implementaremos um menu de ações rápidas (Speed Dial) no FAB da Home do monitor com três capacidades principais:
- **Comunicado Global:** Envio de avisos para múltiplas turmas simultaneamente.
- **Captura Espontânea:** Acesso rápido à câmera para registro de momentos sem depender da seleção prévia da turma.
- **Relato de Incidente:** Formulário digital estruturado para emergências, com suporte a anexos de imagem e sinalização de urgência para o admin.

## Capabilities

### New Capabilities
- `monitor-quick-actions`: Menu Speed Dial no FAB da Home com atalhos contextuais.
- `multi-class-communication`: Capacidade de disparar um único anúncio/comunicado para um conjunto selecionado de turmas atribuídas ao monitor.
- `incident-reporting`: Sistema de registro digital de ocorrências/emergências com upload de imagens e flag de prioridade.

### Modified Capabilities
- `monitor-class-dashboard`: Integração das ações de foto e comunicado para permitir fluxo "global -> específico".

## Impact

- `src/presentation/screens/monitor/MonitorHomeScreen.tsx`: Inclusão do componente Speed Dial e estados de modal.
- `src/presentation/components/base/SpeedDial.tsx`: (Novo) Componente reutilizável para o menu flutuante.
- `src/application/communication/use-cases/PublishAnnouncementUseCase.ts`: Adaptação para suportar múltiplos `class_ids`.
- `src/domain/activity/entities/Incident.ts`: (Novo) Entidade para gerenciar o domínio de ocorrências.
- `src/infrastructure/supabase/activity/SupabaseIncidentRepository.ts`: (Novo) Persistência de incidentes.
