## Context

O aplicativo Bambolê precisa de ícones e telas de splash customizados que correspondam à sua identidade visual de cor azul vibrante (`#0000FF`) e logomarca off-white/marfim. O asset original `icon-app.png` possui alta resolução (`4052x4052`), mas contém o fundo azul mesclado com a marca gráfica, necessitando de processamento para uso como ícone adaptativo e splash screen transparente.

## Goals / Non-Goals

**Goals:**
- Gerar ícones adaptativos para Android em conformidade com as diretrizes do Google (foreground com canal alfa e safe zone de 60%).
- Gerar uma splash screen limpa com a logo centralizada em fundo azul `#0000FF`.
- Configurar o `app.json` para mapear corretamente os novos caminhos e as cores de fundo.

**Non-Goals:**
- Alterar telas internas do aplicativo (apenas assets nativos).
- Alterar o design ou cores da marca gráfica do logotipo.

## Decisions

### 1. Extração do Logotipo (Chroma-Keying)
- **Decisão:** Remover o fundo azul do `icon-app.png` programaticamente, preservando as bordas e a transparência original do logotipo off-white.
- **Alternativa Considerada:** Usar a imagem inteira com o fundo azul no adaptive icon foreground.
- **Razão:** Ícones adaptativos com fundo embutido no foreground sofrem cortes inadequados nos launchers do Android. Extrair a logo transparente permite que o launcher renderize o fundo de forma dinâmica e limpa.

### 2. Zona de Segurança do Adaptive Icon (Android)
- **Decisão:** Redimensionar a logo extraída para ocupar 60% da largura/altura total do canvas (`307px` em um canvas de `512x512`).
- **Razão:** Evita que partes da logo ou das estrelas decorativas sejam cortadas quando o launcher aplicar máscaras (círculo, quadrado, lágrima).

### 3. Fundo da Tela de Splash
- **Decisão:** Definir `"backgroundColor": "#0000FF"` no `app.json` combinando com um `splash-icon.png` transparente.
- **Razão:** Garante que a splash screen se expanda infinitamente em qualquer proporção de tela sem distorcer ou esticar a marca gráfica centralizada.

## Risks / Trade-offs

- **[Risk]** Diferença sutil de tons entre o azul do splash e o azul do ícone adaptativo.
  - **Mitigation:** Utilizar o valor exato RGB extraído da imagem original (`#0000FF` / `0,0,255`).
