## 1. Implementação do Reset de Estado

- [x] 1.1 Modificar a função `handleSave` em `PhotoCaptureScreen.tsx` para limpar os estados `image` e `caption` após o sucesso do upload.
- [x] 1.2 Garantir que a limpeza ocorra antes da navegação de volta (ou no lugar dela).

## 2. Melhoria de UX

- [x] 2.1 Atualizar o Alerta de sucesso para oferecer as opções: "Capturar outro momento" (mantém na tela limpa) e "Voltar" (executa `goBack()`).
- [x] 2.2 Validar que a transição entre o estado preenchido e o placeholder ocorra sem glitches visuais.

## 3. Verificação

- [x] 3.1 Atualizar os testes em `PhotoCaptureScreen.test.tsx` para verificar se os campos são limpos após o disparo do useCase de upload.
- [x] 3.2 Realizar teste manual capturando 2 fotos sequenciais.
