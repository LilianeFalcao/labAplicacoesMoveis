# Tasks — App Bambolê

> Estimativa total: ~78 horas | 11 semanas
> Atualizado com refinamentos de 13/03/2026 e estratégia TDD (Jest + RNTL + Maestro)

---

## Semana 1–2 · Setup e Autenticação (~12h)

- [ ] **TASK-01** Inicializar projeto Expo + TypeScript  
  Criar projeto com `expo init`, configurar paths absolutos (`@/`), ESLint, Prettier  
  _Est: 2h_

- [ ] **TASK-01b** Setup de testes: Jest + RNTL + Maestro  
  Instalar e configurar `jest`, `@testing-library/react-native`, `jest-expo`  
  Configurar `jest.config.js`, `babel.config.js` e `setupTests.ts`  
  Instalar Maestro CLI e criar pasta `.maestro/flows/`  
  Definir scripts: `test` (Jest), `test:e2e` (Maestro)  
  _Est: 1.5h_

- [ ] **TASK-02** Setup Supabase  
  Criar projeto Supabase, configurar variáveis de ambiente, client singleton  
  _Est: 1h_

- [ ] **TASK-03** Estrutura de pastas DDD  
  Criar diretórios `domain/`, `application/`, `infrastructure/`, `presentation/` por bounded context  
  _Est: 1h_

- [ ] **TASK-04** Implementar domínio Identity & Access  
  `User` entity, `Email`/`Role` VOs, `IUserRepository` interface  
  _Est: 1h_

- [ ] **TASK-05** Implementar `SupabaseAuthRepository`  
  `SignUpUseCase` (pai), `SignInUseCase`, `SupabaseUserRepository`  
  _Est: 2h_

- [ ] **TASK-06** Navegação por roles  
  `ParentNavigator`, `MonitorNavigator`, `AdminNavigator` — redireciona conforme role do usuário  
  _Est: 2h_

- [ ] **TASK-07** Telas de Auth (3 telas)  
  Login, Cadastro (pai), Recuperação de senha  
  _Est: 3h_

---

## Semana 3–4 · Cadastros Admin (~14h)

- [ ] **TASK-08** Schema Supabase: tabelas base  
  `users`, `children`, `guardians` (+ `image_consent`, `image_consent_at`), `guardian_children`,  
  `classes` (+ `description`, `age_range`, `weekly_schedule JSONB`), `monitor_activities`,  
  `class_access_requests`, `schedules`, `activity_photos`, `announcements`  
  RLS policies por role  
  _Est: 3h_

- [ ] **TASK-09** Domínio Enrollment  
  `Child`, `Guardian` (+ campo `imageConsent`), `GuardianLink` entities  
  `ChildName`, `PhotoUrl` VOs; eventos `ChildEnrolled`, `GuardianLinked`  
  `IChildRepository`, `IGuardianRepository`  
  _Est: 2h_

- [ ] **TASK-10** Implementar repositórios Enrollment  
  `SupabaseChildRepository`, `SupabaseGuardianRepository`  
  _Est: 1.5h_

- [ ] **TASK-11** Use cases admin  
  `EnrollChildUseCase`, `LinkGuardianUseCase`, `UnlinkGuardianUseCase`  
  _Est: 1h_

- [ ] **TASK-12** Tela: Gestão de Crianças (Admin)  
  Listar com filtro por turma, cadastrar (foto via câmera, opcional — avatar de iniciais como fallback), editar  
  _Est: 2h_

- [ ] **TASK-13** Tela: Gestão de Monitores (Admin)  
  Cadastrar (admin define senha), listar, atribuir turma, **redefinir senha** (RFN-21), **aprovar/rejeitar solicitações de turma** (RFN-09)  
  `AdminResetMonitorPasswordUseCase` via Edge Function com `service_role`  
  _Est: 2h_

- [ ] **TASK-14** Tela: Vinculação Pai ↔ Filho (Admin)  
  Buscar pai por e-mail, criar/desfazer vínculo  
  _Est: 1h_

- [ ] **TASK-34** Tela: Gestão de Turmas (Admin) — ⚠️ Pré-requisito para cadastro de crianças e monitores  
  Criar/editar turmas + **grade horária** (dias + horário início/fim), Modalidade, Faixa Etária + visão simples de % presença  
  _Est: 2h_

---

## Semana 5–6 · Presença e Agenda (~12h)

- [ ] **TASK-15** Domínio Activity refinado  
  `Class` entity com `weeklySchedule: WeeklySchedule`, `description`, `ageRange`, `isCallAllowedNow()`  
  VO `WeeklySchedule` com `includesNow()`  
  `Schedule` aggregate com `category` (enum fixo) e `recurrence` (`none | weekly`)  
  `CreateScheduleUseCase`, `GetClassScheduleUseCase`  
  _Est: 2h_

- [ ] **TASK-16** Schema Supabase: presença  
  `attendance_records` com todos os campos de status e geoloc  
  _Est: 1h_

- [ ] **TASK-17** Domínio Attendance  
  `AttendanceRecord` aggregate, `AttendanceStatus` VO (4 estados), `GeolocationProof`, `JustificationNote`  
  Métodos: `markPresent`, `markAbsent`, `preJustify`, `justifyRetroactively`  
  Eventos: `AttendanceMarked`, `AbsencePreJustified`, `AbsenceJustified`  
  _Est: 2h_

- [ ] **TASK-18** Integrar `expo-location` + validação geográfica  
  `ExpoLocationService`, verificar raio de alcance antes de confirmar chamada  
  _Est: 1.5h_

- [ ] **TASK-19** `TakeAttendanceUseCase` com dupla barreira  
  Verificar `isCallAllowedNow()` (grade horária) + validar geolocalização antes de abrir chamada  
  Lançar `AttendanceOutsideScheduleError` ou `OutOfRangeError` conforme caso  
  _Est: 1h_

- [ ] **TASK-20** Tela: Chamada / Presença (Monitor)  
  Lista de alunos com avatar, pré-justificativas sinalizadas, **badge sem consentimento de imagem**, marcação de status  
  _Est: 2h_

- [ ] **TASK-21** Tela: Histórico de Presenças (Pai)  
  Calendário com cores por status, ação de pré-justificar (data futura) e justificar retroativamente  
  `PreJustifyAbsenceUseCase`, `JustifyAbsenceUseCase`  
  _Est: 1.5h_

- [ ] **TASK-22** Tela: Agenda da Turma (Monitor)  
  CRUD de atividades; filtro por categoria; recorrência semanal  
  _Est: 1h_

---

## Semana 7 · Monitor: Turmas e Modo Visualização (~3.5h)

- [ ] **TASK-23** Home do Monitor: lista de turmas + Modo Visualização  
  Se `monitor_activities` vazia → empty state + botão "Solicitar Turma"  
  Toca em turma → `ClassDetailScreen`  
  _Est: 1h_

- [ ] **TASK-24** `RequestClassAccessUseCase` + modal de solicitação  
  Insere em `class_access_requests` com `status: pending`  
  Modal: seletor de turma + campo de motivo (opcional)  
  _Est: 1h_

- [ ] **TASK-25** `ApproveClassRequestUseCase` + UI na Tela 16  
  Lista de solicitações pendentes; Aprovar → insere em `monitor_activities`; Rejeitar → atualiza status  
  _Est: 1.5h_

---

## Semana 7–8 · Câmera, Geoloc e Feed (~10h)

- [ ] **TASK-26** Integrar `expo-camera`  
  `ExpoCameraService`, permissões, captura e upload para Supabase Storage  
  _Est: 2h_

- [ ] **TASK-27** Tela: Captura de Foto (Monitor)  
  Câmera + preview + upload + vinculação à atividade  
  `PublishPhotoUseCase` → emite `PhotoPublished`  
  _Est: 2.5h_

- [ ] **TASK-28** LGPD: consentimento de imagem  
  `ImageConsentModal` (fullscreen, não skipável) no 1º acesso do pai  
  Salva `image_consent` + `image_consent_at` no Supabase e cache local  
  Opção de revogar na Tela 9 (Perfil)  
  _Est: 1h_

- [ ] **TASK-29** Tela: Feed de Fotos (Pai)  
  Grade de fotos por dia/atividade, carregamento lazy  
  **Bloqueado** com mensagem se `image_consent = false`  
  _Est: 2h_

- [ ] **TASK-30** RLS refinada no Storage (bucket: `activity-photos`)  
  Policy: somente pais da turma (`class_id`) podem ler  
  _Est: 0.5h_

- [ ] **TASK-31** Telas do Pai: Home, Detalhe do Filho, Perfil  
  Tela 4: listagem de filhos + preview de 2 avisos recentes  
  Tela 5: presença do dia, stats do mês, atividade de hoje  
  Tela 9: alterar nome e senha; foto de perfil (opcional); revogar consentimento de imagem  
  _Est: 2h_

---

## Semana 9–10 · Notificações Push (~6h)

- [ ] **TASK-32** Setup Expo Notifications + FCM/APNs  
  Configurar tokens, permissões, coluna `push_token` em `users`  
  Registrar token no `SignInUseCase` e atualizar quando o Expo gerar novo token  
  ⚠️ Push gerenciado somente pelo SO — sem toggle interno no app  
  _Est: 2h_

- [ ] **TASK-33** `ExpoPushService` — serviço de infraestrutura  
  `infrastructure/notifications/ExpoPushService.ts` implementando `IPushService`  
  Chama `https://exp.host/--/api/v2/push/send` com lista de tokens  
  Injetado nos use cases via interface (facilita mock nos testes)  
  _Est: 1h_

- [ ] **TASK-34b** Integrar `ExpoPushService` nos use cases  
  `TakeAttendanceUseCase` → push para pai do filho  
  `PreJustifyAbsenceUseCase` → push para monitor da turma  
  `PublishPhotoUseCase` → push para pais da turma  
  `PublishAnnouncementUseCase` → push para turma ou todos os pais  
  _Est: 1.5h_

- [ ] **TASK-36** Domínio Communication + repositório  
  `Announcement` aggregate, `AnnouncementContent`, `Audience` VOs  
  `PublishAnnouncementUseCase`, `SupabaseAnnouncementRepository`  
  _Est: 1.5h_

- [ ] **TASK-37** Tela: Observações (Monitor)  
  Notas individuais/gerais + histórico de avisos enviados + ação de novo aviso com push  
  _Est: 1.5h_

- [ ] **TASK-38** Tela: Comunicados Gerais (Admin)  
  Publicar comunicado para todos os pais via push  
  _Est: 1h_

- [ ] **TASK-39** Tela: Avisos / Notificações (Pai)  
  Lista de comunicados recebidos (turma + geral)  
  _Est: 0.5h_

---

## Semana 9–10 (paralelo) · Cache Offline (~3h)

- [ ] **TASK-40** `SQLiteParentCache` com sync robusto  
  Cache de leitura: presenças, fotos, avisos  
  `PendingAction` com `expiresAt` (createdAt + 7 dias)  
  Conflito: servidor ganha — descartar ação offline se estado já mudou; exibir alerta  
  Expiração: varrer fila na abertura do app; descartar e notificar pai  
  Sync silencioso; alerta apenas se houver descartes  
  _Est: 3h_

---

## Semana 11 · Finalização e Apresentação (~8h)

- [ ] **TASK-41** Testes de integração — fluxos críticos  
  Auth + vinculação, chamada de presença (bloqueio horário + geoloc), justificativa de falta,  
  solicitação de turma, publicação de foto, push notification, consentimento de imagem  
  _Est: 3h_

- [ ] **TASK-42** Polish e acessibilidade  
  Revisar touch targets (mín. 44pt), estados de loading/erro, feedback visual de ações  
  _Est: 2h_

- [ ] **TASK-43** Preparação da apresentação  
  Gravar demo dos 3 fluxos principais, documentar setup do projeto  
  _Est: 1.5h_

- [ ] **TASK-44** Edge Function: retenção de fotos  
  Trigger ao deletar `child` ou desmatricular → remove fotos associadas do Storage  
  _Est: 1.5h_

---

## Priorização

| Prioridade | Tasks |
|-----------|-------|
| 🔴 Core | TASK-01 a TASK-25, TASK-28, TASK-30, TASK-34 |
| 🟡 Importante | TASK-26 a TASK-27, TASK-29, TASK-31 a TASK-40 |
| 🟠 Bônus | TASK-41 a TASK-44 |
