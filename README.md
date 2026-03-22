<p align="center">
  <img src="https://img.shields.io/badge/Expo-React%20Native-blue?style=for-the-badge&logo=expo" />
  <img src="https://img.shields.io/badge/Backend-Supabase-3ECF8E?style=for-the-badge&logo=supabase" />
  <img src="https://img.shields.io/badge/Arquitetura-Clean%20%2B%20DDD-purple?style=for-the-badge" />
</p>

# Bambolê — Centro de Recreação Infanto-Juvenil

Aplicativo móvel oficial do **Centro de Recreação Bambolê**. Substitui a comunicação informal (WhatsApp, papel) por um canal digital centralizado entre o centro e as famílias, com controle de presença validado por geolocalização, feed de fotos de atividades e conformidade com LGPD.

---

## Problema

| # | Problema | Solução no App |
|---|----------|----------------|
| 1 | Pais não acompanham o dia a dia dos filhos | Home com status de presença, feed de fotos, avisos em tempo real |
| 2 | Chamadas de presença feitas em papel | Chamada digital com validação por geolocalização (raio 200m) e grade horária |
| 3 | Avisos se perdem em grupos de WhatsApp | Canal centralizado de comunicados com push notifications |

---

## Perfis de Usuário

| Perfil | Descrição | Funcionalidades Principais |
|--------|-----------|---------------------------|
| **Pai/Responsável** (`parent`) | Auto-cadastro pelo app | Ver presença, fotos, avisos; justificar faltas; aceitar consentimento LGPD |
| **Monitor** (`monitor`) | Cadastrado pelo admin | Fazer chamada (geoloc + horário), publicar fotos, enviar avisos da turma |
| **Admin** (`admin`) | Administrador do sistema | Cadastrar crianças/turmas/monitores, vincular pais, comunicados gerais |

---

## Stack Técnico

| Camada | Tecnologia |
|--------|-----------|
| Framework | **Expo + React Native** (TypeScript) |
| Banco local | **SQLite** — cache offline de leitura (perfil pai) |
| Backend / BD | **Supabase** (Postgres + Auth + Storage + Realtime) |
| Câmera | `expo-camera` |
| Geolocalização | `expo-location` |
| Notificações Push | **Expo Notifications** + FCM/APNs via Expo Push API |
| Ícones | `@expo/vector-icons` |
| Testes Unitários | **Jest** |
| Testes de Componentes | **React Native Testing Library** |
| Testes E2E | **Maestro** |

---

## Arquitetura

**Clean Architecture + Domain-Driven Design (DDD)**

```
presentation/   ← Telas, componentes, navegação (React Native)
application/    ← Use Cases / Application Services
domain/         ← Bounded Contexts, Entidades, VOs, Domain Events (núcleo puro)
infrastructure/ ← Supabase, SQLite, Câmera, Geoloc, Push
```

> **Regra de dependência absoluta**: camadas externas dependem de internas. O `domain/` é puro TypeScript — sem dependências de Supabase, React Native ou SQLite.

### Bounded Contexts (5)

```
┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐
│  Identity & Access   │   │     Enrollment       │   │     Attendance       │
│  User, Email, Role   │   │  Child, Guardian,    │   │  AttendanceRecord,   │
│                      │   │  GuardianLink (N:M), │   │  4 status, Geoloc,   │
│                      │   │  Consentimento LGPD  │   │  Justificativas      │
└──────────────────────┘   └──────────────────────┘   └──────────────────────┘

┌──────────────────────┐   ┌──────────────────────┐
│      Activity        │   │   Communication      │
│  Class, Schedule,    │   │  Announcement,       │
│  WeeklySchedule,     │   │  Audience,           │
│  Photos, Monitor     │   │  Push Notifications  │
└──────────────────────┘   └──────────────────────┘
```

### Context Map

```
Identity & Access  ──(Shared Kernel: UserId)──▶  todos os contextos
Enrollment         ──(Customer/Supplier)──▶  Attendance   (ChildId em AttendanceRecord)
Enrollment         ──(Customer/Supplier)──▶  Activity     (ChildId ↔ ClassId)
Activity           ──(Published Language)──▶  Communication  (PhotoPublished → Notif)
Attendance         ──(Published Language)──▶  Communication  (AttendanceMarked → Notif)
```

---

## Estrutura de Pastas

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
│   ├── supabase/      { repositórios por contexto }
│   ├── sqlite/        { SQLiteParentCache, OfflineSyncService, OfflineActionQueue }
│   ├── camera/        { ExpoCameraService }
│   ├── location/      { ExpoLocationService, config.ts }
│   └── notifications/ { ExpoPushService }
└── presentation/
    ├── navigation/    { ParentNavigator, MonitorNavigator, AdminNavigator }
    ├── screens/       { auth, parent, monitor, admin }
    └── components/    { AttendanceCard, ChildAvatar, AnnouncementCard }
```

---

## Regras de Negócio Críticas

### Chamada de Presença — Dupla Barreira
- **Grade horária**: chamada bloqueada fora dos dias/horários da turma (`WeeklySchedule.includesNow()`)
- **Geofence**: chamada bloqueada se o monitor estiver a mais de **200m** do centro (coordenadas hardcoded em `config.ts`)

### Status de Presença (4 estados)

| Status | Quando | Quem define |
|--------|--------|-------------|
| `present` | Criança compareceu | Monitor (chamada) |
| `absent` | Não compareceu sem aviso | Monitor (chamada) |
| `pre_justified` | Pai avisou falta antes do dia | Pai (app) |
| `justified` | Falta justificada retroativamente | Pai (app) |

### Monitor e Turmas
- Cada monitor tem uma **turma principal** (`is_primary: true`)
- Pode acumular **múltiplas turmas** (coberturas temporárias)
- **Sem turma** → Modo Visualização + botão "Solicitar Turma" (requer aprovação do admin)

### LGPD — Consentimento de Imagem
- Pai aceita **Termo de Consentimento de Imagem** no 1º acesso (obrigatório, não skipável)
- Sem consentimento: feed de fotos **bloqueado** + monitor recebe aviso visual na chamada
- Fotos visíveis **somente para pais da turma** (RLS por `class_id`)
- Retenção vinculada à matrícula — fotos removidas ao desmatricular criança

### Comportamento Offline (Pai)
- **Leitura**: cache SQLite (presenças, fotos, avisos, dados dos filhos)
- **Escrita**: ações enfileiradas com expiração de **7 dias**
- **Conflito**: servidor sempre ganha
- **Sync**: pipeline de 4 etapas (PURGE → FETCH → REPLAY → NOTIFY), silencioso com alerta apenas em descartes
- **Triggers**: abertura do app, reconexão (`NetInfo`), pull-to-refresh

---

## Telas (19 + 1 modal LGPD)

### Auth (3)
| # | Tela |
|---|------|
| 1 | Login |
| 2 | Cadastro (pai) |
| 3 | Recuperação de senha |

### Visão do Pai (6)
| # | Tela | Destaque |
|---|------|---------|
| 4 | Home / Meus Filhos | Lista filhos + preview de avisos |
| 5 | Detalhe do Filho | Stats do mês + atividade do dia |
| 6 | Histórico de Presenças | Calendário com cores + justificar faltas |
| 7 | Feed de Fotos | Grade por atividade/dia (bloqueado sem consentimento) |
| 8 | Avisos / Notificações | Comunicados da turma + gerais |
| 9 | Perfil | Nome, senha, foto, revogar consentimento |

### Visão do Monitor (6)
| # | Tela | Destaque |
|---|------|---------|
| 10 | Minhas Turmas (Home) | Lista turmas; Modo Visualização se sem turma |
| 10b | Visão da Turma | Resumo do dia |
| 11 | Chamada / Presença | Bloqueada fora do horário; badge sem consentimento |
| 12 | Captura de Foto | Câmera + upload |
| 13 | Observações | Notas internas + avisos para pais |
| 14 | Agenda da Turma | CRUD com recorrência semanal |

### Visão Admin (5)
| # | Tela | Destaque |
|---|------|---------|
| 15 | Gestão de Crianças | Cadastro com foto opcional |
| 16 | Gestão de Monitores | Aprovar solicitações + redefinir senha |
| 17 | Vinculação Pai ↔ Filho | Busca por e-mail |
| 18 | Gestão de Turmas | Grade horária + % presença |
| 19 | Comunicados Gerais | Push para todos os pais |

---

## Push Notifications

| Evento | Destinatário |
|--------|-------------|
| Chamada marcada | Pai do filho |
| Foto publicada | Pais da turma |
| Aviso do monitor | Pais da turma |
| Comunicado geral | Todos os pais |
| Pré-justificativa do pai | Monitor da turma |

> Push gerenciado somente pelo SO — sem toggle interno no app.

---

## Estratégia de Testes — TDD

O projeto segue **Test-Driven Development** com a pirâmide:

```
         /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
        /     Maestro (E2E)        \   ← fluxos críticos
       /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
      /   RNTL (Componentes/Telas)   \  ← UI isolada com mocks
     /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
    /    Jest (Unit + Integration)     \ ← domínio puro + use cases
   /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
```

| Camada | Ferramenta | Cobertura Mínima |
|--------|-----------|-----------------|
| `domain/` | Jest | 100% |
| `application/` | Jest | 90% |
| `infrastructure/` | Jest (integração) | 70% |
| `presentation/` | RNTL | 80% |
| Fluxos críticos | Maestro | 7 flows obrigatórios |

### Fluxos E2E Obrigatórios (Maestro)
1. Login por role (parent/monitor/admin)
2. Chamada de presença completa
3. Pré-justificativa e justificativa retroativa
4. Solicitação e aprovação de turma
5. Publicação de foto + feed do pai
6. Consentimento de imagem LGPD
7. Cadastro de criança (admin)

---

## Documentação do Projeto

| Documento | Descrição |
|-----------|-----------|
| [`centro-recreacao-app.md`](centro-recreacao-app.md) | Especificação base completa do produto |
| [`openspec/changes/bambolê-app/proposal.md`](openspec/changes/bambolê-app/proposal.md) | Proposta do projeto — problema, escopo, resultado esperado |
| [`openspec/changes/bambolê-app/design.md`](openspec/changes/bambolê-app/design.md) | Design técnico — arquitetura, domínio, banco, sync offline |
| [`openspec/changes/bambolê-app/design-telas.md`](openspec/changes/bambolê-app/design-telas.md) | Especificação de UI — wireframes, sistema visual, componentes |
| [`openspec/changes/bambolê-app/domain-reference.md`](openspec/changes/bambolê-app/domain-reference.md) | Referência de domínio — entidades, VOs, use cases, fluxos |
| [`openspec/changes/bambolê-app/tasks.md`](openspec/changes/bambolê-app/tasks.md) | Backlog de tarefas com estimativas e priorização |

---

## Design Visual

| Elemento | Valor |
|----------|-------|
| Primária | `#F97316` Laranja Bambolê |
| Secundária | `#3B82F6` Azul Confiança |
| Sucesso | `#22C55E` Verde Presente |
| Alerta | `#F59E0B` Amarelo Aviso |
| Erro | `#EF4444` Vermelho Ausente |
| Tipografia Display | **Nunito** ExtraBold |
| Tipografia Corpo | **Inter** Regular |
| Border radius | 16dp (cards), 12dp (botões) |
| Grid base | 8dp |

---

## Cronograma — ~80 horas | 11 semanas

| Semanas | Foco | Horas |
|---------|------|-------|
| 1–2 | Setup, autenticação, navegação por roles | ~12h |
| 3–4 | Cadastros admin (crianças, turmas, vínculos) | ~14h |
| 5–6 | Chamada de presença + justificativa + agenda | ~12h |
| 7 | Monitor: turmas e Modo Visualização | ~3.5h |
| 7–8 | Câmera + geolocalização + feed de fotos | ~10h |
| 9–10 | Push notifications + cache offline | ~11h |
| 11 | Testes, polish, preparação da apresentação | ~8h |

---

## Fora do Escopo (MVP)

- Registro de saída das crianças
- Pagamentos ou mensalidades
- Chat entre pais e monitores
- Múltiplos centros / multi-tenant
- Toggle de notificações dentro do app

---

## Licença

Linn Falcão - Projeto acadêmico — Laboratório de Aplicações Móveis.
