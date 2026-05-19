## Why

O fluxo administrativo do aplicativo Bambolê apresenta lacunas críticas que impedem o lançamento do MVP. Atualmente, as telas de Gestão de Turmas e Equipe de Monitores utilizam dados estáticos em memória, a funcionalidade de Gestão de Crianças (matrícula e edição) não existe na interface, e há um bug de ordenação de parâmetros no repositório de crianças que corrompe o carregamento de dados. Esta mudança é necessária agora para viabilizar o fluxo completo do administrador de forma integrada e segura com o Supabase.

## What Changes

Esta proposta introduz as seguintes capacidades e correções no aplicativo:
- **Gestão de Crianças**: Criação de uma tela dedicada para matricular crianças (captura de foto via câmera opcional), listar alunos com filtros de turmas e busca por nome, e edição de dados.
- **Equipe de Monitores**: Refatoração da tela de gestão para consultar usuários reais com perfil `monitor` no Supabase, permitindo atribuir turmas, cadastrar novos monitores sem deslogar a sessão ativa do administrador, e simular redefinições manuais de senhas.
- **Gestão de Turmas**: Refatoração da tela de turmas para consultar dados reais do Supabase, calcular dinamicamente a taxa de ocupação (crianças por turma), atribuir monitores e gerenciar a grade horária semanal.
- **Correção de Bugs**: Correção do bug de inversão de parâmetros do construtor de `Child` no `SupabaseChildRepository.ts`.

### Perfis de Usuário e Necessidades Principais

| Perfil | Necessidade Principal | Papel no MVP de Administração |
| :--- | :--- | :--- |
| **Admin** | Gerenciar o centro de recreação, incluindo matrículas, monitores, turmas e vínculos de forma centralizada. | Ator principal desta proposta. Realiza a criação, atualização e deleção lógica de dados. |
| **Monitor** | Realizar a chamada de presença e registrar atividades fotográficas para turmas atribuídas. | Consome as turmas e alunos gerenciados pelo administrador. |
| **Parent** | Visualizar a presença do filho, feed de fotos da turma e comunicados gerais. | Consome as informações do aluno e as turmas gerenciadas pelo administrador. |

### Decisões de LGPD (Consentimento de Imagem)
* **Gestão de Crianças**: A captura de fotos via câmera para o perfil da criança é opcional no momento da matrícula e sua persistência segue estritamente o consentimento do responsável legal (Parent) registrado no sistema. 
* **Retenção de Dados**: Exclusão física ou lógica das fotos de perfil do armazenamento do Supabase (`children-photos` bucket) caso a matrícula do aluno seja removida ou encerrada pelo administrador.

### Escopo Negativo (O que NÃO está incluído no MVP)
* Registro de saída de crianças e controle de portaria.
* Fluxo financeiro, pagamentos de mensalidades ou controle de inadimplência.
* Chat em tempo real entre pais, monitores e administradores.
* Cadastro de múltiplos centros ou suporte a multi-tenant.
* Redefinição de senha real via e-mail direto na API administrativa (será simulada visualmente devido a restrições de permissões do Supabase client-side).

## Capabilities

### New Capabilities
- `student-management`: Capacidade de matricular crianças, listar com busca e filtros por turma, e editar dados pessoais no Supabase.
- `monitor-management`: Gestão de monitores reais no Supabase, atribuição de atividades de classe e redefinição visual de credenciais.
- `class-management`: Gestão de turmas com persistência de horário semanal (JSONB) no Supabase e visualização de taxas de ocupação.

### Modified Capabilities
*Nenhuma especificação ou capacidade existente no OpenSpec tem seus requisitos de negócio alterados.*

## Impact

* **Supabase Client**: Uso de um cliente secundário não persistente (`persistSession: false`) para permitir que o administrador crie contas de monitores no Supabase Auth sem interromper sua própria sessão ativa.
* **Componentes e Navegação**: Acréscimo da rota `StudentManagement` no stack de navegação do administrador (`RoleStacks.tsx` e `types.ts`) e inclusão do respectivo botão de acesso no dashboard do administrador (`AdminHomeScreen.tsx`).
* **Repositório de Turmas**: Implementação das consultas no `SupabaseClassRepository.ts` para satisfazer os contratos de busca por ID, busca por monitor e identificação de turmas livres.
