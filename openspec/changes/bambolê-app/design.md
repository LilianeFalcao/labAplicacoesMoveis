# Design Técnico — App Bambolê

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
- **Value Objects**: `ClassName`, `ScheduleDate`, `PhotoUrl`, `ActivityCategory`, `Recurrence`
- **Domain Events**: `ActivityScheduled`, `PhotoPublished`, `MonitorAssigned`
- **Repositórios**: `IClassRepository`, `IScheduleRepository`
- Monitor tem autonomia total para criar/editar atividades da sua turma

```typescript
type ActivityCategory = 'Esporte' | 'Arte' | 'Música' | 'Brincadeira Livre' | 'Passeio' | 'Outros'
type Recurrence = 'none' | 'weekly'

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

**Integração cross-context via `EventBus`** (Supabase Realtime ou fila interna).

---

## Modelo de Dados (Supabase / Postgres)

```sql
-- Identity
users(id, email, role, created_at)

-- Enrollment
children(id, name, photo_url, class_id, created_at)
guardians(id, user_id)
guardian_children(guardian_id, child_id)  -- N:M

-- Attendance
attendance_records(id, child_id, class_id, monitor_id, date,
                   status, lat, lng, justification_note, justified_at)
-- status: 'present' | 'absent' | 'pre_justified' | 'justified'

-- Activity
classes(id, name, monitor_id)  -- monitor principal via monitor_activities
monitor_activities(monitor_id, class_id, is_primary)  -- N:M com flag
schedules(id, class_id, title, description, scheduled_at)
activity_photos(id, schedule_id, url, uploaded_by, uploaded_at)

-- Communication
announcements(id, author_id, content, audience_type, class_id, published_at)
-- audience_type: 'class' | 'all'
-- class_id: null quando audience_type = 'all'
```

---

## Comportamento Offline

| Perfil | Offline |
|--------|---------|
| **Pai** | Leitura via SQLite cache — presença, fotos, avisos sincronizados |
| **Monitor** | Requer conexão (geolocalização obrigatória na chamada) |
| **Admin** | Requer conexão |

Ações de escrita do pai offline (ex: justificar falta) ficam em fila e sincronizam ao reconectar.

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

## Gatilhos de Push Notification

| Evento | Destinatário |
|--------|-------------|
| Chamada marcada (presente/ausente) | Pai do filho |
| Foto publicada pelo monitor | Pais da turma |
| Aviso do monitor publicado | Pais da turma |
| Comunicado geral do admin | Todos os pais |
| Pré-justificativa registrada pelo pai | Monitor da turma |

> O gerenciamento de notificações é feito **apenas pelo SO** — o app não oferece toggle.

---

## Inventário de Telas (19 total)

### Auth (3)
1. Login
2. Cadastro (pai)
3. Recuperação de senha

### Visão do Pai (6)
4. Home / Meus Filhos
5. Detalhe do Filho
6. **Histórico de Presenças** ← justificar falta proativa e retroativa
7. Feed de Fotos
8. Avisos / Notificações
9. Perfil

### Visão do Monitor (5)
10. Home da Turma
11. **Chamada / Presença** ← vê pré-justificativas, 4 status
12. Captura de Foto
13. **Observações** ← notas internas + histórico de avisos para pais
14. **Agenda da Turma** ← monitor cria e edita atividades

### Visão Admin (5)
15. Gestão de Crianças (inclui foto opcional + avatar de iniciais como fallback)
16. Gestão de Monitores
17. Vinculação Pai ↔ Filho (busca por e-mail)
18. **Gestão de Turmas** ← inclui visão simples de % presença por turma
19. **Comunicados Gerais** ← push para todos os pais

---

## Fluxos Críticos

### Chamada de Presença
```
Monitor abre tela de chamada
  → Lista filhos da turma (com pré-justificativas já sinalizadas)
  → Para cada filho: marcar present | absent | justified
  → Valida geolocalização antes de confirmar
  → Emite AttendanceMarked → push para o pai
```

### Justificativa de Falta (Pai)
```
Pai acessa Histórico de Presenças (calendário)
  → Toca em data futura → PreJustifyAbsenceUseCase → status: pre_justified
  → Toca em data passada com status absent → JustifyAbsenceUseCase → status: justified
  → Monitor vê pré-justificativa sinalizada na lista de chamada
```

### Publicação de Aviso (Monitor)
```
Monitor acessa tela Observações
  → Cria novo aviso (texto, max 500 chars)
  → Audience: 'class' (apenas pais da sua turma)
  → PublishAnnouncementUseCase → AnnouncementPublished → NotificationSent
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
│   ├── sqlite/        SQLiteParentCache.ts
│   ├── camera/        ExpoCameraService.ts
│   ├── location/      ExpoLocationService.ts
│   └── events/        EventBus.ts
└── presentation/
    ├── navigation/
    ├── screens/       { auth, parent, monitor, admin }
    └── components/
```
