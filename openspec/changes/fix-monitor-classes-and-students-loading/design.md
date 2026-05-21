## Context

Atualmente, o fluxo do monitor exibe dados estáticos em memória nas telas `MonitorHomeScreen` e `MonitorClassesScreen` porque as instâncias de casos de uso (como `GetMonitorClassesUseCase` e `GetMonitorAverageAttendanceUseCase`) recebem repositórios mockados (`MockClassRepository.getInstance()`, `MockAccessRequestRepository.getInstance()`, `MockAttendanceRepository.getInstance()`).

Para que os monitores visualizem turmas e alunos reais integrados com o backend Supabase, precisamos migrar essas injeções de dependência de simuladas (Mock) para as reais (Supabase).

## Goals / Non-Goals

**Goals:**
- Adicionar a assinatura `findByMonitorId(monitorId: string): Promise<ClassAccessRequest[]>` na interface `IAccessRequestRepository`.
- Implementar a consulta real na classe `SupabaseAccessRequestRepository` no Supabase (`class_access_requests`).
- Atualizar a instanciação de Use Cases nas telas `MonitorHomeScreen` e `MonitorClassesScreen` para usar as implementações reais baseadas em Supabase (`SupabaseClassRepository`, `SupabaseAccessRequestRepository`, `SupabaseAttendanceRepository`).
- Garantir que a cobertura e o sucesso da suíte de testes existente (Jest/TDD) sejam mantidos sem quebras.

**Non-Goals:**
- Desenvolver novas interfaces de telas ou alterar o layout UI existente das telas do monitor.
- Adicionar novos campos às tabelas do Supabase ou alterar regras de RLS existentes.
- Criar novos Use Cases ou modificar a lógica de negócios central que rege a validação de presença.

## Decisions

### 1. Declaração do Método no Repositório de Domínio
- **Decisão**: Adicionar `findByMonitorId(monitorId: string): Promise<ClassAccessRequest[]>` na interface `IAccessRequestRepository`.
- **Racional**: A assinatura já estava sendo implementada no `MockAccessRequestRepository` mas não constava no contrato de domínio, gerando incoerência de tipos. Ao adicionar ao contrato, garantimos a conformidade com a Clean Architecture.
- **Alternativas consideradas**: Fazer casting ou type checks na UI para ler do Mock vs Real. Rejeitado por violar Clean Architecture e gerar acoplamento impróprio.

### 2. Implementação com Supabase
- **Decisão**: Implementar `findByMonitorId` em `SupabaseAccessRequestRepository` filtrando a tabela `class_access_requests` pelo campo `monitor_id` igual ao identificador fornecido.
- **Racional**: Permite que o caso de uso `GetMonitorClassesUseCase` carregue de forma ágil todas as solicitações de acesso de turma que o monitor realizou e seus respectivos estados (APROVADO, REJEITADO, PENDENTE).

### 3. Injeção de Dependências na Camada Presentation
- **Decisão**: Substituir instâncias Mock pelos repositórios Supabase reais diretamente nos construtores dos Use Cases instanciados nas telas `MonitorHomeScreen` e `MonitorClassesScreen`.
- **Racional**: Assegura que o fluxo de chamadas a partir das telas de monitor utilize a infraestrutura real do Supabase sem ferir a regra de dependência (os screens dependem de use cases, que recebem as implementações de repositório via construtor).

### 4. Comportamento Offline
- **Decisão**: Como os perfis de `monitor` e `admin` dependem fortemente de dados em tempo real e de validações on-line (ex: validação geográfica via GPS para chamada com raio de 200m e verificação de grade horária), a visualização de turmas e a folha de chamadas serão sempre on-line. Em caso de falta de conexão, o app emitirá o aviso de conexão padrão sem cache persistente em SQLite local (recurso exclusivo do perfil `parent`).

## Risks / Trade-offs

- **[Risco]** Diferença estrutural nos dados carregados entre o mock e o Supabase quebrar componentes visuais das telas.
  - *Mitigação*: Garantir que o mapeador `mapToDomain` no repositório Supabase preencha corretamente todos os atributos essenciais requeridos pelas entidades de domínio e componentes visuais.
- **[Risco]** Quebra nos testes de integração ou unitários existentes.
  - *Mitigação*: Rodar a suíte de testes de forma contínua durante e após as edições para garantir estabilidade e regressão zero.
