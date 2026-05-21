## Why

Atualmente, a tela de Vínculos Escolares (fluxo de vínculo familiar) exibe identificadores técnicos complexos (UUIDs) para turmas nos cards de alunos e não lista visualmente os responsáveis já vinculados. Além disso, o processo de vinculação de um novo responsável exige que o administrador digite cegamente o e-mail exato da pessoa, o que é ineficiente, pouco intuitivo e propício a erros de digitação. 

Esta mudança visa modernizar e refinar a experiência do administrador do Bambolê, substituindo UUIDs por nomes reais e amigáveis, e transformando o input cego em um componente de busca inteligente com autocompletar e sugestões interativas em tempo real.

## What Changes

- **Substituição de Turma ID**: Nos cards de alunos, o texto técnico `Turma ID: [UUID]` será substituído pelo nome real e amigável da turma correspondente (ex: `🏫 Turma: Jardim II`).
- **Visualização de Responsáveis Atuais**: Cada card de aluno exibirá uma seção com a lista dos responsáveis já vinculados (exibindo Nome e E-mail de forma limpa). Caso não haja vínculos, exibirá uma etiqueta de atenção (ex: `⚠️ Nenhum responsável vinculado`).
- **Autocompletar Inteligente de Responsáveis**: No Modal de Vínculo, o input simples e cego de e-mail será substituído por uma caixa de pesquisa dinâmica que filtra sugestões por **Nome** ou **E-mail** em tempo real conforme o administrador digita.
- **Seleção Dinâmica via Clique**: O administrador poderá selecionar um responsável na lista de sugestões com um simples clique, preenchendo automaticamente as informações para confirmação.

## Capabilities

### New Capabilities
- `family-linkage-ux-refinement`: Refinamento estético e de usabilidade da tela de vínculos entre alunos e responsáveis no painel administrativo do Bambolê.

### Modified Capabilities
- Nenhuma.

## Impact

- **apresentação (presentation/)**: Alterações restritas ao componente de UI `StudentMonitorLinkingScreen.tsx` e estilos relacionados.
- **infraestrutura (infrastructure/)**: Sem alterações necessárias no banco de dados, tabelas ou repositórios de base.
- **aplicação (application/)**: Casos de uso existentes (`LinkChildToGuardianUseCase`) e repositórios serão mantidos intactos, preservando a estabilidade das regras de negócio.
