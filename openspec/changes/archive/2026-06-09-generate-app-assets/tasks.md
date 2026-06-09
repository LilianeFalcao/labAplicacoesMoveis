## 1. Copiar os Assets Gerados

- [x] 1.1 Copiar os ícones e telas de splash gerados na pasta de testes (`scratch/assets/`) para a pasta de assets real em `bambole-app/assets/`.
  - Arquivos a copiar/substituir: `icon.png`, `splash-icon.png`, `android-icon-foreground.png`, `android-icon-background.png`, `android-icon-monochrome.png`, `favicon.png`.

## 2. Configurar o app.json

- [x] 2.1 Atualizar as configurações no arquivo `bambole-app/app.json`:
  - Definir `expo.icon` para `./assets/icon.png`
  - Definir `expo.splash.image` para `./assets/splash-icon.png`
  - Definir `expo.splash.backgroundColor` para `#0000FF`
  - Definir `expo.android.adaptiveIcon.backgroundColor` para `#0000FF`
  - Definir `expo.android.adaptiveIcon.foregroundImage` para `./assets/android-icon-foreground.png`
  - Definir `expo.android.adaptiveIcon.backgroundImage` para `./assets/android-icon-background.png`
  - Definir `expo.android.adaptiveIcon.monochromeImage` para `./assets/android-icon-monochrome.png`

## 3. Validação

- [x] 3.1 Executar o `npx expo-doctor` para validar se as referências de assets no `app.json` estão consistentes e válidas.
