## ADDED Requirements

### Requirement: Monitor Photo Capture State Reset
A tela de captura de foto do monitor deve limpar todos os campos preenchidos e o preview da imagem após um envio bem-sucedido, permitindo novos registros imediatos.

#### Scenario: Successful image capture and upload
- **WHEN** o monitor realiza o upload de uma foto com sucesso
- **THEN** o preview da imagem deve ser removido
- **AND** o campo de legenda deve retornar ao valor padrão
- **AND** a UI deve mostrar o estado de "Placeholder" (Toque para fotografar)
