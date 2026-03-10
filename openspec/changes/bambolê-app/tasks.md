# Tasks — App Bambolê

> Estimativa total: ~60 horas | 11 semanas

---

## Semana 1–2 · Setup e Autenticação (~12h)

- [ ] **TASK-01** Inicializar projeto Expo + TypeScript  
  Criar projeto com `expo init`, configurar paths absolutos (`@/`), ESLint, Prettier  
  _Est: 2h_

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

## Semana 3–4 · Cadastros Admin (~12h)

- [ ] **TASK-08** Schema Supabase: tabelas base  
  `users`, `children`, `guardians`, `guardian_children`, `classes`, `monitor_activities`  
  RLS policies por role  
  _Est: 2h_

- [ ] **TASK-09** Domínio Enrollment  
  `Child`, `Guardian`, `GuardianLink` entities; `ChildName`, `PhotoUrl` VOs  
  `IChildRepository`, `IGuardianRepository`; eventos `ChildEnrolled`, `GuardianLinked`  
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
  Cadastrar (admin define senha), listar, atribuir turma  
  _Est: 1h_

- [ ] **TASK-14** Tela: Vinculação Pai ↔ Filho (Admin)  
  Buscar pai por e-mail, criar/desfazer vínculo  
  _Est: 1h_

- [ ] **TASK-34** Tela: Gestão de Turmas (Admin) — movida para Core  
  Criar/editar turmas + visão simples de % de presença por turma  
  ⚠️ Pré-requisito para cadastro de crianças e monitores  
  _Est: 1.5h_

---

## Semana 5–6 · Presença e Agenda (~10h)

- [ ] **TASK-15** Schema Supabase: presença e agenda  
  `attendance_records`, `schedules`, `monitor_activities` (is_primary flag)  
  _Est: 1.5h_

- [ ] **TASK-16** Domínio Attendance  
  `AttendanceRecord` aggregate, `AttendanceStatus` VO (4 estados), `GeolocationProof`, `JustificationNote`  
  Métodos: `markPresent`, `markAbsent`, `preJustify`, `justifyRetroactively`  
  Eventos: `AttendanceMarked`, `AbsencePreJustified`, `AbsenceJustified`  
  _Est: 2h_

- [ ] **TASK-17** Integrar `expo-location` + validação geográfica  
  `ExpoLocationService`, verificar raio de alcance do centro antes de confirmar chamada  
  _Est: 1.5h_

- [ ] **TASK-18** Tela: Chamada / Presença (Monitor)  
  Lista de alunos com avatar, sinalização de pré-justificativas, marcação de status  
  `TakeAttendanceUseCase`  
  _Est: 2h_

- [ ] **TASK-19** Tela: Histórico de Presenças (Pai)  
  Calendário com cores por status, ação de pré-justificar (data futura) e justificar retroativamente  
  `PreJustifyAbsenceUseCase`, `JustifyAbsenceUseCase`  
  _Est: 1.5h_

- [ ] **TASK-20** Domínio Activity + Tela de Agenda (Monitor)  
  `Class`, `Schedule` aggregates; tela com CRUD de atividades pelo monitor  
  `Schedule` inclui: `title`, `description`, `date`, `time`, `category` (enum fixo), `recurrence` (`none | weekly`)  
  `CreateScheduleUseCase`, `GetClassScheduleUseCase`  
  Categorias: `Esporte`, `Arte`, `Música`, `Brincadeira Livre`, `Passeio`, `Outros`  
  _Est: 2h_

---

## Semana 7–8 · Câmera, Geoloc e Feed (~12h)

- [ ] **TASK-21** Integrar `expo-camera`  
  `ExpoCameraService`, permissões, captura e upload para Supabase Storage  
  _Est: 2h_

- [ ] **TASK-22** Schema Supabase: activity_photos  
  Tabela `activity_photos`, RLS, bucket Storage  
  _Est: 1h_

- [ ] **TASK-23** Tela: Captura de Foto (Monitor)  
  Câmera + preview + upload + vinculação à atividade  
  `PublishPhotoUseCase` → emite `PhotoPublished`  
  _Est: 2.5h_

- [ ] **TASK-24** Tela: Feed de Fotos (Pai)  
  Grade de fotos por dia/atividade, carregamento lazy  
  _Est: 2h_

- [ ] **TASK-25** Tela: Home da Turma (Monitor)  
  Visão geral do dia: alunos, agenda do dia, atalhos para chamada e fotos  
  _Est: 1.5h_

- [ ] **TASK-26** Telas do Pai: Home, Detalhe do Filho, Perfil  
  Tela 4: listagem de filhos + preview de 2 avisos recentes  
  Tela 5: presença do dia, stats do mês, atividade de hoje (sem seção de fotos)  
  Tela 9: alterar nome e senha; foto de perfil (opcional); push gerenciado pelo SO  
  _Est: 3h_

---

## Semana 9–10 · Notificações e Comunicados (~8h)

- [ ] **TASK-27** Setup Expo Notifications + FCM/APNs  
  Configurar tokens, permissões, registro no Supabase por usuário  
  ⚠️ Push gerenciado somente pelo SO — sem toggle interno no app  
  _Est: 2h_

- [ ] **TASK-28** EventBus  
  `EventBus.ts` — integração entre contextos (Attendance → Communication, Activity → Communication)  
  _Est: 1.5h_

- [ ] **TASK-29** Domínio Communication + repositório  
  `Announcement` aggregate, `AnnouncementContent`, `Audience` VOs  
  `PublishAnnouncementUseCase`, `SupabaseAnnouncementRepository`  
  _Est: 1.5h_

- [ ] **TASK-30** Tela: Observações (Monitor)  
  Notas individuais/gerais + histórico de avisos enviados + ação de novo aviso com push  
  _Est: 1.5h_

- [ ] **TASK-31** Tela: Comunicados Gerais (Admin)  
  Publicar comunicado para todos os pais via push  
  _Est: 1h_

- [ ] **TASK-32** Tela: Avisos / Notificações (Pai)  
  Lista de comunicados recebidos (turma + geral)  
  _Est: 0.5h_

**Gatilhos de push implementados nesta fase:**
| Evento | Destinatário |
|--------|-------------|
| Chamada marcada | Pai do filho |
| Foto publicada | Pais da turma |
| Aviso do monitor publicado | Pais da turma |
| Comunicado geral | Todos os pais |
| Pré-justificativa registrada pelo pai | Monitor da turma |

---

## Semana 9–10 (paralelo) · Cache Offline (~incluída acima)

- [ ] **TASK-33** SQLiteParentCache  
  Cache de leitura para pai: presenças, fotos, avisos  
  Fila de sincronização para ações pendentes offline (justificativa de falta)  
  _Est: 2h_

---

## Semana 11 · Finalização e Apresentação (~8h)

- [ ] **TASK-35** Testes de integração — fluxos críticos  
  Auth + vinculação, chamada de presença, justificativa de falta, publicação de foto, push notification  
  _Est: 3h_

- [ ] **TASK-36** Polish e acessibilidade  
  Revisar touch targets (mín. 44pt), estados de loading/erro, feedback visual de ações  
  _Est: 2h_

- [ ] **TASK-37** Preparação da apresentação  
  Gravar demo dos 3 fluxos principais, documentar setup do projeto  
  _Est: 1.5h_

---

## Priorização

| Prioridade | Tasks |
|-----------|-------|
| 🔴 Core | TASK-01 a 20, TASK-34 |
| 🟡 Importante | TASK-21 a 33 |
| 🟠 Bônus | TASK-35 a 37 |
