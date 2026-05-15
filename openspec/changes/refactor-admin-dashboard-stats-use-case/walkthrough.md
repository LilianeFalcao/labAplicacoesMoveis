# Refatoração: GetAdminDashboardStatsUseCase

Esta mudança desacoplou o caso de uso de estatísticas do administrador da implementação direta do Supabase, alinhando o componente com os princípios de **Clean Architecture** e **DDD**.

## Mudanças Realizadas

### Camada de Domínio
- **[NEW] [IAdminRepository.ts](file:///home/alunos/bambo/bambole-app/src/domain/admin/repositories/IAdminRepository.ts)**: Definida a interface que dita o contrato para obtenção de estatísticas.
- **[NEW] [AdminDashboardStats.ts](file:///home/alunos/bambo/bambole-app/src/domain/admin/entities/AdminDashboardStats.ts)**: Interface de dados movida da camada de aplicação para a de domínio (Entidades).

### Camada de Infraestrutura
- **[NEW] [SupabaseAdminRepository.ts](file:///home/alunos/bambo/bambole-app/src/infrastructure/admin/repositories/SupabaseAdminRepository.ts)**: Implementação concreta do repositório utilizando o cliente Supabase.

### Camada de Aplicação
- **[MODIFY] [GetAdminDashboardStatsUseCase.ts](file:///home/alunos/bambo/bambole-app/src/application/admin/use-cases/GetAdminDashboardStatsUseCase.ts)**: Refatorado para utilizar injeção de dependência via construtor.
- **[NEW] [GetAdminDashboardStatsUseCase.test.ts](file:///home/alunos/bambo/bambole-app/src/application/admin/use-cases/__tests__/GetAdminDashboardStatsUseCase.test.ts)**: Adicionados testes unitários garantindo o comportamento com repositórios mockados.

### Camada de Apresentação
- **[MODIFY] [AdminHomeScreen.tsx](file:///home/alunos/bambo/bambole-app/src/presentation/screens/admin/AdminHomeScreen.tsx)**: Atualizada para instanciar e injetar o repositório no caso de uso.

## Verificação

### Testes Unitários
Os testes foram executados com sucesso utilizando Jest:
```text
PASS src/application/admin/use-cases/__tests__/GetAdminDashboardStatsUseCase.test.ts
  GetAdminDashboardStatsUseCase
    ✓ should return stats from the repository (2 ms)
    ✓ should throw error if repository fails (4 ms)
```

### Integridade da UI
A tela `AdminHomeScreen` foi ajustada para manter a compatibilidade com o modal de solicitações pendentes (`PendingRequestsModal`), garantindo que nenhuma funcionalidade fosse quebrada durante a refatoração.
