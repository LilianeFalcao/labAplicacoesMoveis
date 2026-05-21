## Context

O aplicativo Bambolê é um app React Native (Expo + TypeScript) com arquitetura Clean Architecture + DDD. Os monitores utilizam o app diariamente para realizar chamadas de presença e gerenciar a agenda das turmas.

**Estado atual dos problemas identificados:**

1. **Crypto Polyfill Incompleto**: `crypto-polyfill.ts` injeta o polyfill apenas em `global` (Node-style). No Hermes (motor padrão do React Native em produção), o objeto global exposto pode ser `globalThis` ou `window`, não necessariamente `global`. Isso causa o crash `"Property 'crypto' doesn't exist"` na inicialização do cliente Supabase, que usa `crypto.randomUUID()` internamente.

2. **Validação de Horário Rígida**: `WeeklySchedule.includesNow()` não possui tolerância temporal — um monitor que inicia a chamada 1 minuto após o fim da aula ou antes do início recebe `"Attendance outside schedule"`. O `TakeAttendanceUseCase` aplica tolerância de 30 minutos apenas quando um `activityId` específico é passado (caminho com atividade selecionada), mas no caminho geral (`else`) delega para `cls.isCallAllowedNow(date)` que chama `includesNow()` sem nenhuma tolerância.

3. **Ausência de Atalho FAB para Atividades**: O SpeedDial da `MonitorHomeScreen` contém 4 ações (Incidente, Foto, Comunicado, Solicitar Turma), mas não oferece criação rápida de atividade. O monitor precisa navegar até `ClassDashboard > GroupAgendaScreen` para criar uma atividade — fluxo longo e não intuitivo.

4. **Footer da Tela de Chamada**: O estilo atual do `footer` em `AttendanceScreen.tsx` (linhas 647–658) usa `paddingTop: 12`, `paddingBottom: 12`, fundo branco sólido e `borderTopWidth: 1`. É funcional mas visualmente plano, sem o caráter premium e flutuante que o restante do app possui.

---

## Goals / Non-Goals

**Goals:**
- Garantir que `crypto.getRandomValues` e `crypto.randomUUID` estejam disponíveis em `globalThis`, `global` e `window` antes de qualquer importação de Supabase.
- Introduzir buffer de tolerância de **60 minutos** (antes e depois) na validação geral de chamada (`WeeklySchedule.includesNow`), parametrizável para facilitar testes.
- Adicionar ação "Nova Atividade" no SpeedDial da `MonitorHomeScreen` que abre um `BottomSheet` modal para criação rápida de atividade com persistência offline-first (SQLite + `sync_queue`).
- Redesenhar o `footer` da `AttendanceScreen` como um card flutuante elevado (glassmorphism leve, `borderRadius: 24`, `elevation` e `shadow` mais expressivos, `marginHorizontal` para distanciamento das bordas).

**Non-Goals:**
- Não alterar o fluxo de consentimento de imagem LGPD.
- Não criar nova tabela no banco de dados — a `class_activities` já existe e já possui pipeline de sincronização no `OfflineSyncService`.
- Não modificar o backend Supabase (sem Edge Functions, sem Webhooks).
- Não alterar o raio geográfico de 200m para chamadas.
- Não reimplementar o `SpeedDial` — apenas adicionar uma nova `SpeedDialAction`.
- Não criar testes E2E Maestro nesta iteração (somente testes Jest/RNTL).

---

## Decisions

### D1 — Polyfill Multi-Escopo (globalThis + global + window)

**Decisão**: Ao invés de injetar apenas em `global`, o polyfill injetará em todos os três objetos globais possíveis em sequência (verificando existência com `typeof`).

```typescript
// Antes
if (typeof global === 'object') {
    const globalAny = global as any;
    if (!globalAny.crypto) { ... }
}

// Depois
const targets: any[] = [];
if (typeof globalThis !== 'undefined') targets.push(globalThis);
if (typeof global !== 'undefined') targets.push(global);
if (typeof window !== 'undefined') targets.push(window);

for (const target of targets) {
    if (!target.crypto) target.crypto = {};
    if (!target.crypto.getRandomValues) target.crypto.getRandomValues = polyfillFn;
    if (!target.crypto.randomUUID)      target.crypto.randomUUID = uuidFn;
}
```

**Alternativa considerada**: Usar `expo-crypto` como dependência. Rejeitado pois introduz uma dependência nativa extra desnecessária para algo resolvível em pure JavaScript.

**Regra de DDD**: Este arquivo vive em `infrastructure/utils/` — correto, não viola o domain puro.

---

### D2 — Tolerância no `WeeklySchedule.includesNow(toleranceMinutes)`

**Decisão**: Adicionar parâmetro `toleranceMinutes: number = 60` ao método `includesNow()`. O `Class.isCallAllowedNow()` propaga o parâmetro. O `TakeAttendanceUseCase` passa `60` explicitamente no caminho geral, tornando a tolerância explícita e rastreável.

```typescript
// WeeklySchedule
includesNow(now: Date = new Date(), toleranceMinutes: number = 60): boolean {
    // ...
    return currentTotal >= (startTotal - toleranceMinutes) 
        && currentTotal <= (endTotal + toleranceMinutes);
}

// Class
isCallAllowedNow(now: Date = new Date(), toleranceMinutes: number = 60): boolean {
    return this.weeklySchedule.includesNow(now, toleranceMinutes);
}

// TakeAttendanceUseCase — caminho geral (sem activityId)
if (!cls.isCallAllowedNow(date, 60)) {
    throw new Error('Attendance outside schedule');
}
```

**Alternativa considerada**: Adicionar flag de ambiente `DISABLE_SCHEDULE_VALIDATION` em `config.ts`. Rejeitado pois mascara o problema em vez de resolvê-lo de forma elegante. O buffer de 60 min é a solução correta para a realidade operacional do centro.

**Impacto nos testes**: Os testes existentes em `Activity.test.ts` que chamam `isCallAllowedNow()` sem argumentos precisarão ser revisados — eles continuarão passando pois a tolerância padrão foi zero antes e agora é 60 min (o que torna testes de `false` potencialmente inválidos). Os testes relevantes precisarão passar `toleranceMinutes: 0` explicitamente para manter comportamento determinístico.

---

### D3 — Atalho FAB "Nova Atividade" com Offline-First

**Decisão**: Criar um novo componente `QuickAddActivityModal` (BottomSheet-style) que:
1. Exibe formulário com campos: `title` (obrigatório), `description`, `startTime`, `endTime`, `category` (enum: `activity | meal | break`).
2. Pré-seleciona a primeira turma do monitor como `classId` padrão, com possibilidade de troca via `Picker`/`chips`.
3. Ao confirmar, insere diretamente no SQLite via `SqliteStorageService` (`class_activities`) com `synced = 0`.
4. Enfileira uma ação `ADD_ACTIVITY` na `sync_queue`.
5. Recarrega `todayAgenda` via `MockAgendaRepository.getInstance().findByClass()` para atualização reativa da tela.

**Mapeamento de coluna SQLite → payload Supabase** (já existente):
```
id, class_id, title, description, start_time, end_time, status, category
```

**Alternativa considerada**: Navegar direto para `GroupAgendaScreen` e abrir o formulário existente. Rejeitado pois não proporciona a experiência de atalho rápido sem contexto de navegação.

**Regra de DDD**: O `QuickAddActivityModal` pertence à camada `presentation/components/monitor/`. Ele não importa de `domain/` diretamente — acessa SQLite via `SqliteStorageService` (infra) conforme o padrão já estabelecido pelo `MonitorHomeScreen`.

---

### D4 — Footer Flutuante Premium no AttendanceScreen

**Decisão**: Refatorar o estilo `footer` para um card flutuante com `position: 'absolute'`, `bottom`, `left`, `right` com `marginHorizontal: 16` e `borderRadius: 24`. Adicionar `backdropFilter`-like via `backgroundColor` com leve opacidade (ex: `rgba(255,255,255,0.95)`) e `elevation: 12`/`shadow` expressivo.

```typescript
footer: {
    position: 'absolute',
    bottom: insets.bottom + 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 12,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    borderWidth: 1,
    borderColor: Theme.colors.gray[100],
},
```

O `FlatList` precisará de `contentContainerStyle` com `paddingBottom` adequado para não esconder o último item atrás do card flutuante.

**Alternativa considerada**: Manter `position: 'relative'` e apenas aumentar o `borderRadius`. Rejeitado pois não confere o efeito visual premium desejado de card sobreposição flutuante.

---

## Risks / Trade-offs

| Risco | Mitigação |
|:---|:---|
| **Testes quebram com nova tolerância padrão** | Atualizar testes que testam `isCallAllowedNow()` com `false` para passar `toleranceMinutes: 0` explicitamente |
| **Footer absoluto sobrepõe último item da lista** | Ajustar `paddingBottom` do `contentContainerStyle` do `FlatList` para `insets.bottom + 120` |
| **SQLite pode não estar inicializado ao abrir FAB** | O `SqliteStorageService.getInstance()` é singleton inicializado no mount do `MonitorHomeScreen` — FAB só é acessível após mount |
| **Atividade criada offline não aparece no Supabase** | O pipeline `OfflineSyncService.syncUp()` já suporta `ADD_ACTIVITY` — sem risco novo |
| **`globalThis` undefined em ambiente muito antigo** | O guard `typeof globalThis !== 'undefined'` previne crash |
| **Monitor sem turmas no momento do FAB** | Validar `monitorClasses.length > 0` antes de abrir o modal; exibir `Alert` orientando a solicitar acesso |

---

## Migration Plan

1. Nenhuma migração de banco de dados necessária — a tabela `class_activities` já existe com o schema correto.
2. Nenhuma mudança de API Supabase.
3. Deploy é direto: as alterações são client-side only.
4. Rollback: reverter os 4 arquivos modificados para suas versões anteriores.

---

## Open Questions

- **Q1**: Deve a tolerância de 60 minutos ser configurável via `config.ts` (tornando-a ajustável sem code change)? Por ora adotamos valor hardcoded no parâmetro default — pode ser externalizado numa iteração futura.
- **Q2**: O `QuickAddActivityModal` deve permitir selecionar múltiplas turmas para a mesma atividade? Por ora: apenas uma turma (a primeira do monitor, com opção de troca). Multi-turma pode ser adicionado futuramente.
- **Q3**: Após criar atividade offline, deve o `TurmaAgendaCard` exibir um indicador visual de "aguardando sync"? Por ora: o status `synced = 0` existe mas não é exibido na UI — pode ser adicionado como ícone de nuvem num próximo ciclo.
