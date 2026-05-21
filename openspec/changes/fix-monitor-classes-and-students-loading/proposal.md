## Why

Atualmente, as telas do monitor (`MonitorHomeScreen` e `MonitorClassesScreen`) no aplicativo Bambolê estão utilizando repositórios simulados (`MockClassRepository`, `MockAccessRequestRepository`, `MockAttendanceRepository`). Com isso, os monitores logados visualizam turmas e alunos fictícios em vez de dados reais e dinâmicos vindos do banco de dados remoto (Supabase). 

Para tornar o fluxo do monitor 100% funcional a nível de MVP, é essencial que as turmas vinculadas ao monitor (através da tabela `monitor_activities` ou aprovadas na tabela `class_access_requests`) e os respectivos alunos vinculados a essas turmas sejam carregados dinamicamente do Supabase.

### Tabela de Perfis e Necessidades Principais

| Perfil | Necessidade Principal no App | Status das Turmas/Alunos neste Escopo |
| :--- | :--- | :--- |
| **parent** | Auto-cadastro, visualiza presença/fotos/avisos, justifica faltas, aceita LGPD | Sem alterações nesta proposta. |
| **monitor** | Realiza chamada baseada em geolocalização e grade horária, publica fotos e avisos | **Foco desta mudança**: Visualizar turmas vinculadas reais e alunos para a chamada. |
| **admin** | Gerencia crianças, turmas, monitores, vínculos, comunicados gerais | Sem alterações nesta proposta. |

## What Changes

Esta mudança fará a migração completa do uso de repositórios mockados para os repositórios reais baseados no Supabase nas telas de visualização e chamada do monitor.

- **Domain Layer**:
  - Adição da assinatura do método `findByMonitorId(monitorId: string): Promise<ClassAccessRequest[]>` na interface de domínio `IAccessRequestRepository` para permitir a consulta de solicitações de acesso de um monitor específico.
- **Infrastructure Layer**:
  - Implementação do método `findByMonitorId` na classe concreta `SupabaseAccessRequestRepository` realizando a consulta real ao Supabase na tabela `class_access_requests`.
- **Presentation Layer**:
  - Substituição dos repositórios mockados (`MockClassRepository`, `MockAccessRequestRepository` e `MockAttendanceRepository`) pelos repositórios baseados no Supabase (`SupabaseClassRepository`, `SupabaseAccessRequestRepository` e `SupabaseAttendanceRepository`) nos arquivos `MonitorHomeScreen.tsx` e `MonitorClassesScreen.tsx`.
- **Infra/Supabase**:
  - Vinculação e carregamento real de crianças/alunos associados a cada turma a partir da tabela `class_enrollments` / `children` no Supabase ao invés de usar dados em memória.

### Decisões de LGPD (Consentimento de Imagem)

- O consentimento de imagem continua obrigatório para que os pais acessem o feed de fotos, respeitando as regras de RLS do Supabase por `class_id`.
- A exibição do badge visual vermelho ("Câmera Desativada" / "Sem Consentimento LGPD") na lista de presença dos monitores deve continuar funcionando corretamente com os dados reais dos alunos puxados do Supabase (campo `is_photo_allowed` ou consentimento ativo).

### Escopo (O que NÃO está incluído no MVP)

- Registro de saída de crianças.
- Pagamentos ou cobrança de mensalidades.
- Chat ou troca de mensagens em tempo real entre pais e monitores.
- Gerenciamento de múltiplos centros de recreação (multi-tenant).
- Toggle de ativação/desativação de notificações no aplicativo.
- Modificação de regras de segurança RLS do banco (apenas consumo das queries autenticadas).

## Capabilities

### New Capabilities
- `monitor-classes-loading`: Carregamento dinâmico das turmas associadas ao monitor do banco de dados remoto Supabase.

### Modified Capabilities
- Nenhuma (Os comportamentos especificados anteriormente se mantêm os mesmos, alterando apenas a fonte de dados de simulada para real).

## Impact

- **Telas afetadas**:
  - `src/presentation/screens/monitor/MonitorHomeScreen.tsx`
  - `src/presentation/screens/monitor/MonitorClassesScreen.tsx`
- **Interfaces e classes modificadas**:
  - `src/domain/activity/repositories/IAccessRequestRepository.ts`
  - `src/infrastructure/activity/repositories/SupabaseAccessRequestRepository.ts`
- **Testes**:
  - A suíte de testes existente deve ser executada para garantir que não haja regressões de compilação ou comportamento nas regras de domínio/use cases.
