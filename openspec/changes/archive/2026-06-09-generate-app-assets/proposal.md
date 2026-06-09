## Why

Atualmente, o aplicativo móvel Bambolê utiliza os ícones e a tela de splash padrão fornecidos pelo template do Expo. A personalização desses assets com a identidade visual própria (baseada no arquivo `icon-app.png`) é essencial para dar ao aplicativo uma aparência profissional e premium na preparação para builds de visualização e produção.

## What Changes

- **Assets de Imagem**: Substituição dos ícones padrão por novas versões geradas a partir do logotipo oficial contido em `icon-app.png`:
  - `icon.png`: Ícone principal do aplicativo em alta resolução (1024x1024).
  - `splash-icon.png`: Versão transparente e centralizada do logotipo para a tela de abertura.
  - `android-icon-foreground.png`: Versão transparente do logotipo com tamanho otimizado para a zona segura do ícone adaptativo do Android.
  - `android-icon-background.png`: Imagem de fundo azul sólida para o ícone adaptativo.
  - `android-icon-monochrome.png`: Versão de silhueta transparente para suporte a ícones temáticos no Android 13+.
  - `favicon.png`: Versão em baixa resolução (48x48) para a versão web do aplicativo.
- **Configuração do App**: Atualização dos caminhos e cores de fundo no arquivo `app.json`.

## Capabilities

### New Capabilities
- `app-branding`: Padronização de assets visuais e configurações nativas do aplicativo.

### Modified Capabilities
- Nenhuma.

## Impact

- `bambole-app/assets/`: Atualização e substituição de todas as imagens de ícones e splash.
- `bambole-app/app.json`: Alteração dos caminhos de assets e definição da cor de fundo `#0000FF` para a tela de splash e ícone adaptativo.
