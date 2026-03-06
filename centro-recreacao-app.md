# App — Centro de Recreação Infanto-Juvenil
> Compilado da sessão de exploração — 06/03/2026

---

## 🛠️ Stack Técnico

| Camada | Tecnologia |
|--------|-----------|
| Framework | Expo + React Native |
| Banco local | SQLite (cache offline) |
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
- No app, o monitor entra e vai **direto para a sua turma principal**

```sql
monitor_activities
  monitor_id, activity_id, is_primary (bool)
```

---

## 📍 Câmera e Geolocalização

| Recurso | Quem usa | Para quê |
|---------|----------|----------|
| 📷 Câmera | Monitor | Fotografar atividades → feed do pai |
| 📍 Geolocalização | Monitor | Validar que a chamada foi feita no local físico do centro |

---

## 🗄️ Modelo de Dados Principal

```
users ──────────── parent_children ──── children
  │ (pai/monitor)        (N:M)            │
  │                                       ├── attendances
  │                                       │     (status, lat, lng, monitor_id, date)
  │                                       └── observations
  │                                             (individual | geral)
  └── monitor_activities ──── activities
                                  └── activity_media
                                        (fotos → Supabase Storage)

notifications → enviadas ao pai (presença, foto, aviso)
```

---

## 🧅 Clean Architecture — Camadas

```
presentation/      ← Telas, componentes, navegação (React Native)
application/       ← Use Cases / Interactors
domain/            ← Entidades + Interfaces (contratos puros)
infrastructure/    ← Supabase, SQLite, Câmera, Geoloc
```

### Estrutura de Pastas

```
src/
├── domain/
│   ├── entities/          (Child, User, Activity, Attendance)
│   └── repositories/      (interfaces: IChildRepository, IAuthRepository...)
│
├── application/
│   └── use-cases/
│       ├── auth/          (SignUpUseCase, SignInUseCase)
│       ├── parent/        (GetChildrenUseCase, GetAttendanceHistoryUseCase)
│       └── monitor/       (TakeAttendanceUseCase, PublishActivityPhotoUseCase)
│
├── infrastructure/
│   ├── supabase/          (SupabaseAuthRepository, SupabaseChildRepository...)
│   ├── sqlite/            (SQLiteAttendanceCache)
│   ├── camera/            (ExpoCameraService)
│   └── location/          (ExpoLocationService)
│
└── presentation/
    ├── navigation/        (ParentNavigator, MonitorNavigator)
    ├── screens/
    │   ├── auth/
    │   ├── parent/
    │   └── monitor/
    └── components/        (AttendanceCard, ChildAvatar...)
```

---

## 📱 Inventário de Telas (18 no total)

### 🔐 Auth — 3 telas
| # | Tela |
|---|------|
| 1 | Login |
| 2 | Cadastro (pai) |
| 3 | Recuperação de senha |

### 👨 Visão do Pai — 6 telas
| # | Tela | O que faz |
|---|------|-----------|
| 4 | Home / Meus Filhos | Lista filhos vinculados |
| 5 | Detalhe do Filho | Agenda, presença, resumo |
| 6 | Histórico de Presenças | Calendário de presenças |
| 7 | Feed de Fotos | Fotos das atividades do dia |
| 8 | Avisos / Notificações | Comunicados do centro |
| 9 | Perfil | Dados do pai, configurações |

### 🧑‍🏫 Visão do Monitor — 5 telas
| # | Tela | O que faz |
|---|------|-----------|
| 10 | Home da Turma | Visão geral da turma do dia |
| 11 | Chamada / Presença | Lista de alunos, marcar status |
| 12 | Captura de Foto | Câmera + upload da atividade |
| 13 | Observações | Notas gerais ou individuais |
| 14 | Agenda da Turma | Ver atividades programadas |

### 🏢 Visão Admin — 4 telas
| # | Tela | O que faz |
|---|------|-----------|
| 15 | Gestão de Crianças | Cadastrar, listar, editar |
| 16 | Gestão de Monitores | Cadastrar, atribuir turma |
| 17 | Vinculação Pai ↔ Filho | Buscar pai pelo e-mail, vincular |
| 18 | Gestão de Turmas | Criar e editar atividades/turmas |

---

## ⏱️ Cronograma — 60 horas

| Semanas | Foco | Horas |
|---------|------|-------|
| 1–2 | Setup, autenticação, navegação por roles | ~12h |
| 3–4 | Cadastros admin (filhos, turmas, vínculos) | ~10h |
| 5–6 | Chamada de presença + agenda | ~10h |
| 7–8 | Câmera + geolocalização + feed de fotos | ~12h |
| 9–10 | Push Notifications **ou** Realtime (escolher um) | ~8h |
| 11 | Testes, polish, preparação da apresentação | ~8h |

### Priorização de Features

| Feature | Prioridade |
|---------|-----------|
| Auth + Roles | 🔴 Core |
| Vinculação admin | 🔴 Core |
| Chamada de presença | 🔴 Core |
| Agenda de atividades | 🔴 Core |
| Fotos (câmera) | 🟡 Importante |
| Geolocalização | 🟡 Importante |
| Feed do pai | 🟡 Importante |
| Notificações push | 🟠 Bônus |
| Observações individuais | 🟠 Bônus |
| Realtime (presença ao vivo) | 🟠 Bônus |

---

## 🚀 Próximo Passo

Usar `/opsx-propose` para gerar a proposta formal com design técnico, specs e tasks de implementação.
