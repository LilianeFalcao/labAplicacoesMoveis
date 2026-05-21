## 1. Modificações de Domínio e Interfaces

- [x] 1.1 Adicionar assinatura do método na interface do repositório
  - **Detalhes de implementação**: Adicionar `findByMonitorId(monitorId: string): Promise<ClassAccessRequest[]>` ao arquivo `src/domain/activity/repositories/IAccessRequestRepository.ts`.
  - **Estimativa**: 0.5h

## 2. Modificações de Infraestrutura e Repositórios

- [x] 2.1 Implementar método no repositório Supabase
  - **Detalhes de implementação**: Adicionar o método `findByMonitorId(monitorId: string)` no arquivo `src/infrastructure/activity/repositories/SupabaseAccessRequestRepository.ts`. A query deve fazer o SELECT na tabela `class_access_requests` filtrando pela coluna `monitor_id` correspondente e ordenando pelo campo `created_at` de forma decrescente.
  - **Estimativa**: 1.5h

- [x] 2.2 Verificar conformidade do Mock do repositório
  - **Detalhes de implementação**: Confirmar que `MockAccessRequestRepository` já implementa corretamente o método `findByMonitorId` e se adapta sem erros de compilação à nova interface.
  - **Estimativa**: 0.5h

## 3. Integração na Camada de Apresentação (Telas)

- [x] 3.1 Migrar injeção de dependências em MonitorHomeScreen
  - **Detalhes de implementação**: Substituir `MockClassRepository.getInstance()`, `MockAccessRequestRepository.getInstance()` e `MockAttendanceRepository.getInstance()` por instâncias reais baseadas em Supabase (`SupabaseClassRepository`, `SupabaseAccessRequestRepository` e `SupabaseAttendanceRepository`) nos construtores dos use cases instanciados na tela `src/presentation/screens/monitor/MonitorHomeScreen.tsx`.
  - **Estimativa**: 1.5h

- [x] 3.2 Migrar injeção de dependências em MonitorClassesScreen
  - **Detalhes de implementação**: Substituir `MockClassRepository.getInstance()` e `MockAccessRequestRepository.getInstance()` por instâncias de repositórios reais do Supabase na tela `src/presentation/screens/monitor/MonitorClassesScreen.tsx`.
  - **Estimativa**: 1.5h

## 4. Testes e Validação

- [x] 4.1 Executar a suíte de testes do Jest
  - **Detalhes de implementação**: Rodar a suíte completa de testes do Jest (`npm run test`) para certificar que todas as modificações e novos tipos compilam corretamente e que todos os testes existentes passam com 100% de sucesso.
  - **Estimativa**: 1.0h

## Priorização

🔴 **Core**:
- Tasks 1.1 e 2.1 (Ajuste de contrato e implementação no Supabase)
- Tasks 3.1 e 3.2 (Substituição de injeção dos mocks nas telas reais de monitor)

🟡 **Importante**:
- Task 4.1 (Verificação completa e testes verdes no Jest)

🟠 **Bônus**:
- Nenhuma
