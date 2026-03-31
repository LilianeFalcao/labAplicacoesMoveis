## 1. Auth & State Simulation

- [x] 1.1 Add `simulatedRole` support to `AuthContext`.
- [x] 1.2 Implement `startSimulation` method in `AuthContext` to inject mock user state.
- [x] 1.3 Add `stopSimulation` or ensure `signOut` clears the simulation state.

## 2. Login UI

- [x] 2.1 Add "Pré-visualizar App" button to `LoginScreen` with minimalist styling.
- [x] 2.2 Create a selection alert/modal for choosing between Admin, Monitor, and Parent roles.

## 3. Navigation Integration

- [x] 3.1 Update `AppNavigator` logic to prioritize the simulated user over the real one if present.
- [x] 3.2 Verify that all stacks (`AdminStack`, `MonitorStack`, `ParentStack`) load properly in simulation mode.

## 4. Simulation Indicator

- [x] 4.1 Add a "Mood Bar" or banner to the top of the screens when in simulation mode.
- [x] 4.2 Provide an "Sair da Pré-visualização" (Exit Preview) action easily accessible in the indicator.
