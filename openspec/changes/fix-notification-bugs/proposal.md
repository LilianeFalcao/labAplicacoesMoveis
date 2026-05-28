## Why

Este plano de alteração visa corrigir duas falhas críticas no sistema de notificações e fluxos administrativos do app Bambolê:
1. **O Bug do Iterador de String nos Comunicados por Turma**: Ao disparar comunicados para uma turma específica, o ID da turma é passado como uma string simples, porém o Use Case itera sobre o argumento esperado (`string[]`). Isso faz com que cada caractere da string do ID da turma (ex: "T", "U", "R", "M", "A") seja processado individualmente, gravando registros inúteis de turmas inexistentes no banco de dados e falhando em enviar a notificação push para os pais reais daquela turma.
2. **O Silêncio nas Solicitações de Acesso Temporário**: Quando um monitor solicita acesso temporário a uma turma em campo, a solicitação é salva no banco de dados Supabase, mas nenhum alerta visual ou notificação push é enviado aos administradores, fazendo com que monitores fiquem aguardando indefinidamente sem validação.

## What Changes

- **Tratamento robusto de entrada no envio de comunicados**: Wrap automático de parâmetros de classe do tipo `string` para `string[]` tanto na interface administrativa `CreateAnnouncementScreen.tsx` quanto de forma defensiva dentro do Use Case `SendAnnouncementUseCase.ts`.
- **Correção da ilusão nos testes unitários**: Correção e robustecimento da suíte de testes de comunicados para garantir que asserts de contagem de chamadas (`toHaveBeenCalledTimes`) e asserções exatas de IDs de classes sejam validados, eliminando falsos positivos nos testes.
- **Notificação ativa de solicitações de acesso para Administradores**: Acoplamento de busca de tokens de push de administradores na infraestrutura de identidade e envio de notificação push em tempo real no Use Case `RequestTemporaryAccessUseCase.ts` quando uma nova solicitação pendente for criada.
- **Tabela de Perfis de Usuário Relacionados**:
  | Perfil | Necessidade Principal no Contexto Desta Alteração |
  | --- | --- |
  | **Admin** | Receber notificações push em tempo real de novos pedidos de acesso e poder disparar comunicados por turma sem erros. |
  | **Monitor** | Ter sua solicitação de acesso temporário visualizada e aprovada rapidamente graças ao alerta enviado ao Admin. |
  | **Parent** | Receber corretamente os comunicados e avisos oficiais direcionados especificamente à turma de seus filhos. |

## Capabilities

### New Capabilities
- Nenhuma nova funcionalidade de negócio (MVP) está sendo introduzida.

### Modified Capabilities
- `communication-announcements`: Correção da entrega de avisos direcionados a turmas específicas, impedindo a fragmentação de strings de ID de turma e garantindo o direcionamento correto dos pushes e persistência limpa no banco de dados.
- `monitor-access-control`: Introdução de notificações push direcionadas a administradores quando novas solicitações de acesso temporário a turmas são registradas por monitores.

## Impact

- **Frontend/Presentation**: `CreateAnnouncementScreen.tsx` alterado para encapsular `classId` em um array antes de enviá-lo ao Use Case.
- **Application Services / Use Cases**:
  - `SendAnnouncementUseCase.ts` atualizado com tipagem e checagem defensiva de strings/arrays.
  - `RequestTemporaryAccessUseCase.ts` atualizado para receber dependências de `IUserRepository` e `IPushService` e orquestrar o envio de notificações push a administradores.
- **Domain / Repositories**:
  - `IUserRepository.ts` ganha a assinatura do método `findAdminTokens(): Promise<string[]>`.
- **Infrastructure**:
  - `SupabaseUserRepository.ts` implementa o método `findAdminTokens()` consultando tokens de usuários cujo papel (`role`) é `'admin'`.
- **Tests**:
  - `SendAnnouncementUseCase.test.ts` e `RequestTemporaryAccessUseCase.test.ts` expandidos e corrigidos com asserts rígidos de chamadas e mocks adequados.
