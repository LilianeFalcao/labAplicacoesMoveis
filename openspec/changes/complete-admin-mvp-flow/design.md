## Context

O aplicativo móvel Bambolê possui suporte à visualização offline apenas para o perfil `parent` utilizando SQLite local. O perfil `admin` e o perfil `monitor` dependem de conectividade online para interagir com o Supabase de forma segura via RLS (Row Level Security).

Atualmente, várias telas chaves da interface administrativa dependem de mocks de dados estáticos na camada de apresentação (`presentation/`), e a falta de implementação de métodos adicionais nos repositórios infraestruturais como `SupabaseClassRepository` causa gargalos. Além disso, existe um desalinhamento sério de mapeamento na construção de entidades `Child` a partir do Supabase no repositório `SupabaseChildRepository.ts` que precisa ser urgentemente corrigido respeitando a integridade das camadas DDD.

## Goals / Non-Goals

**Goals:**
* **Alinhamento Arquitetural:** Garantir conformidade total com a Clean Architecture. A camada `domain/` deve se manter pura (apenas TypeScript nativo). Os `use cases` receberão dependências via injeção de interfaces dos repositórios.
* **Consistência de Mapeamento:** Resolver o bug de inversão de argumentos na conversão de registros do Supabase para a entidade de domínio `Child`.
* **Segurança e Isolamento de Sessão:** Permitir que o administrador crie novas credenciais para a equipe de monitores sem deslogar a si mesmo do cliente Supabase.
* **Componentização Administrativa:** Desenvolver telas reais para Gestão de Crianças (`StudentManagementScreen`), Gestão de Monitores (`MonitorManagementScreen`) e Gestão de Turmas (`GroupManagementScreen`) integradas aos repositórios correspondentes.

**Non-Goals:**
* Habilitar sincronização de cache SQLite offline bidirecional para administradores e monitores (esses perfis continuarão agindo diretamente no banco remoto do Supabase, conforme especificações).
* Implementar mecanismos de pagamento, autenticação multifator ou webhooks do lado do banco.

## Decisions

### 1. Correção do Construtor de `Child`
* **Escolha**: Corrigir a chamada do construtor de `Child` em `SupabaseChildRepository.ts` mapeando os atributos na ordem exata de sua declaração na entidade de domínio:
  1. `id` (string)
  2. `name` (ChildName)
  3. `birthDate` (Date - instanciada a partir de `birth_date` da tabela)
  4. `classId` (string | null - `class_id` da tabela)
  5. `photoUrl` (string - `photo_url` da tabela)
* **Alternativa Considerada**: Redefinir a assinatura do construtor da entidade de domínio `Child` para receber um objeto plano de opções. **Rejeitado** para evitar refatorar toda a base de testes unitários existentes e acoplamentos desnecessários no domínio.

### 2. Cadastro Seguro de Monitores (Isolamento de Sessão)
* **Escolha**: Instanciar um cliente Supabase secundário de uso pontual na função de registro de monitor:
  ```typescript
  import { createClient } from '@supabase/supabase-js';
  const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
      }
  });
  ```
  O `tempClient` executará o `signUp` do monitor com metadados `{ role: 'monitor', full_name: '...' }` sem interagir ou sobrepor o `AsyncStorage` da sessão do administrador.
* **Alternativa Considerada**: Usar o cliente Supabase comum e tentar re-autenticar o administrador logo em seguida. **Rejeitado** pois introduz latência severa, falha se o admin não tiver sua senha memorizada em memória, e cria fluxos de transição visual confusos na aplicação.

### 3. Implementação dos Métodos de Consulta de Turmas
* **Escolha**: Estender o repositório `SupabaseClassRepository` para realizar consultas em banco real usando queries aninhadas com o Supabase:
  * `findByMonitorId(monitorId)`: Consulta `monitor_activities` trazendo a relação da tabela `classes`.
  * `findAllWithoutMonitor()`: Seleciona todas as turmas e filtra do lado do cliente ou faz join condicional nas que não possuem registros em `monitor_activities`.
  * `findAll()`: Traz a lista completa de turmas em ordem alfabética.
* **Alternativa Considerada**: Manter as telas com mocks de dados parciais. **Rejeitado** pois as telas de chamada do monitor dependem diretamente desses dados reais para carregar a grade horária e liberar a presença.

### 4. Políticas RLS (Row Level Security) e Armazenamento
* **Escolha**: Usar as políticas existentes de RLS configuradas em `20260512000004_admin_full_access.sql`. Como o usuário autenticado atual possui `role = 'admin'`, a função SQL `public.is_admin()` retornará `true` e liberará acesso total para leitura, inserção e deleção em `children`, `classes`, `users` e `monitor_activities`.
* **Armazenamento**: Fotos de perfil de alunos serão salvas no bucket público existente `children-photos` do Supabase Storage.

### 5. Comportamento Offline por Perfil
* **Perfil `parent`**: Sincroniza dados via SQLite local em modo somente leitura (Read-Cache).
* **Perfil `monitor`**: Exige conexão ativa. Em caso de queda de rede, a tela de chamada de presença exibirá uma barreira visual explicando que a validação geográfica e o envio de presença dependem de rede ativa.
* **Perfil `admin`**: Exige conexão ativa. Caso esteja offline, as telas de gestão exibirão avisos amigáveis de desconexão e travarão os botões de escrita ("Adicionar", "Salvar").

### 6. Design de Ícones
* Todo ícone novo utilizado nas telas de cadastro e ações do administrador SHALL vir diretamente do pacote `@expo/vector-icons` (usando a biblioteca MaterialCommunityIcons ou Ionicons).

## Risks / Trade-offs

* **[Risk] Cadastro do monitor falha devido a e-mail duplicado**  
  * **Mitigation**: Exibir uma validação amigável de erro na tela de cadastro caso a API do Supabase retorne status de conflito de e-mail cadastrado.
* **[Risk] Carregamento inicial de turmas lento devido a joins na tela de gestão**  
  * **Mitigation**: O administrador verá um componente de Skeleton ou indicador de Loading nativo do React Native enquanto as queries assíncronas são resolvidas.
* **[Risk] Perda de dados ou deleção indesejada de alunos**  
  * **Mitigation**: A ação de exclusão física na tabela de crianças obrigatoriamente solicitará uma janela de confirmação de segurança (Alert dialog) antes de invocar o repositório.
