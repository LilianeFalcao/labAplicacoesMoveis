## ADDED Requirements

### Requirement: Alternância de Visualização Grid e Feed
O sistema mobile do responsável SHALL fornecer um componente de aba ou seletor de visualização de fácil acesso (1 toque) que permite alternar instantaneamente entre a visualização de Grade (Grid de 3 colunas) e a visualização de Feed Detalhado (posts verticais).

#### Scenario: Alternância para Visualização Grid
- **WHEN** o pai/responsável toca no botão "Grade" no seletor de visualização
- **THEN** a galeria de fotos é re-renderizada exibindo uma grade clássica de 3 colunas, priorizando o aspecto visual de cada foto, sem detalhes adicionais.

#### Scenario: Alternância para Visualização Feed
- **WHEN** o pai/responsável toca no botão "Feed" no seletor de visualização
- **THEN** a galeria de fotos exibe os posts em ordem cronológica de forma detalhada, com cabeçalho do post, área da imagem e área de comentários/legendas.

---

### Requirement: Cabeçalho do Post Detalhado
Cada post no modo "Feed" MUST conter um cabeçalho superior que exiba o avatar circular do monitor responsável pelo envio, o nome legível desse monitor, o nome da turma vinculada e a data amigável relativa do momento.

#### Scenario: Exibição do Cabeçalho de Post Completo
- **WHEN** o pai acessa o feed em modo "Feed View"
- **THEN** cada post exibe o cabeçalho superior contendo avatar do monitor, nome, turma associada e o carimbo de tempo amigável formatado (ex: *"Tia Luísa • Turma Borboleta • Há 2 horas"*).

---

### Requirement: Interação de Toque Duplo (Double Tap to Like)
A imagem do post no modo "Feed" SHALL detectar toque duplo contínuo e disparar uma animação de coração gigante pulsante no centro da imagem, alternando o estado de curtida para ativo.

#### Scenario: Toque Duplo na Imagem para Curtir
- **WHEN** o usuário toca duas vezes seguidas e rapidamente na imagem do post
- **THEN** o sistema ativa o estado de curtida do post (caso não estivesse curtido) e anima um ícone de coração gigante flutuante na tela utilizando o driver de animação nativo, ocultando-o em seguida.

---

### Requirement: Barra de Ações Rápidas e Legendas
Cada post no modo "Feed" MUST conter uma barra de ações logo abaixo da imagem com botões de Curtir (coração que se preenche com a cor primária ao ser curtido), Comentar (ícone de balão de fala que redireciona para área de comentários) e Salvar (bookmark). Abaixo, deve exibir o número total de curtidas de forma legível e a legenda descritiva escrita pelo monitor.

#### Scenario: Curtir Post via Botão de Coração
- **WHEN** o usuário toca no botão de coração (Curtir) na barra de ações rápidas
- **THEN** o sistema atualiza o ícone para o estado preenchido, incrementa o contador de curtidas e persiste local/remotamente o novo estado de engajamento do usuário.
