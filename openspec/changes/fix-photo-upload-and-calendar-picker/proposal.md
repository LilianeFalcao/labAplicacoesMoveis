## Why

Durante a matrícula de um novo aluno, o fluxo do administrador apresenta duas falhas de usabilidade e infraestrutura. Primeiro, a tentativa de capturar a foto do aluno e enviá-la para o servidor retorna o erro `Bucket not found` porque a migração que cria o bucket `children-photos` no Supabase Storage local ainda não foi aplicada ao container em execução. Segundo, o preenchimento manual da data de nascimento em formato de texto cru (`AAAA-MM-DD`) é altamente propenso a erros de digitação e pouco amigável para dispositivos móveis.

## What Changes

- **Criação e Sincronização do Bucket**: Aplicação local da migração `20260519000000_create_children_photos_bucket.sql` no container do Supabase para inicializar o bucket de armazenamento `children-photos` com as políticas de acesso público e autenticado corretas.
- **Seletor de Data de Nascimento Interativo**: Substituição do campo `<TextInput>` de entrada manual por um seletor interativo em formato de calendário customizado (modal premium construído sob medida com base nos tokens visuais do `Theme`), reduzindo a margem de erro na digitação e oferecendo um seletor rápido de anos para agilizar o fluxo administrativo.

## Capabilities

### New Capabilities

*(Nenhuma nova capacidade de negócio está sendo introduzida, mantendo-se inteiramente no escopo da funcionalidade de matrícula de crianças do MVP.)*

### Modified Capabilities

- `enrollment`: O requisito de entrada da data de nascimento de crianças passa de um campo de texto manual formatado para um seletor de calendário interativo com validações integradas.

## Impact

- **Database / Infraestrutura**: Sincronização do banco de dados local com Supabase CLI.
- **Telas / Apresentação**: `StudentManagementScreen.tsx` (exclusão do TextInput manual da data, renderização do novo componente do calendário customizado e ajustes de estilo no formulário).
