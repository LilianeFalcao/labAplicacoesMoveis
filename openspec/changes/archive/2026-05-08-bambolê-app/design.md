# Design Técnico — App Bambolê

> Atualizado com refinamentos de 13/03/2026

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Expo + React Native + **TypeScript** |
| Banco local | SQLite (via **TypeScript**) |
| Backend / BD | Supabase (Postgres + Auth + Storage + Realtime) + **Edge Functions (TypeScript/Deno)** |
| Câmera | expo-camera |
| Geolocalização | expo-location |
| Notificações push | Expo Notifications + FCM/APNs |
| Autenticação | Supabase Auth (e-mail/senha) |
| **Ícones** | **@expo/vector-icons** |
| **Testes unitários / integração** | **Jest (+ ts-jest)** |
| **Testes de componentes** | **React Native Testing Library** |
| **Testes E2E** | **Maestro** |

---

## Padrões Técnicos — TypeScript & Qualidade

Para garantir a manutenibilidade e a segurança do código, o sistema segue estes padrões:

1.  **TypeScript Strict Mode**: Todos os arquivos `.ts` e `.tsx` devem ser compilados com `strict: true`. O uso de `any` é proibido — prefira `unknown` ou interfaces genéricas.
2.  **End-to-End Type Safety**: Tipos para o banco de dados Supabase devem ser gerados via CLI (`supabase gen types typescript`) e consumidos tanto no App quanto nas Edge Functions.
3.  **Edge Functions**: Implementadas em **TypeScript (Deno)**. Compartilhamento de tipos com o frontend via pastas compartilhadas (`shared-types/` se necessário) sempre que possível.
4.  **Absolute paths**: Uso de `@/` mapeado para `src/` em todos os ambientes (App e Functions).

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

### Cache de Leitura (Pai)

Dados cacheados no SQLite local para acesso offline:

| Dado | Tabela SQLite | Atualização |
|------|---------------|-------------|
| Presenças dos filhos | `cached_attendances` | A cada abertura do app + pull-to-refresh |
| Feed de fotos | `cached_photos` (metadados) + arquivos em disco | Lazy — somente fotos já visualizadas |
| Avisos e comunicados | `cached_announcements` | A cada abertura do app |
| Dados dos filhos | `cached_children` | A cada abertura do app |

### Fila de Ações Pendentes (Escrita Offline)

Quando o pai executa uma ação de escrita sem conexão, ela é enfileirada no SQLite:

```sql
-- infrastructure/sqlite/schema.sql
CREATE TABLE pending_actions (
  id          TEXT PRIMARY KEY,
  type        TEXT NOT NULL,  -- 'pre_justify' | 'justify_retroactive'
  payload     TEXT NOT NULL,  -- JSON serializado
  created_at  TEXT NOT NULL,  -- ISO 8601
  expires_at  TEXT NOT NULL,  -- created_at + 7 dias (ISO 8601)
  status      TEXT NOT NULL DEFAULT 'pending'  -- 'pending' | 'synced' | 'discarded'
);
```

### Interfaces TypeScript

```typescript
// infrastructure/sqlite/types/PendingAction.ts
interface PendingAction {
  id: string
  type: 'pre_justify' | 'justify_retroactive'
  payload: {
    childId: string
    classId: string
    date: string           // YYYY-MM-DD
    justificationNote?: string
  }
  createdAt: Date
  expiresAt: Date          // createdAt + 7 dias
  status: 'pending' | 'synced' | 'discarded'
}

interface SyncResult {
  applied: PendingAction[]
  discarded: DiscardedAction[]
}

interface DiscardedAction {
  action: PendingAction
  reason: 'conflict' | 'expired'
  message: string          // exibido ao pai como alerta
}
```

### Pipeline de Sincronização — 4 Etapas

O sync executa automaticamente na **abertura do app** e quando a **conexão é restaurada** (`NetInfo`). O pipeline segue esta ordem:

```
┌─────────────────────────────────────────────────────────────────┐
│                    PIPELINE DE SYNC                             │
│                                                                 │
│  1. PURGE ──▶ 2. FETCH REMOTE ──▶ 3. REPLAY ──▶ 4. NOTIFY     │
│                                                                 │
│  Remover        Baixar estado      Tentar          Exibir       │
│  expiradas      atual do           aplicar         alerta se    │
│  (>7 dias)      servidor           pendentes       houve        │
│                                                    descartes    │
└─────────────────────────────────────────────────────────────────┘
```

### OfflineSyncService — Implementação Detalhada

```typescript
// infrastructure/sqlite/OfflineSyncService.ts

const EXPIRATION_DAYS = 7

class OfflineSyncService {
  constructor(
    private readonly db: SQLiteDatabase,
    private readonly attendanceRepo: IAttendanceRepository,
    private readonly alertService: IAlertService
  ) {}

  /**
   * Ponto de entrada principal — chamado na abertura do app
   * e quando NetInfo detecta reconexão.
   */
  async sync(): Promise<SyncResult> {
    // Etapa 1: PURGE — remover ações expiradas
    const expired = await this.purgeExpiredActions()

    // Etapa 2: FETCH — obter estado remoto atualizado
    await this.refreshLocalCache()

    // Etapa 3: REPLAY — tentar aplicar ações pendentes
    const { applied, conflicted } = await this.replayPendingActions()

    // Etapa 4: NOTIFY — alertar pai sobre descartes
    const allDiscarded: DiscardedAction[] = [
      ...expired.map(a => ({
        action: a,
        reason: 'expired' as const,
        message: `Justificativa para ${a.payload.date} expirou (mais de 7 dias sem conexão).`
      })),
      ...conflicted
    ]

    if (allDiscarded.length > 0) {
      await this.alertService.showSyncAlert(allDiscarded)
    }

    return { applied, discarded: allDiscarded }
  }

  /**
   * ETAPA 1: PURGE
   * Remove ações cuja data de expiração já passou.
   * Critério: expires_at < NOW()
   * onde expires_at = created_at + 7 dias.
   */
  private async purgeExpiredActions(): Promise<PendingAction[]> {
    const now = new Date().toISOString()

    // Buscar expiradas antes de deletar (para reportar ao pai)
    const expired = await this.db.getAllAsync<PendingAction>(
      `SELECT * FROM pending_actions
       WHERE status = 'pending' AND expires_at < ?`,
      [now]
    )

    // Marcar como descartadas (soft delete para auditoria)
    await this.db.runAsync(
      `UPDATE pending_actions
       SET status = 'discarded'
       WHERE status = 'pending' AND expires_at < ?`,
      [now]
    )

    return expired
  }

  /**
   * ETAPA 3: REPLAY
   * Para cada ação pendente não expirada, verifica o estado
   * atual no servidor antes de tentar aplicar.
   * Regra: SERVIDOR SEMPRE GANHA.
   */
  private async replayPendingActions(): Promise<{
    applied: PendingAction[]
    conflicted: DiscardedAction[]
  }> {
    const pending = await this.db.getAllAsync<PendingAction>(
      `SELECT * FROM pending_actions
       WHERE status = 'pending'
       ORDER BY created_at ASC`
    )

    const applied: PendingAction[] = []
    const conflicted: DiscardedAction[] = []

    for (const action of pending) {
      const serverRecord = await this.attendanceRepo.findByChildAndDate(
        action.payload.childId,
        action.payload.date
      )

      // Verificar conflito: se servidor já tem estado diferente
      const hasConflict = this.detectConflict(action, serverRecord)

      if (hasConflict) {
        conflicted.push({
          action,
          reason: 'conflict',
          message: this.buildConflictMessage(action, serverRecord)
        })
        await this.markAs(action.id, 'discarded')
      } else {
        // Aplicar ação no servidor
        await this.applyAction(action)
        await this.markAs(action.id, 'synced')
        applied.push(action)
      }
    }

    return { applied, conflicted }
  }

  /**
   * Detecta conflito entre ação offline e estado atual do servidor.
   * Conflito ocorre quando:
   * - Ação é pre_justify mas servidor já tem status 'present'
   *   (monitor já fez a chamada)
   * - Ação é justify_retroactive mas servidor já tem status
   *   'present' ou 'justified'
   */
  private detectConflict(
    action: PendingAction,
    serverRecord: AttendanceRecord | null
  ): boolean {
    if (!serverRecord) return false  // sem registro = sem conflito

    if (action.type === 'pre_justify') {
      return serverRecord.status === 'present'
    }

    if (action.type === 'justify_retroactive') {
      return ['present', 'justified'].includes(serverRecord.status)
    }

    return false
  }

  private buildConflictMessage(
    action: PendingAction,
    serverRecord: AttendanceRecord | null
  ): string {
    if (action.type === 'pre_justify' && serverRecord?.status === 'present') {
      return `A presença de ${action.payload.date} já foi registrada pelo monitor. Sua pré-justificativa foi descartada.`
    }
    if (action.type === 'justify_retroactive') {
      return `A presença de ${action.payload.date} já foi atualizada (${serverRecord?.status}). Sua justificativa foi descartada.`
    }
    return `Ação para ${action.payload.date} descartada por conflito com dados do servidor.`
  }

  private async markAs(id: string, status: 'synced' | 'discarded'): Promise<void> {
    await this.db.runAsync(
      `UPDATE pending_actions SET status = ? WHERE id = ?`,
      [status, id]
    )
  }
}
```

### Enfileiramento de Ações Offline

```typescript
// infrastructure/sqlite/OfflineActionQueue.ts

class OfflineActionQueue {
  constructor(private readonly db: SQLiteDatabase) {}

  /**
   * Enfileira uma ação quando não há conexão.
   * O expiresAt é calculado automaticamente: createdAt + 7 dias.
   */
  async enqueue(type: PendingAction['type'], payload: PendingAction['payload']): Promise<void> {
    const now = new Date()
    const expiresAt = new Date(now.getTime() + EXPIRATION_DAYS * 24 * 60 * 60 * 1000)

    await this.db.runAsync(
      `INSERT INTO pending_actions (id, type, payload, created_at, expires_at, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [
        uuid(),
        type,
        JSON.stringify(payload),
        now.toISOString(),
        expiresAt.toISOString()
      ]
    )
  }

  async getPendingCount(): Promise<number> {
    const result = await this.db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM pending_actions WHERE status = 'pending'`
    )
    return result?.count ?? 0
  }
}
```

### Ciclo de Vida Completo — Fluxograma

```
Pai executa ação (ex: justificar falta)
  │
  ├── [Online] ──▶ Use Case executa direto no Supabase ──▶ OK
  │
  └── [Offline] ──▶ OfflineActionQueue.enqueue()
                      │
                  ┌───▼──────────────────────────┐
                  │  SQLite: pending_actions      │
                  │  status = 'pending'           │
                  │  expires_at = now + 7 dias    │
                  └───┬──────────────────────────-┘
                      │
              ┌───────▼────────┐
              │ App reabre ou  │
              │ conexão volta  │
              │ (NetInfo)      │
              └───────┬────────┘
                      │
              ┌───────▼──────────────────┐
              │ OfflineSyncService.sync() │
              └───────┬──────────────────┘
                      │
         ┌────────────▼────────────────┐
         │  1. PURGE: expires_at < now │
         │     → marcar 'discarded'    │
         │     → gerar alerta          │
         └────────────┬────────────────┘
                      │
         ┌────────────▼────────────────┐
         │  2. FETCH: atualizar cache  │
         │     com dados do servidor   │
         └────────────┬────────────────┘
                      │
         ┌────────────▼──────────────────────┐
         │  3. REPLAY: para cada pendente:   │
         │     → checar estado no servidor   │
         │     → conflito? → 'discarded'     │
         │     → sem conflito? → aplicar     │
         │       e marcar 'synced'           │
         └────────────┬──────────────────────┘
                      │
         ┌────────────▼────────────────────────────┐
         │  4. NOTIFY: se houve descartes          │
         │     → exibir alerta ao pai com motivo:  │
         │       • "expirou (>7 dias sem conexão)" │
         │       • "conflito (monitor já registrou)"│
         └─────────────────────────────────────────┘
```

### Limpeza Periódica

Ações com `status = 'synced'` ou `status = 'discarded'` são mantidas por **30 dias** para auditoria local, depois removidas automaticamente:

```typescript
// Executado junto com o sync, após as 4 etapas
async cleanupOldActions(): Promise<void> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  await this.db.runAsync(
    `DELETE FROM pending_actions
     WHERE status IN ('synced', 'discarded') AND created_at < ?`,
    [thirtyDaysAgo]
  )
}
```

### Regras Resumidas

| Regra | Detalhamento |
|-------|-------------|
| **Expiração** | `expiresAt = createdAt + 7 dias`. Ações pendentes com `expiresAt < now()` são marcadas como `discarded` na etapa PURGE |
| **Conflito** | Servidor sempre ganha. Se o estado no Supabase já foi alterado (ex: monitor marcou `present`), a ação offline é descartada |
| **Ordem de replay** | FIFO — ações são reprocessadas na ordem de `createdAt ASC` |
| **Feedback** | Sync é silencioso. O pai só recebe alerta (modal ou banner) se alguma ação foi descartada, com motivo claro |
| **Triggers** | Sync dispara em: (1) abertura do app, (2) restauração de conexão via `NetInfo`, (3) pull-to-refresh manual |
| **Limpeza** | Ações finalizadas (`synced`/`discarded`) são removidas após 30 dias |

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
