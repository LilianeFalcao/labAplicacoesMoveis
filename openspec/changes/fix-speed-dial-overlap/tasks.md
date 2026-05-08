## 1. Component Refactoring

- [x] 1.1 Update `src/presentation/components/base/SpeedDial.tsx`. Change `actionWrapper` style to `position: 'absolute'` and ensure they are right-aligned.
- [x] 1.2 Update the `translateY` calculation in `SpeedDial.tsx` to use a consistent negative offset based on index (e.g., `-index * 65 - 10`).
- [x] 1.3 Adjust `actionsContainer` to have `pointerEvents="box-none"` and verify the `bottom` offset to avoid overlap with the main FAB button.
- [x] 1.4 Add `scale` animation to the actions for a smoother "pop" effect.

## 2. Verification

- [ ] 2.1 Verify on the device/emulator that the 4 options (Incidente, Foto, Comunicado, Solicitar) are correctly spaced and reachable.
- [ ] 2.2 Test the backdrop click to close the menu.
