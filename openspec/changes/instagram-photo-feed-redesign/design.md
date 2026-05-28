## Context

A visualização atual de fotos dos pais é fragmentada: `PhotoFeedScreen.tsx` gerencia o fluxo informativo de consentimento da LGPD e os termos legais, mas apenas renderiza dados mockados estáticos. Por outro lado, a `ParentFeedScreen.tsx` possui a implementação real de carregamento dinâmico via `GetActivityFeedUseCase`, mas exibe as fotos em uma interface simples e básica que destoa do apelo visual do app.

Esta especificação técnica define como faremos a fusão dessas duas telas em uma única interface moderna, inspirada na fluidez e convenções do Instagram, integrando o controle de LGPD com o cache local do SQLite e conexões com o Supabase.

## Goals / Non-Goals

**Goals:**
- **Unificação Limpa:** Consolidar a lógica de consentimento da LGPD de `PhotoFeedScreen` com a recuperação de fotos reais de `ParentFeedScreen`.
- **Experiência Premium (Instagram-Style):** Criar um feed dinâmico com modos Grid (3 colunas) e Feed (cabeçalho, barra de ações, legendas).
- **Animações Fluidas:** Implementar uma animação de "Duplo Toque para Curtir" (Double Tap to Like) com desempenho nativo de 60fps.
- **Segurança de Dados:** Rígida adesão ao consentimento de imagens antes de carregar metadados do Supabase ou banco SQLite local.

**Non-Goals:**
- Implementação de caixa de comentários abertos ou chat bidirecional de texto no feed.
- Edição de fotos, filtros visuais de imagem no mobile ou corte de imagem na câmera.
- Criação de banco de dados extra no SQLite; usaremos a estrutura existente de fotos de atividades.

## Decisions

### 1. Ponto de Integração Único e Substituição de Rota
**Decisão:** Substituir a aba "Fotos" (`ParentFeedScreen`) pelo componente `PhotoFeedScreen` no roteamento de abas (`RoleTabs.tsx`).
- **Alternativas Consideradas:** 
  1. *Manter as duas telas e fazer uma transição de tela inteira:* Adiciona sobrecarga cognitiva de navegação para os pais.
  2. *Refatorar a ParentFeedScreen:* Teria que refazer toda a infraestrutura de LGPD nela.
- **Raciocínio:** `PhotoFeedScreen` já possui a estrutura completa de consentimento legal, estados visuais informativos e switch de permissão. Integrar a busca de dados reais nela é mais rápido, seguro e encapsulado.

### 2. Gestão de Visualizações Duplas (Grid vs. Feed)
**Decisão:** Utilizar um seletor visual na parte superior da tela e renderizar condicionalmente os modos usando uma `FlatList` com chaves dinâmicas (`key={numColumns}`) ou dois renderizadores dedicados.
- **Alternativas Consideradas:**
  1. *Usar duas abas de navegação separadas:* Polui a barra de navegação inferior.
  2. *Rolagem de tela inteira com Toggle de Estado:* Usar um estado simples `viewMode` ('grid' | 'feed') que altera a função de renderização e as propriedades de coluna da lista.
- **Raciocínio:** O uso de um estado de React `viewMode` com uma única `FlatList` ou renderização controlada mantém o estado de scroll e carregamento centralizado, otimizando o uso de memória.

### 3. Animação de Toque Duplo de Alto Desempenho (Double Tap)
**Decisão:** Implementar a lógica de duplo toque baseada em carimbo de tempo pura no React Native (JS plano com limites `< 300ms`), acionando um componente `Animated` com `useNativeDriver: true`.
- **Alternativas Consideradas:**
  1. *Utilizar `react-native-gesture-handler`:* Traz complexidade de configuração e dependência externa desnecessária para um evento tão localizado.
  2. *Usar bibliotecas prontas de Double Tap:* Cria dependências adicionais no `package.json`, dificultando futuras migrações de versão do Expo.
- **Raciocínio:** A detecção com carimbo de tempo é leve (10 linhas de código), autossuficiente e funciona perfeitamente em todas as versões do Expo. A animação nativa garante execução direta no thread de UI nativo (sem engasgos devido ao thread de JS ocupado).

---

## Risks / Trade-offs

- **[Risk] Queda de frames durante a animação do coração gigante em celulares de entrada**
  - *Mitigação:* Usar rigorosamente `useNativeDriver: true` nas propriedades de escala e opacidade do componente animado para garantir renderização direta nativa no Android e iOS.
- **[Risk] Exposição inadvertida de imagens sem consentimento de imagem ativo**
  - *Mitigação:* A verificação do estado `hasConsent` será o primeiro e principal guardião no ciclo de renderização. Se `hasConsent !== true`, o componente interrompe qualquer inicialização de loaders do feed ou cache SQLite.
- **[Risk] Layout de imagens com proporções variadas quebrando o Grid de 3 colunas**
  - *Mitigação:* Fixar as dimensões no modo Grid (largura e altura quadradas idênticas, ex: `width / 3`), utilizando `resizeMode="cover"` nas imagens da grade.
