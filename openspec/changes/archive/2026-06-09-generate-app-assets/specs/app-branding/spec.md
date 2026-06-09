## ADDED Requirements

### Requirement: App Branding and Custom Assets
O aplicativo móvel SHALL utilizar o logotipo oficial extraído e a cor azul de fundo (#0000FF) para garantir uma identidade visual consistente na inicialização e na tela inicial do dispositivo.

#### Scenario: Visualizando a Tela de Splash
- **WHEN** o usuário inicia o aplicativo móvel no dispositivo
- **THEN** o sistema SHALL exibir a tela de splash contendo o fundo azul sólido (#0000FF) e a marca gráfica off-white ("bambolê") perfeitamente centralizada e proporcional

#### Scenario: Exibição do Ícone Adaptativo no Android
- **WHEN** o ícone do aplicativo é exibido na tela inicial do dispositivo Android
- **THEN** o sistema SHALL aplicar a máscara nativa sobre a imagem do adaptive icon foreground (que contém apenas a logo em fundo transparente) integrada ao fundo azul sólido (#0000FF)
