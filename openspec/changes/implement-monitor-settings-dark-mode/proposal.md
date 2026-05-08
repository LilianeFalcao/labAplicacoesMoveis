## Why

Atualmente, o aplicativo Bambolê possui um tema visual claro fixo. Monitores que utilizam o app em ambientes internos ou durante longos períodos relataram cansaço visual. Além disso, a ausência de uma tela de configurações limita a personalização da experiência do usuário. A implementação de um Tema Escuro sincronizado com o sistema operacional elevará a qualidade técnica do produto e o conforto do usuário.

## What Changes

1.  **Infraestrutura de Tema**: Migração do `Theme.ts` estático para um `ThemeContext` dinâmico.
2.  **Sincronização com Sistema**: Uso do hook `useColorScheme` do React Native para detecção automática da preferência do celular.
3.  **Tela de Configurações**: Criação da `MonitorSettingsScreen` acessível a partir do Perfil.
4.  **Paleta Dark**: Definição de cores específicas para o modo noturno (Slate 900/800).

## Capabilities

### New Capabilities
- `monitor-settings`: Interface para gestão de preferências do monitor.
- `app-theming`: Sistema dinâmico de cores para suporte a Dark Mode.

## Impact

- `src/presentation/styles/Theme.ts`: Refatorado para suportar múltiplas variantes.
- `src/presentation/contexts/ThemeContext.tsx`: Novo contexto global.
- `src/presentation/screens/monitor/MonitorSettingsScreen.tsx`: Nova tela de configurações.
- Todo o app: Atualização gradual para consumir o tema via contexto/hook.
