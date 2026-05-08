# Proposta de Design de Telas — App Bambolê

> Baseado na skill mobile-design e no documento `centro-recreacao-app.md`
> Data: 10/03/2026

---

## 🧠 Mobile Checkpoint

```
Platform:   iOS + Android (cross-platform via Expo)
Framework:  React Native + Expo

3 Princípios Aplicados:
1. Thumb-first — CTAs primários na zona de alcance inferior
2. Touch targets mínimos 44pt (iOS) / 48dp (Android) em todos os elementos táteis
3. Feedback explícito em toda ação assíncrona (loading, erro, sucesso)

Anti-Patterns Evitados:
1. ScrollView em listas longas → FlatList + React.memo + useCallback
2. Gesture-only actions → sempre botão visível como alternativa
```

---

## 📊 MFRI — Avaliação de Risco por Fluxo

| Fluxo | Platform Clarity | Accessibility | Interaction | Performance | Offline | MFRI | Status |
|-------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Auth (login/cadastro) | 5 | 4 | 2 | 1 | 1 | **5** | ✅ Moderado |
| Chamada de presença | 5 | 4 | 3 | 2 | 1 | **3** | ✅ Moderado |
| Feed de fotos | 5 | 3 | 2 | 4 | 2 | **0** | ⚠️ Risky — listas otimizadas obrigatórias |
| Histórico / Calendário | 5 | 4 | 3 | 2 | 2 | **2** | ⚠️ Risky — cache offline obrigatório |
| Câmera + upload | 5 | 3 | 4 | 4 | 1 | **-1** | 🔴 Perigoso — tratar erros de permissão e falha de upload |

> **Ação requerida para MFRI < 2**: simplificar fluxo, estados de erro explícitos, fallback offline claro.

---

## 🎨 Sistema Visual

### Identidade
- **Nome**: Bambolê
- **Conceito visual**: O arco circular do bambolê — movimento, energia, cor, diversão controlada
- **Tom**: Afetivo e confiável para os pais; prático e eficiente para o monitor

### Paleta de Cores

```
Primária  — Laranja Bambolê    #F97316   (energia, brincadeira, ação)
Secundária — Azul Confiança    #3B82F6   (informação, tranquilidade para pais)
Sucesso    — Verde Presente    #22C55E   (presença confirmada)
Alerta     — Amarelo Aviso     #F59E0B   (pré-justificativa, atenção)
Erro       — Vermelho Ausente  #EF4444   (falta não justificada)
Neutro bg  — Cinza Claro       #F9FAFB
Neutro txt — Grafite           #1F2937
```

> Cada cor tem papel semântico no app — não decorativo. As cores de status de presença são consistentes em todas as telas.

### Tipografia

| Uso | Família | Peso | Tamanho |
|-----|---------|------|---------|
| Display / Hero | **Nunito** | 800 ExtraBold | 28–32sp |
| Títulos de tela | **Nunito** | 700 Bold | 20–24sp |
| Subtítulos / Labels | **Nunito** | 600 SemiBold | 14–16sp |
| Corpo de texto | **Inter** | 400 Regular | 14–16sp |
| Legenda / Caption | **Inter** | 400 Regular | 12sp |

> Nunito tem cantos arredondados naturais — reflete o arco do bambolê. Inter garante legibilidade em corpo de texto.

### Espaçamento e Grid

```
Base unit: 8dp
Margens de tela: 16dp (lateral)
Padding interno de cards: 16dp
Espaço entre elementos: 8dp, 12dp, 16dp, 24dp
Border radius padrão (cards): 16dp
Border radius (botões): 12dp
Border radius (avatares): circular (50%)
```

### Componentes Base

| Componente | Especificação |
|-----------|--------------|
| **Botão primário** | Background laranja, texto branco, altura mínima 52dp, radius 12dp, font Nunito 600 |
| **Botão secundário** | Border azul, texto azul, transparente |
| **Card** | Fundo branco, shadow leve (0 2px 8px rgba(0,0,0,0.08)), radius 16dp |
| **Avatar criança** | Circular 48dp, foto ou iniciais (bg cor por letra) |
| **Badge de status** | Pill colorido 100% semântico (cores de presença) |
| **Bottom Sheet** | Preferido a modais — iOS nativo, Android dialog |
| **Tab Bar** | 3–4 itens, ícones + label, item ativo laranja |

---

## 🧭 Navegação

### Estrutura Geral

```
App
├── AuthStack (sem autenticação)
│   ├── LoginScreen
│   ├── SignUpScreen
│   └── ForgotPasswordScreen
│
├── ParentTabs (role: parent)
│   ├── 🏠 Início         → HomeScreen (lista de filhos)
│   ├── 📅 Presença       → AttendanceHistoryScreen (calendário)
│   ├── 📷 Fotos          → PhotoFeedScreen
│   └── 🔔 Avisos         → AnnouncementsScreen
│   [Detalhe do Filho e Perfil via Stack dentro das tabs]
│
├── MonitorStack (role: monitor) — sem tabs, navegação linear
│   ├── ClassHomeScreen   (tela principal)
│   ├── AttendanceScreen  (chamada)
│   ├── CameraScreen      (captura de foto)
│   ├── ObservationsScreen
│   └── ScheduleScreen    (agenda)
│
└── AdminStack (role: admin) — menu lateral ou tab simples
    ├── ChildrenScreen
    ├── MonitorsScreen
    ├── LinkGuardianScreen
    ├── ClassManagementScreen
    └── AnnouncementsScreen
```

> **Monitor não usa tabs** — fluxo linear com back navigation, menos carga cognitiva durante a chamada.

---

## 📱 Especificação de Telas

---

### 🔐 AUTH

#### Tela 1 — Login

```
╔══════════════════════════════╗
║  [Logo Bambolê circular]     ║
║                              ║
║  Bem-vindo de volta 👋       ║  ← Nunito 700 24sp
║  Entre para acompanhar seu   ║
║  filho no Bambolê            ║
║                              ║
║  ┌──────────────────────┐    ║
║  │ 📧 E-mail            │    ║  ← Input 52dp altura
║  └──────────────────────┘    ║
║  ┌──────────────────────┐    ║
║  │ 🔒 Senha        👁   │    ║
║  └──────────────────────┘    ║
║                              ║
║  [Esqueci minha senha]       ║  ← texto azul, 14sp
║                              ║
║  ██████████████████████████  ║  ← Botão primário ENTRAR
║                              ║
║  Novo? Cadastre-se aqui      ║
╚══════════════════════════════╝
```

**Regras de UX:**
- Teclado sobe e empurra botão (KeyboardAvoidingView)
- Botão desabilitado e exibe loading enquanto autentica
- Erro inline abaixo do campo (não toast)

---

#### Tela 2 — Cadastro (Pai)

Mesmo visual do login, com campos adicionais:
- Nome completo | E-mail | Senha | Confirmar senha
- Progresso de senha (fraca/média/forte) visível
- Botão "Criar conta" ativo somente com formulário válido

---

### 👨 VISÃO DO PAI

#### Tela 4 — Home / Meus Filhos

```
╔══════════════════════════════╗
║  Olá, Maria! 👋              ║  ← Nunito 700 22sp
║  Seg, 10 de março            ║  ← Inter 400 14sp cinza
║                              ║
║  Seus filhos                 ║
║  ┌────────────────────────┐  ║
║  │ [foto] João Silva       │  ║  ← Card filho
║  │        Turma Girassol  │  ║
║  │ 🟢 Presente hoje       │  ║  ← Badge status
║  └────────────────────────┘  ║
║  ┌────────────────────────┐  ║
║  │ [foto] Ana Silva       │  ║
║  │        Turma Borboleta │  ║
║  │ 🟡 Falta pré-avisada   │  ║
║  └────────────────────────┘  ║
║                              ║
║  ─────────── Avisos ─────────║
║  ⚪ Reunião dia 15/03        ║
║  ⚪ Passeio semana que…      ║
╚══════════════════════════════╝
[🏠 Início] [📅 Presença] [📷 Fotos] [🔔 Avisos]
```

**Regras de UX:**
- Toque no card do filho → Detalhe do Filho
- Status do dia exibido imediatamente (cache local)
- Avisos recentes listados no rodapé (max 2)

---

#### Tela 5 — Detalhe do Filho

```
╔══════════════════════════════╗
║ ← João Silva                 ║  ← Header com back
║                              ║
║    [avatar grande 80dp]      ║
║    João Silva                ║
║    Turma Girassol • 8 anos   ║
║                              ║
║  ┌───────┐ ┌───────┐         ║
║  │ 18    │ │  2    │         ║  ← Stats do mês
║  │Presen.│ │Faltas │         ║
║  └───────┘ └───────┘         ║
║                              ║
║  Atividade de hoje           ║
║  ┌────────────────────────┐  ║
║  │ 🎨 Pintura em tela     │  ║
║  │ 14h – 16h              │  ║
║  └────────────────────────┘  ║
║                              ║
║  Presença hoje: 🟢 Presente   ║
╚══════════════════════════════╝
```

**Regras de UX:**
- Sem seção "Fotos recentes" — descoberta de fotos ocorre via push notification
- Status de presença do dia exibido com badge colorido (semântico)
- Atividade de hoje: primeira do dia ou mensagem "Sem atividade hoje"

---

#### Tela 6 — Histórico de Presenças (⚠️ MFRI 2 — cuidado)

```
╔══════════════════════════════╗
║ ← Histórico de Presenças     ║
║                              ║
║   < Março 2026 >             ║
║                              ║
║  DOM SEG TER QUA QUI SEX SAB ║
║   1   2   3   4   5   6   7  ║
║   8  [🟢][🟢][🟢][🟡][🔴] 14║
║  15  16  17  18  19  20  21  ║
║  22  23  24  25  26  27  28  ║
║  29  30  31                  ║
║                              ║
║  ● Presente  ● Pré-justif.   ║
║  ● Ausente   ● Justificada   ║
║                              ║
║  [Toque em um dia para ver   ║
║   detalhes ou justificar]    ║
╚══════════════════════════════╝
```

**Bottom Sheet ao tocar no dia:**
- Dia futuro → botão "Avisar falta" (PreJustify)
- Dia passado com `absent` → botão "Justificar falta" + campo de texto

**Regras de UX:**
- Calendário renderizado com dados do cache SQLite (sem spinner na primeira abertura)
- Dias sem dados (fins de semana) em cinza claro
- Touch target de cada dia: mín. 44dp

---

#### Tela 7 — Feed de Fotos (⚠️ MFRI 0 — listas otimizadas)

```
╔══════════════════════════════╗
║ ← Fotos das Atividades       ║
║                              ║
║  📅 Hoje — Pintura em tela   ║
║  ┌──────────┐ ┌──────────┐   ║
║  │ [foto]   │ │ [foto]   │   ║  ← Grid 2 colunas
║  └──────────┘ └──────────┘   ║  FlatList numColumns=2
║  ┌──────────┐ ┌──────────┐   ║
║  │ [foto]   │ │ [foto]   │   ║
║  └──────────┘ └──────────┘   ║
║                              ║
║  📅 Ontem — Jogos ao ar livre║
║  ┌──────────┐ ┌──────────┐   ║
║  │ [foto]   │ │ [foto]   │   ║
║  └──────────┘ └──────────┘   ║
╚══════════════════════════════╝
```

**Regras de performance:**
- `FlatList` com `numColumns={2}`, `React.memo`, `getItemLayout`
- Imagens com `FastImage` ou `expo-image` para cache de rede
- Placeholder blur hash enquanto carrega

---

#### Tela 9 — Perfil (Pai) ← _anteriormente sem spec_

```
╔══════════════════════════════╗
║ ← Perfil                     ║
║                              ║
║    [avatar 72dp]             ║
║    [📷 Alterar foto]         ║  ← Opcional
║                              ║
║  ┌──────────────────────┐    ║
║  │ Nome completo        │    ║  ← Campo editável
║  └──────────────────────┘    ║
║  ┌──────────────────────┐    ║
║  │ E-mail (somente leit.)│   ║  ← Readonly
║  └──────────────────────┘    ║
║                              ║
║  [Alterar Senha]             ║  ← Abre bottom sheet
║                              ║
║  ████ Salvar Alterações ████ ║
╚══════════════════════════════╝
```

**Bottom Sheet "Alterar Senha":**
- Senha atual | Nova senha | Confirmar nova senha
- Validação via Supabase Auth

**Regras de UX:**
- E-mail não é editável (identidade de autenticação)
- Foto de perfil: câmera ou galeria (opcional)
- Gerenciamento de notificações push: somente pelo SO — sem opção no app

---

### 🧑‍🏫 VISÃO DO MONITOR

#### Tela 10 — Home da Turma

```
╔══════════════════════════════╗
║  Turma Girassol 🌻           ║  ← Nunito 700 24sp
║  Segunda, 10 de março        ║
║                              ║
║  📋 Chamada de hoje          ║
║  12 presentes / 15 total     ║  ← Progress bar laranja
║  █████████████░░░  80%       ║
║                              ║
║  ┌─────────────────────────┐ ║
║  │ 📍 Fazer Chamada    →   │ ║  ← CTA primário
║  └─────────────────────────┘ ║
║  ┌─────────────────────────┐ ║
║  │ 📷 Publicar Foto    →   │ ║  ← CTA secundário
║  └─────────────────────────┘ ║
║                              ║
║  Atividade de hoje           ║
║  🎨 Pintura em tela 14h–16h  ║
╚══════════════════════════════╝
```

---

#### Tela 11 — Chamada / Presença (crítica)

```
╔══════════════════════════════╗
║ ← Chamada • Seg, 10/03       ║
║  📍 Local verificado ✓       ║  ← Geoloc confirmada
║                              ║
║  [Buscar aluno...]           ║  ← Search bar
║                              ║
║  ┌────────────────────────┐  ║
║  │ [av] João Silva        │  ║
║  │      🟡 Pré-justif.    │  ║  ← Sinalização do pai
║  └────────────────────────┘  ║
║  ┌────────────────────────┐  ║
║  │ [av] Ana Souza         │  ║
║  │  [✓ Presente] [✗ Falta]│  ║  ← Ação inline
║  └────────────────────────┘  ║
║  ┌────────────────────────┐  ║
║  │ [av] Pedro Lima        │  ║
║  │  [✓ Presente] [✗ Falta]│  ║
║  └────────────────────────┘  ║
║                              ║
║  ██████ Confirmar Chamada ██ ║  ← Botão sticky no bottom
╚══════════════════════════════╝
```

**Regras críticas de UX:**
- Verificar geolocalização ANTES de exibir lista — se fora do raio, exibe alerta bloqueante
- Status `pre_justified` já exibido pro monitor (pai avisou antes)
- Botão "Confirmar" sticky no bottom, fora do scroll — sempre acessível
- Toque em linha abre bottom sheet de confirmação, não inline (evita acidente)
- Após confirmar → push automático para pais

---

#### Tela 12 — Captura de Foto (🔴 MFRI -1)

```
╔══════════════════════════════╗
║  [Viewfinder da câmera]      ║
║                              ║
║  Turma Girassol • Pintura    ║  ← overlay translúcido
║                              ║
║                              ║
║      ●  ←  Capturar          ║  ← botão central 72dp
║                              ║
║  [Galeria]     [Virar câm.]  ║
╚══════════════════════════════╝
```

**Regras (MFRI -1 → tratar todos os erros):**
- Permissão de câmera negada → tela explicativa com botão "Abrir Configurações"
- Upload falhou → toast com "Tentar novamente"
- Preview após captura com opções "Publicar" / "Descartar"
- Loading spinner overlay durante upload

---

#### Tela 13 — Observações

```
╔══════════════════════════════╗
║ ← Observações & Avisos       ║
║                              ║
║  [+ Novo aviso para os pais] ║  ← CTA destaque
║                              ║
║  Histórico                   ║
║  ┌────────────────────────┐  ║
║  │ 📢 Aviso • 08/03       │  ║
║  │ Amanhã traga roupa     │  ║
║  │ de banho 🏊            │  ║
║  └────────────────────────┘  ║
║  ┌────────────────────────┐  ║
║  │ 📝 Nota individual     │  ║
║  │ João ficou agitado…    │  ║
║  └────────────────────────┘  ║
╚══════════════════════════════╝
```

**Bottom Sheet "Novo aviso":**
- Campo de texto (max 500 chars, contador visível)
- Toggle: "Aviso para pais" (push) vs "Nota interna" (sem push)
- Botão "Publicar" → `PublishAnnouncementUseCase` → push para turma

---

### 🏢 VISÃO ADMIN

#### Tela 15 — Gestão de Crianças

```
╔══════════════════════════════╗
║  Crianças                    ║
║                              ║
║  Filtrar por turma ▼          ║  ← Dropdown
║  [Buscar por nome...]        ║
║                              ║
║  ┌────────────────────────┐  ║
║  │ [av] João Silva         │  ║
║  │      Turma Girassol    │  ║
║  └────────────────────────┘  ║
║  ┌────────────────────────┐  ║
║  │ [av] Ana Souza          │  ║
║  │      Turma Borboleta   │  ║
║  └────────────────────────┘  ║
║                              ║
║  [+ Cadastrar Criança]       ║
╚══════════════════════════════╝
```

**Bottom Sheet de Cadastro:**
- Nome da criança (obrigatório)
- Turma (dropdown, obrigatório)
- Foto via câmera (opcional — avatar de iniciais como fallback)
- Botão "Salvar"

---

#### Tela 16 — Gestão de Monitores

```
╔══════════════════════════════╗
║  Monitores                   ║
║                              ║
║  ┌────────────────────────┐  ║
║  │ Carlos Lima            │  ║
║  │ Turma Girassol 🌻      │  ║
║  └────────────────────────┘  ║
║  ┌────────────────────────┐  ║
║  │ Ana Melo               │  ║
║  │ Turma Borboleta 🦋     │  ║
║  └────────────────────────┘  ║
║                              ║
║  [+ Cadastrar Monitor]       ║
╚══════════════════════════════╝
```

**Bottom Sheet de Cadastro:**
- Nome completo (obrigatório)
- E-mail (obrigatório)
- Senha definida pelo admin (obrigatório, mín. 8 chars)
- Turma (dropdown)
- Botão "Salvar"

---

#### Tela 17 — Vinculação Pai ↔ Filho

```
╔══════════════════════════════╗
║  Vincular Pai ↔ Filho        ║
║                              ║
║  ┌────────────────────────┐  ║
║  │ 📧 Buscar pai por e-mail│  ║
║  └────────────────────────┘  ║
║                              ║
║  Resultado: Maria Silva      ║
║  ┌────────────────────────┐  ║
║  │ João Silva • Girassol  │  ║
║  │ [🔗 Vincular] [✕ Remov.]│  ║
║  └────────────────────────┘  ║
╚══════════════════════════════╝
```

**Regras de UX:**
- Busca em tempo real ao digitar e-mail
- Se pai não encontrado: mensagem "Pai não cadastrado" + instrução de auto-cadastro
- Botão "Vincular" confirmado por dialog

---

#### Tela 18 — Gestão de Turmas

```
╔══════════════════════════════╗
║  Gestão de Turmas            ║
║                              ║
║  ┌────────────────────────┐  ║
║  │ 🌻 Girassol            │  ║
║  │ Monitor: Carlos Lima   │  ║
║  │ 15 alunos              │  ║
║  │ Presença hoje: 80% 🟢  │  ║  ← visão simples de dados
║  └────────────────────────┘  ║
║  ┌────────────────────────┐  ║
║  │ 🦋 Borboleta           │  ║
║  │ Monitor: Ana Melo      │  ║
║  │ 12 alunos              │  ║
║  │ Presença hoje: 67% 🟡  │  ║
║  └────────────────────────┘  ║
║                              ║
║  [+ Nova Turma]              ║
╚══════════════════════════════╝
```

---

#### Tela 19 — Comunicados Gerais

```
╔══════════════════════════════╗
║  Comunicados Gerais          ║
║                              ║
║  ┌────────────────────────┐  ║
║  │ 📝 Novo comunicado     │  ║
║  │                        │  ║  ← TextArea
║  │                        │  ║
║  └────────────────────────┘  ║
║  0 / 500 caracteres          ║
║                              ║
║  Audiência: ● Todos os pais  ║
║                              ║
║  ████ Publicar e Notificar █ ║
║                              ║
║  ─── Histórico ─────────     ║
║  📢 10/03 — Reunião dia 15…  ║
║  📢 05/03 — Feriado na…      ║
╚══════════════════════════════╝
```

---

## ✅ Release Readiness — Checklist Mobile

- [ ] Touch targets ≥ 44pt em TODOS os elementos interativos
- [ ] Cache offline funcionando para pai (SQLite) — sem spinner na primeira abertura
- [ ] Tokens armazenados em SecureStore, nunca AsyncStorage
- [ ] FlatList + React.memo em todas as listas (filhos, alunos, fotos, avisos)
- [ ] Logs removidos do build de produção
- [ ] Estados de loading/erro/sucesso em TODAS as ações assíncronas
- [ ] Permissão de câmera e geolocalização com fluxo de fallback
- [ ] Testado em dispositivo low-end (Android ≤ 4GB RAM)
- [ ] Accessibility labels em ícones e botões sem texto
- [ ] MFRI ≥ 2 em todos os fluxos (tratado)

---

## 🚨 Riscos de Design a Mitigar na Implementação

| Risco | Tela | Mitigação |
|-------|------|-----------|
| Feed de fotos lento | Tela 7 | FlashList + expo-image + blur hash |
| Chamada acidental de presença | Tela 11 | Bottom sheet de confirmação por aluno |
| Upload de foto falha silenciosamente | Tela 12 | Toast de erro + retry visível |
| Calendário sem dados offline | Tela 6 | Mostrar dados do SQLite, indicar "última sync" |
| Geoloc negada trava o monitor | Tela 11 | Tela explicativa + botão de configurações |
