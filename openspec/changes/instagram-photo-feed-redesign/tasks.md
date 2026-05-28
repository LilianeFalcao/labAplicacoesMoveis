## 1. Ajustes de Rotas e Navegação

- [ ] 1.1 Atualizar a importação e mapeamento no componente `ParentTabs` do `RoleTabs.tsx` para apontar o nome "Photos" para `PhotoFeedScreen` ao invés de `ParentFeedScreen`.

## 2. Refatoração e Lógica da PhotoFeedScreen

- [ ] 2.1 Importar o caso de uso `GetActivityFeedUseCase` e o repositório de fotos da infraestrutura dentro do arquivo `PhotoFeedScreen.tsx`.
- [ ] 2.2 Adicionar estado `photos` de tipo `ActivityPhoto[]` e um loader para recuperar as fotos reais da turma do aluno.
- [ ] 2.3 Implementar a chamada ao `GetActivityFeedUseCase` de forma condicional, disparando a busca APENAS se `hasConsent === true` e se houver dados de turmas das crianças dos pais.
- [ ] 2.4 Injetar dados simulados adicionais de foto com avatares de monitores, descrições ricas, número de curtidas e estado curtido na lista recuperada (ou estender o mock atual com essas propriedades premium).

## 3. Implementação da Interface Instagram-Style (UI/UX)

- [ ] 3.1 Criar o seletor de visualização superior com dois botões alternáveis usando ícones minimalistas de grade (`grid`) e lista/feed (`format-list-bulleted`), armazenando o valor em um estado `viewMode` ('grid' | 'feed').
- [ ] 3.2 Implementar a renderização da visualização **Grade (Grid View)** usando uma `FlatList` ou mapeamento em 3 colunas (`numColumns={3}`) com imagens quadradas ocupando exatamente `width / 3` de largura, sem bordas desnecessárias.
- [ ] 3.3 Implementar a visualização **Feed (Feed View)** renderizando cada post verticalmente.
- [ ] 3.4 Desenhar o componente **Header do Post** contendo: avatar circular do monitor, nome, turma correspondente, localização ("Colégio Bambolê") e tempo relativo amigável.
- [ ] 3.5 Adicionar a **Barra de Ações Rápidas** logo abaixo da imagem, com botões para Curtir (coração que alterna de cor), Comentar e Salvar.
- [ ] 3.6 Criar o bloco de **Legendas** exibindo o nome do monitor em negrito, seguido do texto descritivo e do número humanizado de curtidas.

## 4. Animação "Double Tap to Like"

- [ ] 4.1 Implementar a detecção de duplo toque baseado em tempo (`Date.now()`) no contêiner da imagem do post no modo feed.
- [ ] 4.2 Adicionar componente de coração flutuante centralizado sob a imagem usando `Animated` do React Native.
- [ ] 4.3 Configurar a animação de escala e opacidade usando o driver nativo (`useNativeDriver: true`) com duração curta para efeito de mola suave ("spring").
- [ ] 4.4 Vincular a ativação da animação ao estado de curtida do post, incrementando o contador visual de curtidas imediatamente na tela.

## 5. Testes Unitários e Integração

- [ ] 5.1 Renomear ou adaptar o arquivo `ParentFeedScreen.test.tsx` para cobrir o comportamento unificado da `PhotoFeedScreen.tsx`.
- [ ] 5.2 Escrever testes para verificar que as fotos não são carregadas do repositório quando `hasConsent === false`.
- [ ] 5.3 Escrever testes para verificar a renderização do cabeçalho de posts, alternância entre as abas Grid/Feed e a ação de curtir por clique.
