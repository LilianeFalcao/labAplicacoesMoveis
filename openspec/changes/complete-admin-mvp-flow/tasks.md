## 1. Correções de Base e Infraestrutura

- [x] 1.1 Corrigir Mapeamento do Construtor de Child no Repositório Supabase
  * **Detalhes**: Ajustar a passagem de parâmetros na chamada de `new Child(...)` em `SupabaseChildRepository.ts` (linhas 23 e 133) e em `findByClass`. Mapear `data.birth_date ? new Date(data.birth_date) : undefined` como 3º argumento, `data.class_id` como 4º argumento, e `data.photo_url` como 5º argumento.
  * **Estimativa**: 1.0 hora
  * **Pré-requisito**: Nenhum

- [x] 1.2 Implementar Métodos Faltantes no Repositório SupabaseClassRepository
  * **Detalhes**: Adicionar suporte real aos métodos `findByIds`, `findByMonitorId`, `findAllWithoutMonitor` e `findAll` em `SupabaseClassRepository.ts` e registrar suas assinaturas na interface `IClassRepository.ts` e no `MockClassRepository.ts`.
  * **Estimativa**: 2.0 horas
  * **Pré-requisito**: Nenhum

- [x] 1.3 Escrever Testes Unitários de Repositórios de Turma e Aluno
  * **Detalhes**: Escrever suíte de testes em Jest para validar o comportamento dos novos métodos em `SupabaseClassRepository` e o mapeamento correto em `SupabaseChildRepository`.
  * **Estimativa**: 1.5 horas
  * **Pré-requisito**: 1.1, 1.2

---

## 2. Implementação da Tela 15 (Gestão de Crianças)

- [x] 2.1 Criar Componentes e Tela StudentManagementScreen
  * **Detalhes**: Criar o arquivo `StudentManagementScreen.tsx` em `src/presentation/screens/admin/` contendo a listagem de crianças e filtros por turma.
  * **Estimativa**: 2.5 horas
  * **Pré-requisito**: 1.1, 1.2

- [x] 2.2 Integrar Listagem com Filtro por Turma
  * **Detalhes**: Desenvolver a busca em tempo real com debounce ou instantânea e dropdown de turmas (consultando `findAll` de classes e alunos).
  * **Estimativa**: 1.5 horas
  * **Pré-requisito**: 2.1

- [x] 2.3 Implementar Formulário/Modal de Matrícula e Edição de Crianças
  * **Detalhes**: Criar modal customizado com formulário para cadastrar e atualizar dados (Nome, Nascimento e Turma).
  * **Estimativa**: 2.0 horas
  * **Pré-requisito**: 2.1

- [x] 2.4 Integrar Câmera Real na Matrícula do Aluno
  * **Detalhes**: Integrar com o serviço de câmera para tirar foto de perfil e fazer upload no bucket `children-photos` do Supabase.
  * **Estimativa**: 2.0 horas
  * **Pré-requisito**: 2.3

- [x] 2.5 Mapear Rotas da Tela 15 na Navegação do Administrador
  * **Detalhes**: Registrar a rota e o tipo `StudentManagement` nos arquivos `types.ts` e `RoleStacks.tsx`. Conectar no grid do menu de `AdminHomeScreen.tsx`.
  * **Estimativa**: 1.0 hora
  * **Pré-requisito**: 2.14

---

## 3. Refatoração da Tela 16 (Gestão de Monitores)

- [x] 3.1 Conectar MonitorManagementScreen ao Supabase
  * **Detalhes**: Substituir os dados mocados em `MonitorManagementScreen.tsx` por buscas ativas a usuários onde `role = 'monitor'` e suas respectivas atribuições em `monitor_activities`.
  * **Estimativa**: 1.5 horas
  * **Pré-requisito**: 1.2

- [x] 3.2 Implementar Registro Seguro de Monitores (Cliente Secundário)
  * **Detalhes**: Desenhar o modal de cadastro de monitor e disparar o cadastro no Supabase Auth usando o `tempClient` (configurado com `persistSession: false`) para cadastrar o monitor com metadados do perfil sem deslogar o administrador ativo.
  * **Estimativa**: 2.0 horas
  * **Pré-requisito**: 3.1

- [x] 3.3 Implementar Vínculo de Turmas para Monitores
  * **Detalhes**: Implementar o modal e lógica para associar ou desassociar turmas a monitores salvando os registros na tabela `public.monitor_activities`.
  * **Estimativa**: 1.5 horas
  * **Pré-requisito**: 3.1

- [x] 3.4 Simulação Visual de Redefinição de Senha
  * **Detalhes**: Criar modal para digitar nova senha de monitor e exibir notificação de redefinição simulada com sucesso de forma amigável ao administrador.
  * **Estimativa**: 1.0 hora
  * **Pré-requisito**: 3.1

- [x] 3.5 Escrever Testes de Componente para MonitorManagementScreen
  * **Detalhes**: Escrever testes automatizados em Jest + RNTL cobrindo listagem de monitores, abertura de cadastro e fluxo de vinculação de turmas.
  * **Estimativa**: 1.5 horas
  * **Pré-requisito**: 3.4

---

## 4. Refatoração da Tela 18 (Gestão de Turmas)

- [x] 4.1 Conectar GroupManagementScreen ao Supabase
  * **Detalhes**: Modificar `GroupManagementScreen.tsx` para listar as turmas reais do banco carregadas via `SupabaseClassRepository`.
  * **Estimativa**: 1.5 horas
  * **Pré-requisito**: 1.2

- [x] 4.2 Exibir Dados Reais de Ocupação e Presença
  * **Detalhes**: Realizar contagem dinâmica de crianças associadas a cada turma para exibir a ocupação numérica real da sala (ex: "X de Y alunos").
  * **Estimativa**: 1.0 hora
  * **Pré-requisito**: 4.1

- [x] 4.3 Implementar Formulário/Modal de Criação e Edição de Turmas
  * **Detalhes**: Criar o formulário para cadastro e atualização de turmas, incluindo os campos de Nome, Descrição, Faixa Etária, e grade semanal de dias/horários, persistindo em JSONB via `SupabaseClassRepository.save()`.
  * **Estimativa**: 2.0 horas
  * **Pré-requisito**: 4.1

- [x] 4.4 Escrever Testes de Componente para GroupManagementScreen
  * **Detalhes**: Escrever testes automatizados cobrindo a listagem de turmas, cálculo de ocupação e submissão do formulário de criação.
  * **Estimativa**: 1.5 horas
  * **Pré-requisito**: 4.3

---

## 5. Validação E2E e Integração Final

- [x] 5.1 Integrar Dados Reais no Painel AdminHomeScreen
  * **Detalhes**: Ajustar os use cases e chamadas em `AdminHomeScreen.tsx` para usar dados agregados reais do Supabase (Total Alunos, Turmas Ativas) vindos do repositório correspondente.
  * **Estimativa**: 1.0 hora
  * **Pré-requisito**: 2.3, 4.2

- [x] 5.2 Fluxo de Teste E2E Maestro
  * **Detalhes**: Executar e validar o fluxo E2E utilizando Maestro cobrindo a jornada administrativa completa: Login -> Matrícula de Criança -> Cadastro de Monitor -> Criação de Turma -> Atribuição de Vínculos.
  * **Estimativa**: 2.0 horas
  * **Pré-requisito**: Todas as tarefas anteriores

---

## Priorização e Classificação das Tarefas

| Prioridade | ID das Tarefas | Justificativa |
| :--- | :--- | :--- |
| 🔴 **Core (Essencial)** | 1.1, 1.2, 2.1, 2.3, 3.1, 3.2, 4.1, 4.3 | Constitui a base de correção de dados, persistência das novas entidades no banco de dados e as interfaces cruciais de escrita para preencher o MVP. |
| 🟡 **Importante** | 1.3, 2.2, 2.4, 3.3, 3.4, 4.2, 5.1 | Adiciona validação por câmera real, vinculação real de monitores a turmas, integração com a dashboard principal e testes automatizados de unidade/componentes. |
| 🟠 **Bônus** | 2.5, 3.5, 4.4, 5.2 | Testes de ponta-a-ponta e validações adicionais de interface para robustez do aplicativo antes de releases. |
