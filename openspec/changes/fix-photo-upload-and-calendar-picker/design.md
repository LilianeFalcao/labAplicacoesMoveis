## Context

A interface administrativa do aplicativo móvel Bambolê App fornece aos gestores a capacidade de cadastrar e gerenciar crianças matriculadas no centro. A experiência atual de cadastro de alunos falha na infraestrutura local do Supabase devido à ausência do bucket de armazenamento `children-photos`, e falha na experiência do usuário ao exigir a digitação manual de datas de nascimento no formato `AAAA-MM-DD`.

## Goals / Non-Goals

**Goals:**
- Aplicar localmente a migração SQL do bucket `children-photos` para garantir uploads bem-sucedidos de fotos tiradas de perfil.
- Substituir o `<TextInput>` manual da data de nascimento por um seletor visual em formato de modal de calendário responsivo, intuitivo e com atalhos rápidos de ano e mês direcionados ao público infantil.
- Garantir que a alteração seja 100% retrocompatível com a lógica de validação de data (`AAAA-MM-DD`) e o domínio `Child` atual.

**Non-Goals:**
- Instalar dependências nativas complexas adicionais (ex: `@react-native-community/datetimepicker`) que possam introduzir incompatibilidades de build no Expo Go ou desalinhamento estético.
- Alterar as entidades ou casos de uso da camada de domínio `domain/enrollment/`.

## Decisions

### Decisão 1: Sincronização do Supabase local via `supabase db reset`
* **Descrição**: Reiniciar o banco local de desenvolvimento para aplicar a migração pendente do bucket `children-photos`.
* **Alternativas**: Criar o bucket manualmente via painel do Kong (Studio), o que é propenso a falhas manuais e não replica o ambiente produtivo/CI de forma limpa.
* **Justificativa**: O reset de banco aplica todas as migrações de forma limpa e rodará o script `supabase/seed.sql` automaticamente, restaurando o estado íntegro dos usuários e dados do MVP.

### Decisão 2: Implementar um Componente de Calendário Customizado com Modal
* **Descrição**: Criar um componente de modal de calendário interno na própria tela de gestão usando `<Modal>`, `<FlatList>` e `Theme.colors`.
* **Visual e Usabilidade**:
  1. **Seletor Rápido de Ano**: Um cabeçalho que permite selecionar diretamente anos entre 2015 e 2026.
  2. **Seletor Rápido de Mês**: Grid compacto com as abreviações dos 12 meses (Jan - Dez).
  3. **Visualizador de Dias**: Uma grade de 7 colunas (D, S, T, Q, Q, S, S) calculando os dias do mês ativo e destacando o dia atualmente selecionado.
* **Justificativa**: O componente customizado elimina qualquer risco de build nativo, renderiza de forma idêntica em iOS, Android e Web, e permite priorizar a rolagem rápida de anos (essencial para cadastro de crianças de 0 a 10 anos) em vez do tradicional date picker que exige rolar infinitamente pelos meses até o ano desejado.

## Risks / Trade-offs

- **[Risco]** Processamento excessivo ao recalcular dias do mês. → **[Mitigação]** Utilizar cálculos matemáticos simples de calendário direto no React State e manter o escopo limitado a um único mês renderizado por vez.
- **[Risco]** Perda de dados locais no reset do banco de dados local. → **[Mitigação]** Como estamos em desenvolvimento local, o arquivo `seed.sql` já carrega todos os dados padrões de teste necessários (Administradores, Turmas, Pais de teste), então nenhum dado crítico de negócio real é perdido.
