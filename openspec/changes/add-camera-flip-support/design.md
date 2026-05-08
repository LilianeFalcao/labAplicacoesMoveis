## Context

Monitores precisam de flexibilidade ao capturar momentos das turmas. A capacidade de alternar entre a câmera traseira (para registrar atividades) e a frontal (para selfies e interações mais próximas) é essencial para humanizar o registro diário enviado aos pais.

## Goals / Non-Goals

**Goals:**
- Implementar o estado de alternância de câmera (front/back) nas duas interfaces de câmera existentes.
- Adicionar um botão de controle visualmente integrado e acessível.

## Decisions

- **Facing State:** Utilizaremos o prop `facing` do `CameraView` (expo-camera).
- **UI Toggle:** O botão de alternância será posicionado próximo ao botão de captura, seguindo padrões de design de aplicativos de câmera (iOS/Android).
- **Iconography:** Ícone `camera-flip` da biblioteca `MaterialCommunityIcons`.

## Technical Details

### PhotoCaptureScreen.tsx
- Adicionar `useState<'front' | 'back'>('back')`.
- Atualizar o `CameraView` para usar o prop `facing`.
- Inserir o botão de toggle na sobreposição.

### MonitorHomeScreen.tsx (Quick Capture)
- Adicionar `useState<'front' | 'back'>('back')` no componente principal.
- Atualizar o `CameraView` do modal de captura rápida.
- Inserir o botão de toggle na sobreposição da câmera rápida.

## Risks / Trade-offs

- **Espelhamento:** Algumas versões do `expo-camera` podem espelhar a pré-visualização na câmera frontal por padrão. Verificaremos se o comportamento é consistente.
