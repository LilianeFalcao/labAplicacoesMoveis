## ADDED Requirements

### Requirement: Seletor de Data de Nascimento via Calendário Interativo
O sistema deve apresentar aos administradores uma interface de calendário interativo em substituição à entrada manual de texto para definição da data de nascimento de uma criança no formulário de matrícula.

#### Scenario: Abertura do Modal de Calendário
- **WHEN** o administrador pressionar o campo de data de nascimento no modal de matrícula
- **THEN** o sistema SHALL apresentar uma tela sobreposta (modal) contendo os seletores rápidos de ano (entre 2015 e 2026), seletor rápido de mês (de Janeiro a Dezembro) e a grade de dias correspondente ao mês selecionado.

#### Scenario: Seleção de Data Válida
- **WHEN** o administrador selecionar o ano, o mês e o dia desejados no calendário e pressionar o botão "Confirmar"
- **THEN** o sistema SHALL fechar o modal de calendário e preencher automaticamente o formulário de matrícula com a data selecionada convertida para a formatação padrão "AAAA-MM-DD" exigida pelo banco.
