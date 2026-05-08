## Context

A migração de um tema estático para um dinâmico é uma mudança estrutural. O objetivo é permitir que o app responda às mudanças de `useColorScheme` do sistema sem recarregar e que os componentes consumam essas cores de forma reativa.

## Goals / Non-Goals

**Goals:**
- Prover suporte nativo ao Tema Escuro (Auto-Sync).
- Criar a interface de Configurações para o Monitor.
- Centralizar a lógica de cores para evitar duplicação.

**Non-Goals:**
- Não mudaremos as fontes ou o espaçamento, apenas a paleta de cores.
- O modo escuro não será obrigatório; ele seguirá a preferência do sistema por padrão.

## Decisions

- **React Context API:** Utilizaremos um `ThemeProvider` no `App.tsx` para injetar o tema.
- **Hook `useTheme`:** Facilitará o acesso às cores: `const { colors } = useTheme()`.
- **System Synchronization:** O estado inicial será sempre baseado no `useColorScheme()` do React Native.
- **Persistent Storage:** A escolha do usuário (Sistema/Claro/Escuro) será salva no `AsyncStorage`.

## Technical Details

### ThemeContext Structure
```typescript
interface ThemeContextType {
  theme: 'light' | 'dark';
  setTheme: (mode: 'system' | 'light' | 'dark') => void;
  colors: ThemeColors;
}
```

### Color Mapping (Dark Mode)
- `background`: `#0F172A` (Slate 900)
- `surface`: `#1E293B` (Slate 800)
- `onBackground`: `#F8FAFC` (Slate 50)
- `onSurface`: `#F1F5F9` (Slate 100)
- `gray[100..900]`: Escala invertida para manter o contraste.

## Risks / Trade-offs

- **Refatoração em Massa:** Quase todos os arquivos `presentation` que importam `Theme` precisarão ser atualizados. Para mitigar o risco, manteremos uma versão compatível do objeto `Theme` ou faremos a transição por componentes principais primeiro.
