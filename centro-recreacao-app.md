# App — Centro de Recreação Infanto-Juvenil
> Compilado da sessão de exploração — 06/03/2026
> Atualizado com decisões de brainstorming — 10/03/2026
> Revisão de lacunas — 10/03/2026

---

## 🛠️ Stack Técnico

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

## 👥 Perfis / Roles

| Role | Descrição |
|------|-----------|
| `parent` | Pai/Responsável — auto-cadastro pelo app |
| `monitor` | Monitor do centro — cadastrado pelo admin |

### Recuperação de Senha
- **Pai**: fluxo padrão via Tela 3 (magic link por e-mail do Supabase)
- **Monitor**: duas vias — (1) magic link por e-mail, se o monitor tiver acesso ao e-mail cadastrado; (2) **Admin redefine manualmente** pela Tela 16 caso o monitor não consiga acessar o e-mail
| `admin` | Administração — gerencia todo o sistema |

---

## 🔗 Vinculação Pai ↔ Filho

- Pai se **auto-cadastra** pelo app (e-mail + senha)
- No ato da matrícula, o **admin cadastra a criança** e busca o pai pelo e-mail para fazer a vinculação
- Relação **muitos-para-muitos** — um pai pode ter N filhos; um filho pode ter pai e mãe vinculados
- **Fallback**: admin também pode desfazer ou reatribuir vínculos a qualquer momento

---

## 🧑‍🏫 Regra dos Monitores

- Cada monitor é atribuído a **uma turma por padrão** (relação 1:1 no fluxo normal)
- Modelagem no banco como **N:M com flag `is_primary`** para suportar cobertura de ausências sem migração futura
- O monitor pode **acumular múltiplas turmas** (principal + coberturas temporárias)
- No app, a Home do monitor é uma **lista das turmas atribuídas**; ele toca em uma para entrar na visão daquela turma
- O monitor tem **autonomia total** para criar e editar atividades das suas turmas na agenda

### Monitor sem Turma
- Se o admin ainda não atribuiu nenhuma turma, o monitor entra em **Modo Visualização**: telas de Chamada e Agenda ficam desabilitadas com aviso "Nenhuma turma vinculada"

### Solicitação de Turma (Substituição)
- O monitor pode **solicitar acesso** a uma turma adicional (ex: cobrir ausência de outro monitor)
- O Admin recebe a solicitação e **aprova ou rejeita** pela Tela 16
- Ao aprovar, a nova turma é **adicionada** à lista do monitor (acumula, não substitui)
- O Admin pode **desvincular** turmas a qualquer momento

```sql
monitor_classes
  monitor_id, class_id, is_primary (bool)
```


### Regras de Turmas e Grade Horária
- **Grade Fixa**: Cada turma possui dias da semana e horários de início/fim definidos (ex: Seg/Qua/Sex, 14h-17h).
- **Bloqueio de Chamada**: O monitor só pode iniciar a chamada nos dias e horários previstos na grade da turma.
- **Sessões Extras**: Para aulas de reposição ou eventos fora da grade, o admin deve editar temporariamente a grade da turma.
- **Campos Adicionais**: Além do nome, turmas possuem Descrição/Modalidade e Faixa Etária sugerida.
- **Capacidade**: A capacidade de alunos é controlada administrativamente pelo admin, sem bloqueio automático pelo sistema.


---

## 📍 Câmera e Geolocalização

| Recurso | Quem usa | Para quê |
|---------|----------|----------|
| 📷 Câmera | Monitor | Fotografar atividades → feed do pai |
| 📍 Câmera (admin) | Admin | Foto de perfil da criança no cadastro |
| 📍 Geolocalização | Monitor | Validar que a chamada foi feita no local físico do centro |

> ⚠️ A chamada de presença **requer conexão** (geolocalização obrigatória). O monitor não opera offline.

### Validação de Geolocalização

- **Raio de tolerância**: 200m
- **Coordenadas do centro**: hardcoded em `src/infrastructure/location/config.ts`
- Se o monitor estiver fora do raio: exibe alerta bloqueante — chamada não pode ser iniciada
- Se GPS impreciso (indoor): tolerância absorvida pelo raio de 200m

---

## 🚪 Fluxo de Saída

Não há registro de saída no app. A responsabilidade do centro encerra no **horário de término da turma**. Essa é a mesma abordagem adotada por escolas e centros educacionais.

---

## 📋 Status de Presença

A chamada de presença tem **três estados possíveis**:

| Status | Quando | Quem define |
|--------|--------|-------------|
| `present` | Criança compareceu | Monitor (chamada) |
| `pre_justified` | Pai avisou falta antes do dia | Pai (app) |
| `absent` | Não compareceu sem aviso | Monitor (chamada) |
| `justified` | Falta justificada retroativamente | Pai (app) |

### Justificativa de Falta pelo Pai

- O pai justifica faltas pela tela de **Histórico de Presenças** (tela 6)
- **Proativo**: toca em data futura e avisa a falta com antecedência → status `pre_justified`
- **Retroativo**: toca em data passada com `absent` e justifica → status `justified`
- O monitor vê a pré-justificativa antes mesmo de fazer a chamada

**Cores sugeridas no calendário:**
- 🟢 Verde — Presente
- 🔴 Vermelho — Ausente (sem justificativa)
- 🟡 Amarelo — Pré-justificada (pai avisou antes)
- 🔵 Azul — Justificada (retroativa)

---

## 📢 Fluxo de Avisos e Comunicados

| Quem | Canal | Alcance |
|------|-------|---------|
| Monitor | Tela "Observações" — com push notification | Pais da sua turma |
| Admin | Tela "Comunicados Gerais" — com push notification | Todos os pais |

- A tela de "Observações" do monitor serve como **histórico de avisos enviados** + registro de notas
- O admin usa uma tela dedicada para comunicados gerais do centro (ex: feriados, cancelamentos)

## 🔔 Gatilhos de Push Notification

| Evento | Gatilho (Tabela) | Destinatário | Notificação |
|--------|------------------|--------------|-------------|
| Chamada marcada | `attendances` (INSERT) | Pai do filho | Push: Presença/Falta registrada |
| Foto publicada | `activity_media` (INSERT) | Pais da turma | Push: Nova foto da atividade |
| Aviso de monitor | `announcements` (INSERT) | Pais da turma | Push: Novo aviso da turma |
| Comunicado geral | `announcements` (INSERT) | Todos os pais | Push: Comunicado do centro |
| Pré-justificativa | `attendances` (UPDATE) | Monitor da turma | Push: Falta comunicada pelo pai |

> ⚙️ **Estratégia Técnica**: A integração entre contextos é feita via **Supabase Database Webhooks**. Quando um registro é inserido ou alterado no banco, o Supabase dispara uma **Edge Function** que resolve os destinatários e envia o Push via Expo Notifications.

---

## 🖼️ Foto de Perfil das Crianças

- Campo **opcional** — o admin pode ou não cadastrar foto da criança
- Quando não há foto: exibir **avatar com iniciais** do nome
- Util para o monitor identificar crianças na tela de chamada

---

## 🔒 Privacidade e LGPD — Fotos de Atividades

| Regra | Descrição |
|-------|-----------|
| **Acesso** | Fotos visíveis **somente para pais da turma** (policy baseada em `class_id` no Supabase Storage) |
| **Retenção** | Fotos são mantidas **enquanto a criança estiver matriculada**. Ao sair do centro, as fotos associadas são removidas |
| **Consentimento** | No primeiro acesso ao app, o pai visualiza um **Termo de Consentimento de Imagem** que precisa aceitar para acessar o feed de fotos |
| **Sem consentimento** | Feed de fotos **bloqueado** para o pai. O monitor recebe um **aviso visual** na tela de chamada sinalizando crianças sem consentimento de imagem, para evitá-las nas fotos quando possível |

> ⚠️ O campo `image_consent` é armazenado no perfil do `Guardian` (pai) e consultado tanto pelo feed de fotos quanto pela tela de chamada do monitor.

---

## 📶 Comportamento Offline

| Perfil | Comportamento offline |
|--------|-----------------------|
| **Pai** | Cache de leitura (SQLite) — visualiza dados da última sincronização |
| **Monitor** | Requer conexão — geolocalização e chamada dependem de rede |
| **Admin** | Requer conexão |

**O que é cacheado para o pai:**
- Histórico de presenças dos filhos
- Feed de fotos de atividades
- Avisos e comunicados recebidos
- Dados básicos do perfil dos filhos

**Ações de escrita offline (pai):** ficam pendentes e sincronizam quando a conexão retornar (ex: justificativa de falta registrada sem conexão).

### Regras de Sincronização Offline
- **Resolução de conflito**: Servidor sempre ganha. Se o estado no Supabase já mudou (ex: monitor marcou `present`), a ação offline do pai é descartada com alerta: “A presença já foi registrada pelo monitor.”
- **Expiração**: Ações pendentes expiram em **7 dias**. Após esse período, são descartadas automaticamente.
- **Feedback**: Sincronização silenciosa em background. O pai só recebe alerta se alguma ação foi **descartada** (por conflito ou expiração).

---

## 🗄️ Modelo de Dados Principal

```
users ──────────── monitor_activities ─── classes
  │ (pai/monitor)        (N:M/is_primary)   │  ├── name, description, age_range
  │                                         │  └── schedule (JSONB/WeeklySchedule)
  │                                         │
  └─────────────── parent_children ───── children
                    (N:M)           │  ├── photo_url (opcional)
                                    │  ├── class_id (FK classes)
                                    ├── attendances
                                    │     (status: present|pre_justified|absent|justified,
                                    │      lat, lng, monitor_id, date, justification_note)
                                    └── observations
                                          (individual | geral | aviso_para_pais)

classes ───────── activity_media (fotos → Supabase Storage)

notifications → enviadas via Supabase Edge Functions (gatilhos de banco)
announcements → comunicados do admin (geral) e do monitor (turma)
```

---

## 🏛️ Arquitetura — Clean Architecture + Domain-Driven Design

### Camadas da Clean Architecture

```
presentation/      ← Telas, componentes, navegação (React Native)
application/       ← Use Cases / Application Services
domain/            ← Bounded Contexts, Entidades, VOs, Domain Events (núcleo puro)
infrastructure/    ← Supabase, SQLite, Câmera, Geoloc, Push
```

> A regra de dependência é absoluta: camadas externas dependem de internas. O `domain/` não conhece Supabase, React Native, nem SQLite.

---

### 🗺️ Bounded Contexts

O domínio é dividido em **5 contextos delimitados**, cada um com seu próprio modelo, linguagem e fronteiras:

```
┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐
│   Identity & Access  │   │     Enrollment       │   │     Attendance       │
│  ────────────────    │   │  ────────────────    │   │  ────────────────    │
│  Aggregate: User     │   │  Aggregate: Child    │   │  Aggregate:          │
│  Entities: –         │   │  Aggregate: Guardian │   │   AttendanceRecord   │
│  VOs: Email, Role    │   │  VOs: ChildName,     │   │  VOs: Status,        │
│  Events:             │   │       PhotoUrl       │   │    GeolocationProof, │
│   UserRegistered     │   │  Events:             │   │    JustifNote        │
│   RoleAssigned       │   │   ChildEnrolled,     │   │  Events:             │
│                      │   │   GuardianLinked     │   │   AttendanceMarked,  │
│                      │   │                      │   │   AbsenceJustified,  │
│                      │   │                      │   │   AbsencePreJustified│
└──────────────────────┘   └──────────────────────┘   └──────────────────────┘

┌──────────────────────┐   ┌──────────────────────┐
│      Activity        │   │   Communication      │
│  ────────────────    │   │  ────────────────    │
│  Aggregates:         │   │  Aggregate:          │
│   Class (Turma)      │   │   Announcement       │
│   Schedule           │   │  VOs: Content,       │
│  VOs: ClassName,     │   │       Audience,      │
│   ScheduleDate,      │   │       Channel        │
│   PhotoUrl           │   │  Events:             │
│  Events:             │   │   AnnouncementPubl., │
│   ActivityScheduled, │   │   NotificationSent   │
│   PhotoPublished,    │   │                      │
│   MonitorAssigned    │   │                      │
└──────────────────────┘   └──────────────────────┘
```

---

### 📖 Ubiquitous Language (Glossário por Contexto)

#### Identity & Access
| Termo | Significado no domínio |
|-------|----------------------|
| `User` | Qualquer pessoa autenticada no sistema |
| `Role` | Papel do usuário: `parent`, `monitor`, `admin` |
| `Credentials` | E-mail + senha usados para autenticação |

#### Enrollment
| Termo | Significado no domínio |
|-------|----------------------|
| `Child` | Criança ou adolescente matriculado no centro |
| `Guardian` | Responsável legal vinculado a uma ou mais crianças |
| `GuardianLink` | Vínculo formal entre Guardian e Child (N:M) |
| `Enroll` | Ato do admin de cadastrar uma criança no sistema |

#### Attendance
| Termo | Significado no domínio |
|-------|----------------------|
| `AttendanceRecord` | Registro diário de presença de uma criança |
| `AttendanceStatus` | Estado: `present`, `absent`, `pre_justified`, `justified` |
| `GeolocationProof` | Coordenadas lat/lng validando que a chamada foi feita no local |
| `AbsenceJustification` | Justificativa submetida pelo responsável (antes ou depois) |
| `PreJustify` | Ato do pai de avisar uma falta com antecedência |

#### Activity
| Termo | Significado no domínio |
|-------|----------------------|
| `Class` (Turma) | Grupo fixo de crianças com um monitor responsável |
| `Schedule` | Atividade planejada com data/hora dentro de uma turma |
| `ActivityPhoto` | Foto de uma atividade publicada pelo monitor no feed |
| `Monitor` | Profissional responsável por uma turma |

#### Communication
| Termo | Significado no domínio |
|-------|----------------------|
| `Announcement` | Comunicado publicado por monitor (turma) ou admin (geral) |
| `Audience` | Escopo do comunicado: `class` ou `all` |
| `Notification` | Push notification derivada de um Domain Event |

---

### 🔗 Context Map

Relacionamento entre os contextos:

```
Identity & Access  ──(Shared Kernel: UserId)──▶  todos os contextos

Enrollment         ──(Customer/Supplier)──▶  Attendance
                         (ChildId referenciado em AttendanceRecord)

Enrollment         ──(Customer/Supplier)──▶  Activity
                         (ChildId ↔ ClassId para chamada)

Activity           ──(Published Language)──▶  Communication
                         (PhotoPublished → AnnouncementPublished)

Attendance         ──(Published Language)──▶  Communication
                         (AttendanceMarked → NotificationSent para o pai)
```

**Padrões de integração entre contextos:**
- `Shared Kernel`: `UserId` é compartilhado — mesma estrutura, sem duplicação
- `Customer/Supplier`: Enrollment fornece identidade de Child para Attendance e Activity
- `Published Language`: Domain Events cruzam contextos via barramento de eventos (ex: Supabase Realtime ou fila interna)

---

### 📦 Aggregates, Entities e Value Objects por Contexto

#### Context: Attendance

```typescript
// Aggregate Root
class AttendanceRecord {
  id: AttendanceId           // VO
  childId: ChildId           // referência externa (Enrollment context)
  classId: ClassId           // referência externa (Activity context)
  monitorId: UserId          // referência externa (Identity context)
  date: AttendanceDate       // VO
  status: AttendanceStatus   // VO (enum: present | absent | pre_justified | justified)
  geolocation: GeolocationProof | null  // VO
  justification: AbsenceJustification | null  // Entity

  markPresent(proof: GeolocationProof): void
  markAbsent(): void
  preJustify(note: JustificationNote): void
  justifyRetroactively(note: JustificationNote): void
}

// Value Objects
type AttendanceStatus = 'present' | 'absent' | 'pre_justified' | 'justified'
class GeolocationProof { lat: number; lng: number; recordedAt: Date }
class JustificationNote { value: string }  // max 500 chars

// Domain Events
class AttendanceMarked { childId, classId, status, date }
class AbsencePreJustified { childId, classId, date, note }
class AbsenceJustified { childId, attendanceRecordId, note }
```

#### Context: Enrollment

```typescript
// Aggregate Root: Child
class Child {
  id: ChildId
  name: ChildName            // VO
  photoUrl: PhotoUrl | null  // VO (opcional)
  classId: ClassId           // referência a Activity context
  guardians: GuardianLink[]  // lista de vínculos (N:M)

  addGuardian(guardianId: GuardianId): void
  removeGuardian(guardianId: GuardianId): void
}

// Aggregate Root: Guardian
class Guardian {
  id: GuardianId
  userId: UserId             // referência a Identity context
  children: GuardianLink[]

  linkChild(childId: ChildId): void
}

// Domain Events
class ChildEnrolled { childId, classId }
class GuardianLinked { guardianId, childId }
```

#### Context: Communication

```typescript
// Aggregate Root
class Announcement {
  id: AnnouncementId
  authorId: UserId
  content: AnnouncementContent   // VO (max 500 chars)
  audience: Audience             // VO: { type: 'class' | 'all', classId?: ClassId }
  publishedAt: Date
  channel: NotificationChannel   // VO: 'push'

  publish(): void
}

// Domain Events
class AnnouncementPublished { announcementId, audience, authorId }
class NotificationSent { recipientId, announcementId }
```

---

### 📁 Estrutura de Pastas (DDD + Clean Architecture)

```
src/
├── domain/
│   ├── identity/
│   │   ├── entities/        User.ts
│   │   ├── value-objects/   Email.ts, Role.ts
│   │   ├── events/          UserRegistered.ts
│   │   └── repositories/    IUserRepository.ts
│   │
│   ├── enrollment/
│   │   ├── entities/        Child.ts, Guardian.ts, GuardianLink.ts
│   │   ├── value-objects/   ChildName.ts, PhotoUrl.ts, ChildId.ts
│   │   ├── events/          ChildEnrolled.ts, GuardianLinked.ts
│   │   └── repositories/    IChildRepository.ts, IGuardianRepository.ts
│   │
│   ├── attendance/
│   │   ├── entities/        AttendanceRecord.ts, AbsenceJustification.ts
│   │   ├── value-objects/   AttendanceStatus.ts, GeolocationProof.ts, JustificationNote.ts
│   │   ├── events/          AttendanceMarked.ts, AbsenceJustified.ts, AbsencePreJustified.ts
│   │   └── repositories/    IAttendanceRepository.ts
│   │
│   ├── activity/
│   │   ├── entities/        Class.ts, Schedule.ts, ActivityPhoto.ts
│   │   ├── value-objects/   ClassName.ts, ScheduleDate.ts, PhotoUrl.ts
│   │   ├── events/          ActivityScheduled.ts, PhotoPublished.ts, MonitorAssigned.ts
│   │   └── repositories/    IClassRepository.ts, IScheduleRepository.ts
│   │
│   └── communication/
│       ├── entities/        Announcement.ts
│       ├── value-objects/   AnnouncementContent.ts, Audience.ts, NotificationChannel.ts
│       ├── events/          AnnouncementPublished.ts, NotificationSent.ts
│       └── repositories/    IAnnouncementRepository.ts
│
├── application/
│   ├── identity/
│   │   └── use-cases/       SignUpUseCase.ts, SignInUseCase.ts
│   ├── enrollment/
│   │   └── use-cases/       EnrollChildUseCase.ts, LinkGuardianUseCase.ts
│   ├── attendance/
│   │   └── use-cases/       TakeAttendanceUseCase.ts, PreJustifyAbsenceUseCase.ts,
│   │                        JustifyAbsenceUseCase.ts, GetAttendanceHistoryUseCase.ts
│   ├── activity/
│   │   └── use-cases/       CreateScheduleUseCase.ts, PublishPhotoUseCase.ts,
│   │                        GetClassScheduleUseCase.ts
│   └── communication/
│       └── use-cases/       PublishAnnouncementUseCase.ts, GetAnnouncementsUseCase.ts
│
├── infrastructure/
│   ├── supabase/
│   │   ├── identity/        SupabaseUserRepository.ts
│   │   ├── enrollment/      SupabaseChildRepository.ts, SupabaseGuardianRepository.ts
│   │   ├── attendance/      SupabaseAttendanceRepository.ts
│   │   ├── activity/        SupabaseClassRepository.ts, SupabaseScheduleRepository.ts
│   │   └── communication/   SupabaseAnnouncementRepository.ts
│   ├── sqlite/              SQLiteParentCache.ts (leitura offline — pais)
│   ├── camera/              ExpoCameraService.ts
│   ├── location/            ExpoLocationService.ts
│   └── events/              EventBus (Supabase Database Webhooks + Edge Functions)
│
└── presentation/
    ├── navigation/          ParentNavigator.ts, MonitorNavigator.ts, AdminNavigator.ts
    ├── screens/
    │   ├── auth/
    │   ├── parent/
    │   ├── monitor/
    │   └── admin/
    └── components/          AttendanceCard.tsx, ChildAvatar.tsx, AnnouncementCard.tsx
```

---

## 📱 Inventário de Telas (19 no total)

### 🔐 Auth — 3 telas
| # | Tela |
|---|------|
| 1 | Login |
| 2 | Cadastro (pai) |
| 3 | Recuperação de senha |

### 👨 Visão do Pai — 6 telas
| # | Tela | O que faz |
|---|------|-----------| 
| 4 | Home / Meus Filhos | Lista filhos vinculados + preview de 2 avisos recentes |
| 5 | Detalhe do Filho | Presença do dia, stats do mês, atividade de hoje (sem seção de fotos — descoberta via push) |
| 6 | Histórico de Presenças | Calendário de presenças + ação de justificar falta (proativa e retroativa) |
| 7 | Feed de Fotos | Fotos da turma, agrupadas por atividade/dia |
| 8 | Avisos / Notificações | Comunicados do centro e da turma |
| 9 | Perfil | Alterar nome, senha; foto de perfil opcional; push gerenciado pelo SO |

### 🧑‍🏫 Visão do Monitor — 6 telas
| # | Tela | O que faz |
|---|------|-----------| 
| 10 | Minhas Turmas (Home) | Lista as turmas atribuídas ao monitor; toca para entrar na visão da turma. Sem turmas: Modo Visualização com aviso + botão "Solicitar Turma" |
| 10b | Visão da Turma | Visão geral da turma selecionada do dia |
| 11 | Chamada / Presença | Lista alunos com avatares, marcar status (vê pré-justificativas do pai) |
| 12 | Captura de Foto | Câmera + upload da atividade |
| 13 | Observações | Notas gerais/individuais + avisos enviados aos pais (histórico + novo aviso) |
| 14 | Agenda da Turma | Ver, criar e editar atividades; suporte a recorrência semanal; categoria obrigatória |

### 🏢 Visão Admin — 5 telas
| # | Tela | O que faz |
|---|------|-----------| 
| 15 | Gestão de Crianças | Cadastrar (foto via câmera, opcional), listar com filtro por turma, editar |
| 16 | Gestão de Monitores | Cadastrar monitor (admin define senha), atribuir turma, **redefinir senha**, aprovar solicitações de turma |
| 17 | Vinculação Pai ↔ Filho | Buscar pai pelo e-mail, vincular / desvincular |
| 18 | Gestão de Turmas | Criar e editar turmas + visão simples de dados (% presença por turma) |
| 19 | Comunicados Gerais | Publicar comunicados para todos os pais via push notification |

---

## ⏱️ Cronograma — 60 horas

| Semanas | Foco | Horas |
|---------|------|-------|
| 1–2 | Setup, autenticação, navegação por roles | ~12h |
| 3–4 | Cadastros admin (filhos, turmas, vínculos) | ~10h |
| 5–6 | Chamada de presença + justificativa de faltas + agenda | ~10h |
| 7–8 | Câmera + geolocalização + feed de fotos | ~12h |
| 9–10 | Push Notifications **ou** Realtime (escolher um) | ~8h |
| 11 | Testes, polish, preparação da apresentação | ~8h |

### Priorização de Features

| Feature | Prioridade |
|---------|-----------|
| Auth + Roles | 🔴 Core |
| Vinculação admin | 🔴 Core |
| Chamada de presença (3 status) | 🔴 Core |
| Agenda de atividades (monitor gerencia) | 🔴 Core |
| Justificativa de falta pelo pai | 🟡 Importante |
| Fotos (câmera) | 🟡 Importante |
| Geolocalização | 🟡 Importante |
| Feed do pai | 🟡 Importante |
| Avisos do monitor / Comunicados gerais | 🟡 Importante |
| Cache offline (pais) | 🟡 Importante |
| Notificações push | 🟠 Bônus |
| Observações individuais | 🟠 Bônus |
| Realtime (presença ao vivo) | 🟠 Bônus |
| Foto de perfil da criança | 🟠 Bônus |

---

## 📋 Log de Decisões

| Data | Decisão | Alternativas consideradas | Motivo |
|------|---------|--------------------------|--------|
| 10/03 | Saída não registrada | Registrar saída individual | Escolas não fazem isso; a turma tem horário fixo de encerramento |
| 10/03 | Avisos do monitor via "Observações" | Tela dedicada | Mantém escopo em 19 telas; observações e avisos são naturalmente históricos |
| 10/03 | Monitor gerencia agenda autonomamente | Só admin gerencia | Monitor conhece melhor a rotina da sua turma |
| 10/03 | 3 status de presença (+ pré-justificada e justificada) | 2 status apenas | Pais comunicam faltas com antecedência; retroativo também necessário |
| 10/03 | Pai justifica falta em "Histórico de Presenças" | Tela "Detalhe do Filho" | Calendário é o lugar natural para interagir com dias específicos |
| 10/03 | Foto da criança opcional | Obrigatória ou inexistente | Equilíbrio entre utilidade e esforço no cadastro |
| 10/03 | Cache offline somente para pais (leitura) | Offline total ou sem cache | Monitor precisa de dados em tempo real; pais se beneficiam de leitura offline |
| 10/03 | Visão simples de dados dentro de "Gestão de Turmas" | Tela dedicada de relatórios | Não há necessidade de uma tela completa; dados simples bastam |
| 10/03 | Tela 9 (Perfil pai): nome + senha + foto opcional | Somente readonly | Pai precisa de autonomia para atualizar dados básicos |
| 10/03 | Push gerenciado pelo SO, sem toggle interno | Toggle in-app | Sem benefício real; reduz complexidade |
| 10/03 | Fotos descobertas via push, não seção na Tela 5 | Link "Fotos recentes" na Tela 5 | Evita quebra de fluxo e ambiguidade (filtrado por filho vs turma) |
| 10/03 | Recuperação de senha via e-mail (Supabase magic link) | Tela customizada | Supabase já provê o fluxo completo; zero esforço de implementação |
| 10/03 | Push: pré-justificativa do pai notifica monitor | Somente sinalização visual | Monitor precisa ser avisado antes da chamada, não apenas na abertura |
| 10/03 | Agenda com recorrência semanal | Sem recorrência / diária+semanal+mensal | Padrão do centro é semanal; YAGNI |
| 10/03 | Categorias de atividade pré-definidas | Livre ou configurável pelo admin | Reduz inconsistência de preenchimento; simples de manter |
| 10/03 | Categorias: Esporte, Arte, Música, Brincadeira Livre, Passeio, Outros | Outras listas | Cobre os casos de uso do centro sem excesso |
| 10/03 | Raio de geolocalização: 200m | 100m / 500m | Padrão recomendado — cobre imprecisão urbana e indoor |
| 10/03 | Coordenadas do centro hardcoded em config.ts | Configurável pelo admin | Endereço fixo; configuração pelo admin adicionaria risco sem benefício |
| 10/03 | Admin define senha do monitor no cadastro | Convite por e-mail | Mais simples; admin tem controle direto do acesso |
| 13/03 | Turmas com grade horária fixa | Horários apenas informativos | Permite automação e segurança no controle de presença |
| 13/03 | Bloqueio de chamada fora da grade | Acesso livre ao monitor | Garante conformidade com o horário de funcionamento |
| 13/03 | Turmas com Modalidade e Faixa Etária | Apenas nome da turma | Melhora organização administrativa e clareza para o pai |
| 13/03 | EventBus via Database Webhooks | Realtime WebSockets / Fila Interna | Simplicidade e robustez usando infraestrutura Supabase |
| 13/03 | Notificação de presença p/ todos status | Notificar apenas faltas | Mantém o pai informado de forma proativa sobre o check-in |
| 13/03 | Monitor sem turma: Modo Visualização | Bloqueio total / auto-atribuição | Monitor vê o app mas não opera sem turma; evita frustração |
| 13/03 | Solicitação de turma com aprovação do Admin | Somente via Admin / Livre | Equilíbrio entre agilidade e controle; Admin mantém autoridade |
| 13/03 | Monitor acumula múltiplas turmas | Troca (1 por vez) | Cobertura de ausências sem perder turma principal |
| 13/03 | Home do monitor: lista de turmas | Direto para turma principal | Suporta múltiplas turmas naturalmente; monitor escolhe qual operar |
| 13/03 | Sync offline: servidor sempre ganha | Pai ganha / decisão inteligente | Evita sobrescrever dados reais do monitor; segurança e consistência |
| 13/03 | Ações offline expiram em 7 dias | Sem expiração / 48h | Margem confortável sem acumular dados obsoletos |
| 13/03 | Feedback de sync silencioso | Toast / Tela de resumo | Menos intrusivo; alerta só quando algo foi descartado |
| 13/03 | Fotos visíveis somente p/ pais da turma | Todos os pais / Pais + Admin | Mais restritivo; alinhado com LGPD e segurança |
| 13/03 | Retenção de fotos vinculada à matrícula | 1 ano / Indefinida | Limpeza automática ao sair; minimização de dados LGPD |
| 13/03 | Consentimento de imagem via app (pai) | No cadastro / Implícito | Transparência e controle ao responsável; exigido pela LGPD+ECA |
| 13/03 | Sem consentimento: feed bloqueado + monitor sinalizado | Só bloquear feed / Continuar normal | Monitor evita incluir criança sem consentimento nas fotos |
| 13/03 | Recuperação de senha monitor: duas vias | Somente admin / Somente e-mail | Cobre ambos os cenários: monitor com e sem acesso ao e-mail |

---

## 🚀 Próximo Passo

Usar `/opsx-propose` para gerar a proposta formal com design técnico, specs e tasks de implementação.
