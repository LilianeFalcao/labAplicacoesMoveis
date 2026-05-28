## Context

Esta alteração corrige dois bugs críticos de comunicação e notificação:
1. **Iterador de String no Envio de Avisos por Turma**: O parâmetro `classIds` no `SendAnnouncementUseCase.ts` é do tipo `string[]`. Contudo, a tela administrativa passava uma `string` simples. Como strings em JS/TS são iteráveis (comportando-se como arrays de caracteres), o loop `for (const classId of classIds)` iterava sobre cada letra do identificador da turma, gerando registros corrompidos e falhando no envio de pushs reais.
2. **Ausência de Alerta nas Solicitações de Acesso**: O fluxo de solicitação de acesso temporário de um monitor à sala de aula no `RequestTemporaryAccessUseCase.ts` salvava os dados na infraestrutura do Supabase, mas era silencioso — os administradores não sabiam do pedido sem atualizar manualmente o painel.

## Goals / Non-Goals

**Goals:**
- Impedir qualquer iteração fragmentada de IDs de turma no envio de avisos, implementando tratativas robustas no frontend e checagem defensiva na camada de aplicação.
- Implementar alertas push automáticos e imediatos para todos os administradores cadastrados quando um monitor realizar uma solicitação de acesso temporário.
- Garantir 100% de cobertura e correção de testes unitários para ambos os casos de uso, expurgando "mock illusions".

**Non-Goals:**
- Criação de novos cadastros de monitor ou telas adicionais de histórico de acessos.
- Alteração no banco local SQLite, visto que o SQLite de cache de leitura offline é exclusivo do perfil `parent`.

## Decisions

### 1. Injeção de Dependência e Notificação Push no RequestTemporaryAccessUseCase
- **Decisão**: Alterar o construtor do `RequestTemporaryAccessUseCase.ts` para receber `IUserRepository` e `IPushService` (interfaces puras do domínio/aplicação) via injeção de dependência clássica da Clean Architecture.
- **Racional**: Garante desacoplamento completo da infraestrutura de envio de push (ExpoPushService) e de banco de dados (SupabaseUserRepository).
- **Tratamento Offline**: Como a solicitação de acesso é executada pelo monitor (que depende de conectividade para registrar o pedido no Supabase), a busca por tokens de administradores e disparo de push ocorrerá de forma síncrona/online a partir do servidor Expo Push API.

### 2. Extensão da Interface IUserRepository
- **Decisão**: Adicionar o método `findAdminTokens(): Promise<string[]>` na interface pura `IUserRepository.ts` e sua implementação concreta na infraestrutura do Supabase.
- **Racional**: O banco remoto Supabase na tabela `users` já possui as colunas `role` e `push_token`. Apenas isolamos a consulta na camada correspondente para buscar tokens de usuários administradores (`role = 'admin'`).

### 3. Ajuste de Contrato e Defesa no SendAnnouncementUseCase
- **Decisão**:
  - No frontend (`CreateAnnouncementScreen.tsx`), envelopar o argumento `classId` em um array: `[classId]`.
  - No use case (`SendAnnouncementUseCase.ts`), fazer verificação e conversão defensiva caso `classIds` venha como string em tempo de execução:
    ```typescript
    const normalizedClassIds = typeof classIds === 'string' ? [classIds] : classIds || [];
    ```
- **Racional**: Defesa em profundidade contra futuras alterações de interface ou falhas de coerção de tipo JS/TS no runtime.

## Risks / Trade-offs

- **[Risco] Administrador sem Push Token registrado**: Se nenhum administrador possuir um token push válido no momento do pedido de acesso, a notificação não será entregue.
  - *Mitigação*: O Use Case verifica defensivamente `adminTokens.length > 0` antes de invocar o serviço de push para não lançar erros ou abortar a gravação no banco.
- **[Risco] Testes quebrados por alteração de construtor**: A mudança de assinaturas de construtor quebra arquivos de testes existentes.
  - *Mitigação*: A suíte de testes `RequestTemporaryAccessUseCase.test.ts` será atualizada simulando de forma exata e rígida mocks das novas dependências.
