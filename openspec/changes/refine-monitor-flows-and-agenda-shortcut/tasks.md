## 1. Domain — WeeklySchedule e Class com Tolerância Temporal

- [x] 1.1 Atualizar `WeeklySchedule.includesNow(now, toleranceMinutes)` em `src/domain/activity/entities/Class.ts` para aceitar parâmetro `toleranceMinutes: number = 60` e aplicar buffer antes do startTotal e após o endTotal. (0.5h)
- [x] 1.2 Atualizar `Class.isCallAllowedNow(now, toleranceMinutes)` em `src/domain/activity/entities/Class.ts` para propagar o parâmetro `toleranceMinutes` na chamada a `weeklySchedule.includesNow()`. (0.25h)
- [x] 1.3 Atualizar os testes existentes em `src/domain/activity/__tests__/Activity.test.ts` que testam `isCallAllowedNow() === false` para passar `toleranceMinutes: 0` explicitamente, mantendo comportamento determinístico. (0.5h)
- [x] 1.4 Adicionar novos testes de tolerância: `isCallAllowedNow(date, 60)` retorna `true` quando horário está dentro da janela de 60 min, e `isCallAllowedNow(date, 0)` retorna `false` fora do horário exato. (1h)

## 2. Application — TakeAttendanceUseCase com Tolerância Explícita

- [x] 2.1 Atualizar `TakeAttendanceUseCase.ts` no caminho `else` (chamada geral sem `activityId`) para chamar `cls.isCallAllowedNow(date, 60)` com tolerância explícita de 60 minutos ao invés de `cls.isCallAllowedNow(date)`. (0.25h)
- [x] 2.2 Revisar e atualizar os testes de `TakeAttendanceUseCase.test.ts` que mockam `isCallAllowedNow` para retornar `false` — garantir que o comportamento de bloqueio ainda seja testado corretamente com tolerância. (0.5h)

## 3. Infrastructure — Crypto Polyfill Multi-Escopo

- [x] 3.1 Refatorar `src/infrastructure/utils/crypto-polyfill.ts` para coletar todos os targets globais disponíveis (`globalThis`, `global`, `window`) usando guards `typeof X !== 'undefined'`, e iterar sobre eles injetando `getRandomValues` e `randomUUID` onde não existirem. (0.5h)
- [x] 3.2 Verificar que o arquivo `src/presentation/index.ts` importa o polyfill como primeira linha (já está correto — confirmar apenas). (0.1h)

## 4. Presentation — Footer Flutuante Premium no AttendanceScreen

- [x] 4.1 Modificar o estilo `footer` em `AttendanceScreen.tsx` (linhas ~647–658) para usar `position: 'absolute'`, `bottom: insets.bottom + 16`, `left: 16`, `right: 16`, `borderRadius: 24`, `elevation: 12`, `shadowColor: Theme.colors.primary`, sombra premium e `backgroundColor: 'rgba(255,255,255,0.97)'`. (0.5h)
- [x] 4.2 Ajustar o `contentContainerStyle` do `FlatList` de alunos em `AttendanceScreen.tsx` para adicionar `paddingBottom: insets.bottom + 130` garantindo que o último aluno da lista não fique oculto sob o card flutuante. (0.25h)
- [x] 4.3 Garantir que o `insets` do `useSafeAreaInsets()` seja passado ao componente ou acessado diretamente nas styles (já importado — confirmar uso). (0.1h)

## 5. Presentation — Componente QuickAddActivityModal

- [x] 5.1 Criar `src/presentation/components/monitor/QuickAddActivityModal.tsx` com estrutura BottomSheet-style: `Modal` com `animationType="slide"`, `View` com `borderTopLeftRadius: 28`, `borderTopRightRadius: 28`, posicionado na parte inferior da tela. (1.5h)
- [x] 5.2 Implementar formulário interno com campos: `TextInput` para título (obrigatório), `TextInput` para descrição (opcional), dois campos de texto de horário no formato `HH:MM` para início e término, e chips de seleção de categoria (`activity` / `meal` / `break`). (1.5h)
- [x] 5.3 Implementar seletor de turma: mostrar `chips` horizontais com as turmas do monitor (`monitorClasses`), com pré-seleção da primeira turma. (0.75h)
- [x] 5.4 Implementar validação de formulário: título obrigatório, horário de término posterior ao de início, exibindo erros inline sob cada campo inválido. (0.5h)
- [x] 5.5 Implementar `handleCreate()`: gerar UUID com `crypto.randomUUID()`, inserir registro em `class_activities` via `SqliteStorageService.run()` com `synced = 0`, enfileirar `ADD_ACTIVITY` na `sync_queue`, chamar callback `onCreated()` para recarregar a agenda, fechar modal. (1.5h)
- [x] 5.6 Implementar feedback de sucesso/erro com loading state no botão de confirmação durante a operação SQLite. (0.25h)

## 6. Presentation — Integração do FAB e Modal na MonitorHomeScreen

- [x] 6.1 Adicionar novo estado `isQuickActivityModalVisible: boolean` em `MonitorHomeScreen.tsx`. (0.1h)
- [x] 6.2 Adicionar nova `SpeedDialAction` ao array `speedDialActions`: `{ icon: 'calendar-plus', label: 'Nova Atividade', onPress: () => { if (monitorClasses.length === 0) { Alert.alert(...) } else { setIsQuickActivityModalVisible(true) } }, color: '#059669' }`. (0.25h)
- [x] 6.3 Importar e renderizar `<QuickAddActivityModal>` em `MonitorHomeScreen.tsx`, passando `visible`, `onClose`, `monitorClasses`, e `onCreated={() => loadDynamicData()}`. (0.5h)

## 7. Testes do QuickAddActivityModal

- [x] 7.1 Criar `src/presentation/components/monitor/__tests__/QuickAddActivityModal.test.tsx` com RNTL: testar renderização do modal, validação de campos obrigatórios, exibição de erro quando título está vazio, exibição de erro quando término é anterior ao início. (1.5h)
- [x] 7.2 Testar cenário de sucesso de criação: mock de `SqliteStorageService`, verificar que `run()` é chamado com payload correto e que o callback `onCreated` é invocado. (1h)
- [x] 7.3 Testar comportamento offline: verificar que a atividade é criada localmente mesmo sem conexão e que o feedback de "salvo localmente" é exibido. (0.5h)

---

## Priorização

🔴 **Core (bloqueante — executar primeiro):**
- Tasks 1.1 → 1.2 → 2.1 (corrige o erro "Attendance outside schedule")
- Task 3.1 (corrige o crash de crypto no Hermes)

🟡 **Importante (alta prioridade de experiência):**
- Tasks 5.1 → 5.2 → 5.3 → 5.4 → 5.5 → 5.6 → 6.1 → 6.2 → 6.3 (novo atalho FAB)
- Tasks 4.1 → 4.2 (footer premium)

🟠 **Bônus (completude e qualidade):**
- Tasks 1.3 → 1.4 (testes de tolerância no domínio)
- Tasks 2.2 (testes de use case atualizados)
- Tasks 7.1 → 7.2 → 7.3 (testes do novo modal)


---

## Priorização

🔴 **Core (bloqueante — executar primeiro):**
- Tasks 1.1 → 1.2 → 2.1 (corrige o erro "Attendance outside schedule")
- Task 3.1 (corrige o crash de crypto no Hermes)

🟡 **Importante (alta prioridade de experiência):**
- Tasks 5.1 → 5.2 → 5.3 → 5.4 → 5.5 → 5.6 → 6.1 → 6.2 → 6.3 (novo atalho FAB)
- Tasks 4.1 → 4.2 (footer premium)

🟠 **Bônus (completude e qualidade):**
- Tasks 1.3 → 1.4 (testes de tolerância no domínio)
- Tasks 2.2 (testes de use case atualizados)
- Tasks 7.1 → 7.2 → 7.3 (testes do novo modal)
