# Referência de Domínio — App Bambolê

> Documento de referência para desenvolvimento. Detalha todas as entidades, value objects, use cases e fluxos entre bounded contexts.
> Atualizado em: 21/03/2026

---

## Visão Geral dos Bounded Contexts

```
┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐
│   Identity & Access  │   │     Enrollment       │   │     Attendance       │
│                      │   │                      │   │                      │
│  Auth, roles,        │   │  Crianças, pais,     │   │  Chamada, presença,  │
│  recuperação de      │   │  vínculos,           │   │  justificativas,     │
│  senha               │   │  consentimento LGPD  │   │  geolocalização      │
└──────────────────────┘   └──────────────────────┘   └──────────────────────┘

┌──────────────────────┐   ┌──────────────────────┐
│      Activity        │   │   Communication      │
│                      │   │                      │
│  Turmas, grade       │   │  Avisos, comunicados, │
│  horária, agenda,    │   │  push notifications  │
│  fotos, monitores    │   │                      │
└──────────────────────┘   └──────────────────────┘
```

---

## 1. Identity & Access

### Aggregates, Entities e Value Objects

| Tipo | Nome | Campos / Regras |
|------|------|-----------------|
| **Aggregate Root** | `User` | `id: UserId`, `email: Email`, `role: Role`, `pushToken?: string` |
| **Value Object** | `Email` | Validação de formato RFC 5322 |
| **Value Object** | `Role` | `'parent' \| 'monitor' \| 'admin'` — imutável após atribuição |

### Domain Events

| Evento | Payload | Quando emitido |
|--------|---------|----------------|
| `UserRegistered` | `{ userId, email, role }` | Auto-cadastro do pai |
| `RoleAssigned` | `{ userId, role }` | Admin atribui role ao monitor |

### Use Cases

| Use Case | Ator | Entrada | Saída | Regras |
|----------|------|---------|-------|--------|
| `SignUpUseCase` | Pai | `email, password` | `User` | Valida Email VO; cria via Supabase Auth; role = `parent` |
| `SignInUseCase` | Todos | `email, password` | `User + token` | Autentica; registra/atualiza `push_token` |
| `AdminResetMonitorPasswordUseCase` | Admin | `adminId, monitorId, newPassword` | `void` | Verifica role admin; chama Edge Function com `service_role` |

### Repositório

```typescript
interface IUserRepository {
  findById(id: UserId): Promise<User | null>
  findByEmail(email: Email): Promise<User | null>
  save(user: User): Promise<void>
  updatePushToken(userId: UserId, token: string): Promise<void>
}
```

---

## 2. Enrollment

### Aggregates, Entities e Value Objects

| Tipo | Nome | Campos / Regras |
|------|------|-----------------|
| **Aggregate Root** | `Child` | `id: ChildId`, `name: ChildName`, `photoUrl?: PhotoUrl`, `classId: ClassId`, `guardians: GuardianLink[]` |
| **Aggregate Root** | `Guardian` | `id: GuardianId`, `userId: UserId`, `imageConsent: boolean`, `imageConsentAt?: Date`, `children: GuardianLink[]` |
| **Entity** | `GuardianLink` | `guardianId, childId` — relação N:M |
| **Value Object** | `ChildName` | String não vazia, max 100 chars |
| **Value Object** | `PhotoUrl` | URL válida; opcional — fallback: avatar com iniciais |
| **Value Object** | `ChildId` | UUID tipado |
| **Value Object** | `GuardianId` | UUID tipado |

### Regras de Negócio

- Um pai pode ter **N filhos**; um filho pode ter **pai e mãe** vinculados (N:M)
- Admin faz a vinculação buscando o pai pelo **e-mail**
- `imageConsent` controla acesso ao feed de fotos (LGPD)
- Sem foto: exibir **avatar com iniciais** do nome da criança

### Domain Events

| Evento | Payload | Quando emitido |
|--------|---------|----------------|
| `ChildEnrolled` | `{ childId, classId }` | Admin cadastra criança |
| `GuardianLinked` | `{ guardianId, childId }` | Admin vincula pai ↔ filho |
| `GuardianUnlinked` | `{ guardianId, childId }` | Admin desfaz vínculo |

### Use Cases

| Use Case | Ator | Entrada | Saída | Regras |
|----------|------|---------|-------|--------|
| `EnrollChildUseCase` | Admin | `name, classId, photoUrl?` | `Child` | Cria Child; valida ClassId existente |
| `LinkGuardianUseCase` | Admin | `guardianEmail, childId` | `GuardianLink` | Busca pai por e-mail; cria vínculo N:M |
| `UnlinkGuardianUseCase` | Admin | `guardianId, childId` | `void` | Remove vínculo; não deleta Guardian nem Child |

### Repositórios

```typescript
interface IChildRepository {
  findById(id: ChildId): Promise<Child | null>
  findByClassId(classId: ClassId): Promise<Child[]>
  save(child: Child): Promise<void>
  delete(id: ChildId): Promise<void>
}

interface IGuardianRepository {
  findById(id: GuardianId): Promise<Guardian | null>
  findByUserId(userId: UserId): Promise<Guardian | null>
  findByEmail(email: Email): Promise<Guardian | null>
  save(guardian: Guardian): Promise<void>
  updateConsent(id: GuardianId, consent: boolean): Promise<void>
}
```

---

## 3. Attendance

### Aggregates, Entities e Value Objects

| Tipo | Nome | Campos / Regras |
|------|------|-----------------|
| **Aggregate Root** | `AttendanceRecord` | `id`, `childId`, `classId`, `monitorId`, `date`, `status`, `geolocation?`, `justification?` |
| **Value Object** | `AttendanceStatus` | `'present' \| 'absent' \| 'pre_justified' \| 'justified'` |
| **Value Object** | `GeolocationProof` | `{ lat: number, lng: number, recordedAt: Date }` |
| **Value Object** | `JustificationNote` | String max 500 chars |
| **Value Object** | `AttendanceDate` | Data tipada (YYYY-MM-DD) |
| **Value Object** | `AttendanceId` | UUID tipado |

### Métodos do Aggregate Root

```typescript
class AttendanceRecord {
  // Monitor marca presença — requer prova de geolocalização
  markPresent(proof: GeolocationProof): void
  // → status = 'present'
  // → emite AttendanceMarked

  // Monitor marca ausência
  markAbsent(): void
  // → status = 'absent'
  // → emite AttendanceMarked

  // Pai avisa falta com antecedência (data futura)
  preJustify(note: JustificationNote): void
  // → status = 'pre_justified'
  // → emite AbsencePreJustified
  // → ERRO se status já é 'present'

  // Pai justifica falta retroativamente (data passada com status 'absent')
  justifyRetroactively(note: JustificationNote): void
  // → status = 'justified'
  // → emite AbsenceJustified
  // → ERRO se status é 'present' ou 'justified'
}
```

### Transições de Status Válidas

```
                    ┌─────────────────────┐
                    │   (sem registro)    │
                    └──────┬──────────────┘
                           │
              ┌────────────┼────────────────┐
              ▼            ▼                ▼
         ┌─────────┐ ┌──────────┐  ┌────────────────┐
         │ present │ │  absent  │  │ pre_justified  │
         └─────────┘ └────┬─────┘  └───────┬────────┘
                          │                │
                          ▼                ▼
                    ┌───────────┐    ┌──────────┐
                    │ justified │    │ present  │ (monitor faz chamada)
                    └───────────┘    └──────────┘
                                    ┌──────────┐
                                    │  absent  │ (monitor marca falta)
                                    └──────────┘
```

### Domain Events

| Evento | Payload | Quem recebe (via push) |
|--------|---------|------------------------|
| `AttendanceMarked` | `{ childId, classId, status, date }` | Pai do filho |
| `AbsencePreJustified` | `{ childId, classId, date, note }` | Monitor da turma |
| `AbsenceJustified` | `{ childId, attendanceRecordId, note }` | — (sem push) |

### Use Cases

| Use Case | Ator | Entrada | Barreiras | Regras |
|----------|------|---------|-----------|--------|
| `TakeAttendanceUseCase` | Monitor | `classId, monitorId, records[]` | 1. `Class.isCallAllowedNow()` (grade horária) | Bloqueia com `AttendanceOutsideScheduleError` se fora do horário |
| | | | 2. Geofence (raio 200m) | Bloqueia com `OutOfRangeError` se fora do local |
| `PreJustifyAbsenceUseCase` | Pai | `childId, date, note` | Data deve ser **futura** | Cria registro com `pre_justified`; push para monitor |
| `JustifyAbsenceUseCase` | Pai | `childId, attendanceId, note` | Status deve ser `absent` | Muda para `justified` |
| `GetAttendanceHistoryUseCase` | Pai | `childId, month?` | — | Retorna calendário com cores por status |

### Repositório

```typescript
interface IAttendanceRepository {
  findById(id: AttendanceId): Promise<AttendanceRecord | null>
  findByChildAndDate(childId: ChildId, date: string): Promise<AttendanceRecord | null>
  findByChildAndMonth(childId: ChildId, year: number, month: number): Promise<AttendanceRecord[]>
  findByClassAndDate(classId: ClassId, date: string): Promise<AttendanceRecord[]>
  save(record: AttendanceRecord): Promise<void>
}
```

---

## 4. Activity

### Aggregates, Entities e Value Objects

| Tipo | Nome | Campos / Regras |
|------|------|-----------------|
| **Aggregate Root** | `Class` (Turma) | `id`, `name`, `description?`, `ageRange?`, `weeklySchedule` |
| **Aggregate Root** | `Schedule` | `id`, `classId`, `title`, `description?`, `scheduledAt`, `category`, `recurrence` |
| **Entity** | `ActivityPhoto` | `id`, `scheduleId`, `url`, `uploadedBy`, `uploadedAt` |
| **Value Object** | `ClassName` | String não vazia |
| **Value Object** | `WeeklySchedule` | `{ days: DayOfWeek[], startTime: "HH:MM", endTime: "HH:MM" }` |
| **Value Object** | `ScheduleDate` | Data/hora tipada |
| **Value Object** | `ActivityCategory` | `'Esporte' \| 'Arte' \| 'Música' \| 'Brincadeira Livre' \| 'Passeio' \| 'Outros'` |
| **Value Object** | `Recurrence` | `'none' \| 'weekly'` |
| **Value Object** | `PhotoUrl` | URL no Supabase Storage |
| **Value Object** | `ClassId` | UUID tipado |

### Métodos do Aggregate `Class`

```typescript
class Class {
  // Verifica se agora é um dia/horário válido pela grade da turma
  isCallAllowedNow(): boolean
  // → Consulta weeklySchedule.includesNow()
  // → Usado pelo TakeAttendanceUseCase como barreira
}

class WeeklySchedule {
  days: DayOfWeek[]       // 'MON' | 'TUE' | ... | 'SUN'
  startTime: string       // "14:00"
  endTime: string         // "17:00"

  includesNow(): boolean  // dia da semana atual ∈ days AND hora atual ∈ [start, end]
}
```

### Relação Monitor ↔ Turma

```sql
monitor_activities(monitor_id, class_id, is_primary BOOLEAN)
-- N:M com flag — um monitor pode cobrir múltiplas turmas
-- is_primary = true → turma principal
-- is_primary = false → cobertura temporária
```

### Domain Events

| Evento | Payload | Quem recebe (via push) |
|--------|---------|------------------------|
| `ActivityScheduled` | `{ scheduleId, classId, title }` | — |
| `PhotoPublished` | `{ photoId, classId, uploadedBy }` | Pais da turma |
| `MonitorAssigned` | `{ monitorId, classId, isPrimary }` | — |

### Use Cases

| Use Case | Ator | Entrada | Regras |
|----------|------|---------|--------|
| `CreateScheduleUseCase` | Monitor | `classId, title, category, scheduledAt, recurrence` | Monitor deve estar vinculado à turma |
| `GetClassScheduleUseCase` | Monitor/Pai | `classId, dateRange?` | Filtra por turma |
| `PublishPhotoUseCase` | Monitor | `scheduleId, photoFile` | Upload para Storage; push para pais da turma |
| `RequestClassAccessUseCase` | Monitor | `monitorId, classId, reason?` | Cria `class_access_requests` com `pending` |
| `ApproveClassRequestUseCase` | Admin | `adminId, requestId` | Insere `monitor_activities` com `is_primary: false` |

### Repositórios

```typescript
interface IClassRepository {
  findById(id: ClassId): Promise<Class | null>
  findAll(): Promise<Class[]>
  findByMonitorId(monitorId: UserId): Promise<Class[]>
  save(cls: Class): Promise<void>
}

interface IScheduleRepository {
  findByClassId(classId: ClassId): Promise<Schedule[]>
  findByClassAndDate(classId: ClassId, date: string): Promise<Schedule[]>
  save(schedule: Schedule): Promise<void>
  delete(id: ScheduleId): Promise<void>
}
```

---

## 5. Communication

### Aggregates, Entities e Value Objects

| Tipo | Nome | Campos / Regras |
|------|------|-----------------|
| **Aggregate Root** | `Announcement` | `id`, `authorId`, `content`, `audience`, `publishedAt`, `channel` |
| **Value Object** | `AnnouncementContent` | String max 500 chars |
| **Value Object** | `Audience` | `{ type: 'class' \| 'all', classId?: ClassId }` |
| **Value Object** | `NotificationChannel` | `'push'` |

### Domain Events

| Evento | Payload | Quem recebe |
|--------|---------|-------------|
| `AnnouncementPublished` | `{ announcementId, audience, authorId }` | Pais da turma ou todos |
| `NotificationSent` | `{ recipientId, announcementId }` | — (log interno) |

### Use Cases

| Use Case | Ator | Entrada | Regras |
|----------|------|---------|--------|
| `PublishAnnouncementUseCase` | Monitor ou Admin | `authorId, content, audience` | Monitor → `audience.type = 'class'`; Admin → `'class' \| 'all'` |
| `GetAnnouncementsUseCase` | Pai | `guardianId` | Retorna comunicados da(s) turma(s) dos filhos + gerais |

### Repositório

```typescript
interface IAnnouncementRepository {
  findByClassId(classId: ClassId): Promise<Announcement[]>
  findGeneral(): Promise<Announcement[]>
  save(announcement: Announcement): Promise<void>
}
```

---

## Fluxo entre Contextos (Context Map)

### Padrões de Integração

```
Identity & Access  ──(Shared Kernel: UserId)──▶  TODOS os contextos
                                                   UserId é a mesma estrutura,
                                                   sem duplicação

Enrollment  ──(Customer/Supplier)──▶  Attendance
                                       ChildId referenciado em AttendanceRecord
                                       ClassId para filtrar chamada

Enrollment  ──(Customer/Supplier)──▶  Activity
                                       ChildId ↔ ClassId para associação

Activity    ──(Published Language)──▶  Communication
                                       PhotoPublished → push para pais

Attendance  ──(Published Language)──▶  Communication
                                       AttendanceMarked → push para pai
                                       AbsencePreJustified → push para monitor
```

### Diagrama de Dependência

```
              ┌─────────────────────┐
              │  Identity & Access  │
              │    (Shared Kernel)  │
              └──────────┬──────────┘
                         │ UserId
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
   ┌─────────────┐ ┌──────────┐ ┌──────────────┐
   │ Enrollment  │ │ Activity │ │Communication │
   └──────┬──────┘ └────┬─────┘ └──────▲───────┘
          │              │              │
          │  ChildId     │              │ Published Language
          │  ClassId     │              │ (Domain Events)
          ▼              │              │
   ┌─────────────┐      │       ┌──────┴───────┐
   │ Attendance  │──────────────▶│  Push/Notif  │
   └─────────────┘              └──────────────┘
```

### Fluxo Completo: Chamada de Presença (exemplo cross-context)

```
1. Monitor abre Tela 11 (Chamada)
   │
2. Activity: Class.isCallAllowedNow()
   ├── Fora do horário → AttendanceOutsideScheduleError → BLOQUEADO
   └── OK → continua
   │
3. Infrastructure: ExpoLocationService.getCurrentPosition()
   ├── Fora do raio (>200m) → OutOfRangeError → BLOQUEADO
   └── OK → GeolocationProof criado
   │
4. Enrollment: buscar filhos da turma (Children by ClassId)
   │  + verificar imageConsent de cada Guardian (badge na UI)
   │  + verificar pré-justificativas existentes (Attendance)
   │
5. Monitor marca cada criança: present / absent
   │
6. Attendance: TakeAttendanceUseCase
   │  → Cria AttendanceRecord para cada criança
   │  → Emite AttendanceMarked para cada registro
   │
7. Communication: ExpoPushService.send()
   │  → Push para pai de cada criança: "Presença registrada"
   │
8. FIM
```

### Fluxo Completo: Justificativa Offline (exemplo cross-context + offline)

```
1. Pai abre Tela 6 (Histórico de Presenças) — OFFLINE
   │
2. Pai toca em data passada com status 'absent'
   │
3. Attendance: JustifyAbsenceUseCase tenta executar
   ├── SEM CONEXÃO → OfflineActionQueue.enqueue('justify_retroactive', payload)
   │                  → SQLite: pending_actions, status='pending', expires_at=now+7d
   └── Pai vê confirmação local: "Justificativa será enviada quando conectar"
   │
4. [Conexão restaura em 2 dias]
   │
5. OfflineSyncService.sync()
   ├── PURGE: nenhuma expirada (2 < 7 dias)
   ├── FETCH: atualiza cache
   ├── REPLAY: verifica servidor
   │   ├── Servidor tem 'absent' → SEM CONFLITO → aplica → status='synced'
   │   └── Servidor tem 'present' → CONFLITO → status='discarded'
   └── NOTIFY: alerta se houve descartes
```

---

## Tabela Consolidada de Use Cases

| # | Use Case | Contexto | Ator | Push? |
|---|----------|----------|------|-------|
| 1 | `SignUpUseCase` | Identity | Pai | — |
| 2 | `SignInUseCase` | Identity | Todos | — |
| 3 | `AdminResetMonitorPasswordUseCase` | Identity | Admin | — |
| 4 | `EnrollChildUseCase` | Enrollment | Admin | — |
| 5 | `LinkGuardianUseCase` | Enrollment | Admin | — |
| 6 | `UnlinkGuardianUseCase` | Enrollment | Admin | — |
| 7 | `TakeAttendanceUseCase` | Attendance | Monitor | ✅ → Pai |
| 8 | `PreJustifyAbsenceUseCase` | Attendance | Pai | ✅ → Monitor |
| 9 | `JustifyAbsenceUseCase` | Attendance | Pai | — |
| 10 | `GetAttendanceHistoryUseCase` | Attendance | Pai | — |
| 11 | `CreateScheduleUseCase` | Activity | Monitor | — |
| 12 | `GetClassScheduleUseCase` | Activity | Monitor/Pai | — |
| 13 | `PublishPhotoUseCase` | Activity | Monitor | ✅ → Pais da turma |
| 14 | `RequestClassAccessUseCase` | Activity | Monitor | — |
| 15 | `ApproveClassRequestUseCase` | Activity | Admin | — |
| 16 | `PublishAnnouncementUseCase` | Communication | Monitor/Admin | ✅ → Pais |
| 17 | `GetAnnouncementsUseCase` | Communication | Pai | — |

**Total: 17 use cases | 5 com push notification**
