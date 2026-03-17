# Design Técnico — App Bambolê

> Atualizado com refinamentos de 13/03/2026

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Expo + React Native |
| Banco local | SQLite (cache offline de leitura — pais) |
| Backend / BD | Supabase (Postgres + Auth + Storage + Realtime) |
| Câmera | expo-camera |
| Geolocalização | expo-location |
| Notificações push | Expo Notifications + FCM/APNs |
| Autenticação | Supabase Auth (e-mail/senha) |
| **Ícones** | **@expo/vector-icons** |
| **Testes unitários / integração** | **Jest** |
| **Testes de componentes** | **React Native Testing Library** |
| **Testes E2E** | **Maestro** |

---

## Estratégia de Testes — TDD

O projeto segue **Test-Driven Development** em todas as camadas. A pirâmide de testes é:

```
         /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
        /     Maestro (E2E)        \   ← fluxos críticos do usuário
       /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
      /   RNTL (Componentes/Telas)   \  ← UI isolada com mocks
     /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
    /    Jest (Unit + Integration)     \ ← domínio puro + use cases
   /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
```

### Camada 1 — Jest: Domínio e Use Cases

O `domain/` é puro TypeScript, sem dependências externas — trivial de testar com Jest:

```typescript
// domain/attendance/__tests__/AttendanceRecord.test.ts
describe('AttendanceRecord', () => {
  it('deve lançar erro ao justificar retroativamente uma presença já marcada como present', () => {
    const record = AttendanceRecord.create({ status: 'present', ... })
    expect(() => record.justifyRetroactively(note)).toThrow(InvalidStateError)
  })

  it('deve mudar status para pre_justified ao pré-justificar data futura', () => {
    const record = AttendanceRecord.createForFutureDate(...)
    record.preJustify(new JustificationNote('Consulta médica'))
    expect(record.status).toBe('pre_justified')
  })
})
```

Use cases usam **repositórios mockados** (interfaces do `domain/`):

```typescript
// application/attendance/__tests__/TakeAttendanceUseCase.test.ts
describe('TakeAttendanceUseCase', () => {
  it('deve lançar AttendanceOutsideScheduleError fora do horário da grade', async () => {
    const mockClassRepo = { findById: jest.fn().mockResolvedValue(classOutsideSchedule) }
    const useCase = new TakeAttendanceUseCase(mockClassRepo, ...)
    await expect(useCase.execute(classId, monitorId)).rejects.toThrow(AttendanceOutsideScheduleError)
  })
})
```

### Camada 2 — React Native Testing Library: Componentes e Telas

Telas são testadas em isolamento com dependências mockadas (use cases injetados via props/context):

```typescript
// presentation/screens/monitor/__tests__/AttendanceScreen.test.tsx
describe('AttendanceScreen', () => {
  it('deve exibir badge de câmera riscada para criança sem consentimento', () => {
    const { getByTestId } = render(
      <AttendanceScreen children={[childWithoutConsent]} />
    )
    expect(getByTestId('no-consent-badge-child-1')).toBeTruthy()
  })

  it('deve desabilitar botão de chamada se fora do horário', () => {
    const { getByTestId } = render(
      <AttendanceScreen isOutsideSchedule={true} />
    )
    expect(getByTestId('start-attendance-btn')).toBeDisabled()
  })
})
```

### Camada 3 — Maestro: Fluxos E2E

Fluxos críticos cobertos com Maestro (YAML declarativo, roda em dispositivo/emulador):

```yaml
# .maestro/flows/attendance_flow.yaml
appId: com.bambole.app
---
- launchApp
- tapOn: "E-mail"
- inputText: "monitor@bambole.com"
- tapOn: "Senha"
- inputText: "senha123"
- tapOn: "Entrar"
- tapOn: "Turma A"
- tapOn: "Chamada"
- assertVisible: "João Silva"
- tapOn: "Presente"            # marca presença
- assertVisible: "Chamada salva"
```

**Fluxos E2E obrigatórios:**
| Fluxo | Arquivo Maestro |
|-------|-----------------|
| Login por role (parent/monitor/admin) | `login_flow.yaml` |
| Chamada de presença completa | `attendance_flow.yaml` |
| Pré-justificativa e justificativa retroativa | `absence_justify_flow.yaml` |
| Solicitação e aprovação de turma | `class_request_flow.yaml` |
| Publicação de foto + feed do pai | `photo_feed_flow.yaml` |
| Consentimento de imagem LGPD | `image_consent_flow.yaml` |
| Cadastro de criança (admin) | `enroll_child_flow.yaml` |

### Workflow TDD por camada

```
1. Escrever teste que falha (Red)
2. Implementar o mínimo para passar (Green)
3. Refatorar mantendo os testes passando (Refactor)

Ordem por camada:
  domain/ → application/ → infrastructure/ (mocks) → presentation/ (RNTL) → E2E (Maestro)
```

### Cobertura mínima esperada

| Camada | Ferramenta | Cobertura mínima |
|--------|------------|------------------|
| `domain/` | Jest | 100% |
| `application/` | Jest | 90% |
| `infrastructure/` | Jest (integração) | 70% |
| `presentation/` | RNTL | 80% |
| Fluxos críticos | Maestro | 7 flows obrigatórios |

---

## Arquitetura: Clean Architecture + DDD Completo

### Camadas

```
presentation/   ← Telas, componentes, navegação (React Native)
application/    ← Use Cases / Application Services
domain/         ← Bounded Contexts, Entidades, VOs, Domain Events (núcleo puro)
infrastructure/ ← Supabase, SQLite, Câmera, Geoloc, Push
```

> Regra de dependência absoluta: camadas externas dependem de internas. `domain/` não conhece Supabase, React Native nem SQLite.

---

## Bounded Contexts

### 1. Identity & Access
- **Aggregate Root**: `User`
- **Value Objects**: `Email`, `Role` (`parent | monitor | admin`)
- **Domain Events**: `UserRegistered`, `RoleAssigned`
- **Repositório**: `IUserRepository`

### 2. Enrollment
- **Aggregate Root**: `Child`, `Guardian`
- **Value Objects**: `ChildName`, `PhotoUrl` (opcional), `ChildId`
- **Associação**: `GuardianLink` (N:M — um filho pode ter múltiplos responsáveis)
- **Domain Events**: `ChildEnrolled`, `GuardianLinked`, `GuardianUnlinked`
- **Repositório**: `IChildRepository`, `IGuardianRepository`

### 3. Attendance
- **Aggregate Root**: `AttendanceRecord`
- **Value Objects**: `AttendanceStatus`, `GeolocationProof`, `JustificationNote`
- **Status possíveis**: `present | absent | pre_justified | justified`
- **Domain Events**: `AttendanceMarked`, `AbsencePreJustified`, `AbsenceJustified`
- **Repositório**: `IAttendanceRepository`

```typescript
class AttendanceRecord {
  markPresent(proof: GeolocationProof): void
  markAbsent(): void
  preJustify(note: JustificationNote): void      // pai avisa antes
  justifyRetroactively(note: JustificationNote): void  // pai justifica depois
}
```

### 4. Activity
- **Aggregate Roots**: `Class` (Turma), `Schedule`
- **Value Objects**: `ClassName`, `ScheduleDate`, `PhotoUrl`, `ActivityCategory`, `Recurrence`, `WeeklySchedule`
- **Domain Events**: `ActivityScheduled`, `PhotoPublished`, `MonitorAssigned`
- **Repositórios**: `IClassRepository`, `IScheduleRepository`
- Monitor tem autonomia total para criar/editar atividades da sua turma

```typescript
type ActivityCategory = 'Esporte' | 'Arte' | 'Música' | 'Brincadeira Livre' | 'Passeio' | 'Outros'
type Recurrence = 'none' | 'weekly'

class Class {
  id: ClassId
  name: ClassName
  description?: string       // Modalidade
  ageRange?: string          // ex: "6–10 anos"
  weeklySchedule: WeeklySchedule

  isCallAllowedNow(): boolean   // verifica janela horária da grade
}

// domain/activity/value-objects/WeeklySchedule.ts
class WeeklySchedule {
  days: DayOfWeek[]          // 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'
  startTime: string          // "HH:MM"
  endTime: string            // "HH:MM"
  includesNow(): boolean
}

class Schedule {
  id: ScheduleId
  classId: ClassId
  title: string
  description?: string
  scheduledAt: ScheduleDate
  category: ActivityCategory   // obrigatório
  recurrence: Recurrence       // 'none' | 'weekly'
}
```

### 5. Communication
- **Aggregate Root**: `Announcement`
- **Value Objects**: `AnnouncementContent` (max 500 chars), `Audience` (`class | all`), `NotificationChannel`
- **Domain Events**: `AnnouncementPublished`, `NotificationSent`
- **Repositório**: `IAnnouncementRepository`

---

## Context Map

```
Identity & Access  ──(Shared Kernel: UserId)──▶  todos os contextos
Enrollment         ──(Customer/Supplier)──▶  Attendance   (ChildId em AttendanceRecord)
Enrollment         ──(Customer/Supplier)──▶  Activity     (ChildId ↔ ClassId)
Activity           ──(Published Language)──▶  Communication  (PhotoPublished → Notif)
Attendance         ──(Published Language)──▶  Communication  (AttendanceMarked → Notif)
```

**Integração cross-context via Supabase Database Webhooks + Edge Functions** — não há barramento em memória.

---

## Modelo de Dados (Supabase / Postgres)

```sql
-- Identity
users(id, email, role, created_at)

-- Enrollment
children(id, name, photo_url, class_id, created_at)
guardians(id, user_id, image_consent BOOLEAN DEFAULT FALSE, image_consent_at TIMESTAMPTZ)
guardian_children(guardian_id, child_id)  -- N:M

-- Activity
classes(id, name, description, age_range, weekly_schedule JSONB, created_at)
-- weekly_schedule: { "days": ["MON","WED","FRI"], "start_time": "14:00", "end_time": "17:00" }
monitor_activities(monitor_id, class_id, is_primary)  -- N:M com flag
schedules(id, class_id, title, description, scheduled_at, category, recurrence)
activity_photos(id, schedule_id, url, uploaded_by, uploaded_at)

-- Attendance
attendance_records(id, child_id, class_id, monitor_id, date,
                   status, lat, lng, justification_note, justified_at)
-- status: 'present' | 'absent' | 'pre_justified' | 'justified'

-- Communication
announcements(id, author_id, content, audience_type, class_id, published_at)
-- audience_type: 'class' | 'all'

-- Monitor: solicitação de turma
class_access_requests(id, monitor_id, class_id, reason, status, reviewed_by,
                       created_at, reviewed_at)
-- status: 'pending' | 'approved' | 'rejected'
```

---

## Notificações Push — Expo Push API (direto nos use cases)

Push notifications são disparadas **diretamente nos use cases da camada `application/`**, logo após persistir a ação no Supabase. Não há webhook nem Edge Function — a chamada sai do próprio app (monitor/admin) via `ExpoPushService`.

```
Use Case executa ação
  └── Salva no Supabase
        └── Chama ExpoPushService.send(tokens, title, body)
              └── Expo Push API → FCM / APNs → dispositivo do destinatário
```

### Serviço de infraestrutura

```typescript
// infrastructure/notifications/ExpoPushService.ts
class ExpoPushService implements IPushService {
  async send(tokens: string[], title: string, body: string): Promise<void> {
    const messages = tokens.map(token => ({
      to: token,
      sound: 'default',
      title,
      body,
    }))
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messages),
    })
  }
}
```

### Gatilhos por use case

| Use Case | Quem chama | Destinatário |
|----------|------------|--------------|
| `TakeAttendanceUseCase` | Monitor | Pai do filho (push: presença registrada) |
| `PreJustifyAbsenceUseCase` | Pai | Monitor da turma (push: falta comunicada) |
| `PublishPhotoUseCase` | Monitor | Pais da turma (push: nova foto) |
| `PublishAnnouncementUseCase` (class) | Monitor | Pais da turma (push: novo aviso) |
| `PublishAnnouncementUseCase` (all) | Admin | Todos os pais (push: comunicado geral) |

### Registro de tokens

```sql
-- Coluna adicionada à tabela users
ALTER TABLE users ADD COLUMN push_token TEXT;
```

Tokens registrados no `SignInUseCase` após login e atualizados sempre que o Expo gera um novo token (`Notifications.getExpoPushTokenAsync()`).

---

## Bloqueio de Chamada por Horário

```typescript
// application/attendance/use-cases/TakeAttendanceUseCase.ts
class TakeAttendanceUseCase {
  async execute(classId: ClassId, monitorId: UserId): Promise<void> {
    const cls = await this.classRepo.findById(classId)
    if (!cls.isCallAllowedNow()) {
      throw new AttendanceOutsideScheduleError(
        'Chamada fora do horário da turma. Contate o admin para ajustar a grade.'
      )
    }
    // continua com a chamada...
  }
}
```

---

## Monitor sem Turma — Modo Visualização

```
MinhasTurmasScreen (Tela 10)
  ├── [tem turmas] → lista turmas → toca → ClassDetailScreen
  └── [sem turmas] → EmptyState "Nenhuma turma vinculada"
                      └── Botão "Solicitar Turma" → modal de solicitação
```

```typescript
// application/activity/use-cases/RequestClassAccessUseCase.ts
class RequestClassAccessUseCase {
  async execute(monitorId: UserId, classId: ClassId, reason?: string): Promise<void>
  // Insere em class_access_requests com status 'pending'
}

// application/activity/use-cases/ApproveClassRequestUseCase.ts
class ApproveClassRequestUseCase {
  async execute(adminId: UserId, requestId: string): Promise<void>
  // Insere em monitor_activities { monitor_id, class_id, is_primary: false }
}
```

---

## Comportamento Offline

| Perfil | Offline |
|--------|---------|
| **Pai** | Leitura via SQLite cache — presença, fotos, avisos sincronizados |
| **Monitor** | Requer conexão (geolocalização obrigatória na chamada) |
| **Admin** | Requer conexão |

### Regras de Sincronização Offline

```typescript
interface PendingAction {
  id: string
  type: 'pre_justify' | 'justify_retroactive'
  payload: Record<string, unknown>
  createdAt: Date
  expiresAt: Date   // createdAt + 7 dias
}

interface SyncResult {
  applied: PendingAction[]
  discarded: DiscardedAction[]
}

interface DiscardedAction {
  action: PendingAction
  reason: 'conflict' | 'expired'
  message: string   // exibido ao pai como alerta
}
```

- **Conflito**: servidor sempre ganha — se monitor já marcou `present`, ação offline do pai é descartada com alerta
- **Expiração**: ações com `expiresAt < now()` descartadas na abertura do app
- **Feedback**: sync silencioso; alerta apenas se houver descartes

---

## LGPD — Consentimento de Imagem

### Campos no banco

```sql
ALTER TABLE guardians ADD COLUMN image_consent BOOLEAN DEFAULT FALSE;
ALTER TABLE guardians ADD COLUMN image_consent_at TIMESTAMPTZ;
```

### Fluxo

```
1º acesso após login → ImageConsentModal (fullscreen, não skipável)
  ├── Aceitar → image_consent = true → acessa feed normalmente
  └── Recusar → image_consent = false → feed bloqueado com mensagem

Tela 9 (Perfil) → revogar/atualizar consentimento a qualquer momento
```

### Impactos na UI

- **Tela 7 (Feed de Fotos — Pai)**: bloqueado se `image_consent = false`
- **Tela 11 (Chamada — Monitor)**: badge/ícone de câmera riscada em crianças sem consentimento de nenhum guardião

### RLS no Storage (bucket: activity-photos)

```sql
CREATE POLICY "parents_of_class_only"
ON storage.objects FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM guardian_children gc
    JOIN children c ON c.id = gc.child_id
    WHERE gc.guardian_id = auth.uid()
      AND c.class_id = (storage.foldername(name))[1]::uuid
  )
);
```

**Retenção**: ao desmatrícula da criança, Edge Function remove fotos associadas do Storage.

---

## Recuperação de Senha

| Perfil | Via |
|--------|-----|
| **Pai** | Magic link por e-mail (Supabase Auth, Tela 3) |
| **Monitor — via 1** | Magic link por e-mail (mesmo fluxo, Tela 3) |
| **Monitor — via 2** | Admin redefine na Tela 16 (Edge Function com `service_role`) |

```typescript
// application/identity/use-cases/AdminResetMonitorPasswordUseCase.ts
class AdminResetMonitorPasswordUseCase {
  async execute(adminId: UserId, monitorId: UserId, newPassword: string): Promise<void>
  // Chama supabase.auth.admin.updateUserById() via Edge Function com service_role key
}
```

---

## Geolocalização

- **Raio de tolerância**: 200m
- **Coordenadas do centro**: hardcoded em `src/infrastructure/location/config.ts`
- Fora do raio: alerta bloqueante exibido ao monitor — chamada não pode ser iniciada

```typescript
// src/infrastructure/location/config.ts
export const CENTER_LOCATION = {
  lat: -23.000000,
  lng: -43.000000,
  radiusMeters: 200,
};
```

---

## Inventário de Telas (19 total + 1 fluxo modal)

### Auth (3)
1. Login
2. Cadastro (pai)
3. Recuperação de senha

### Visão do Pai (6)
4. Home / Meus Filhos
5. Detalhe do Filho
6. **Histórico de Presenças** ← justificar falta proativa e retroativa
7. Feed de Fotos ← bloqueado sem consentimento LGPD
8. Avisos / Notificações
9. Perfil ← revogar consentimento de imagem

### Visão do Monitor (6)
10. Minhas Turmas (Home) ← lista de turmas; Modo Visualização se sem turma
10b. Visão da Turma ← selecionada na Home
11. **Chamada / Presença** ← bloqueada fora do horário; badge sem consentimento
12. Captura de Foto
13. **Observações** ← notas internas + histórico de avisos para pais
14. **Agenda da Turma** ← monitor cria e edita atividades

### Visão Admin (5)
15. Gestão de Crianças (inclui foto opcional + avatar de iniciais como fallback)
16. Gestão de Monitores ← aprovar solicitações de turma + redefinir senha
17. Vinculação Pai ↔ Filho (busca por e-mail)
18. **Gestão de Turmas** ← inclui grade horária, modalidade, faixa etária
19. **Comunicados Gerais** ← push para todos os pais

---

## Fluxos Críticos

### Chamada de Presença
```
Monitor abre tela de chamada
  → Verifica horário vs. grade da turma (bloqueia se fora do horário)
  → Valida geolocalização (bloqueia se fora do raio)
  → Lista filhos da turma (com pré-justificativas sinalizadas + badge sem consentimento)
  → Para cada filho: marcar present | absent | justified
  → Emite AttendanceMarked → Webhook → Edge Function → push para o pai
```

### Justificativa de Falta (Pai)
```
Pai acessa Histórico de Presenças (calendário)
  → Toca em data futura → PreJustifyAbsenceUseCase → status: pre_justified
  → Toca em data passada com status absent → JustifyAbsenceUseCase → status: justified
  → Monitor vê pré-justificativa sinalizada na lista de chamada
```

### Solicitação de Turma (Monitor)
```
Monitor sem turma → Tela 10 (Modo Visualização)
  → Botão "Solicitar Turma" → seleciona turma + motivo (opcional)
  → RequestClassAccessUseCase → class_access_requests (pending)
  → Admin vê na Tela 16 → Aprovar ou Rejeitar
  → Se aprovado → monitor_activities atualizado → nova turma aparece na lista
```

---

## Estrutura de Pastas (DDD)

```
src/
├── domain/
│   ├── identity/      { entities, value-objects, events, repositories }
│   ├── enrollment/    { entities, value-objects, events, repositories }
│   ├── attendance/    { entities, value-objects, events, repositories }
│   ├── activity/      { entities, value-objects, events, repositories }
│   └── communication/ { entities, value-objects, events, repositories }
├── application/
│   ├── identity/      { use-cases }
│   ├── enrollment/    { use-cases }
│   ├── attendance/    { use-cases }
│   ├── activity/      { use-cases }
│   └── communication/ { use-cases }
├── infrastructure/
│   ├── supabase/      { repositories por contexto }
│   │   └── edge-functions/ { notify-attendance, notify-photo, notify-announcement,
│   │                         notify-prejustify, admin-reset-password }
│   ├── sqlite/        SQLiteParentCache.ts
│   ├── camera/        ExpoCameraService.ts
│   └── location/      ExpoLocationService.ts, config.ts
└── presentation/
    ├── navigation/
    ├── screens/       { auth, parent, monitor, admin }
    └── components/
```
