## 1. Infraestrutura e Repositórios

- [x] 1.1 **Adicionar assinatura findAdminTokens na interface IUserRepository**
  - **Descrição**: Adicionar a declaração do método `findAdminTokens(): Promise<string[]>` no arquivo `IUserRepository.ts` (Identity context).
  - **Detalhes**: Define o contrato puro de busca de tokens de dispositivos de administradores cadastrados na aplicação.
  - **Estimativa**: 0.5h
- [x] 1.2 **Implementar findAdminTokens no SupabaseUserRepository**
  - **Descrição**: Implementar o método concreto de busca de tokens dos administradores no `SupabaseUserRepository.ts`.
  - **Detalhes**: Executar uma query na tabela `users` do Supabase buscando os registros onde `role === 'admin'` e que tenham o `push_token` preenchido.
  - **Estimativa**: 1.0h

## 2. Casos de Uso (Camada de Aplicação)

- [x] 2.1 **Tratamento defensivo de tipos no SendAnnouncementUseCase**
  - **Descrição**: Ajustar o `SendAnnouncementUseCase.ts` para tolerar parâmetros do tipo string no argumento `classIds`.
  - **Detalhes**: Normalizar o parâmetro fazendo checagem de tipo em tempo de execução: se `classIds` for do tipo `string`, convertê-lo em `[classIds]`, e se for falsy, atribuir um array vazio.
  - **Estimativa**: 1.0h
- [x] 2.2 **Enviar Notificação no RequestTemporaryAccessUseCase**
  - **Descrição**: Alterar o caso de uso `RequestTemporaryAccessUseCase.ts` para receber `IUserRepository` e `IPushService` no construtor e enviar as notificações.
  - **Detalhes**: Após gravar a solicitação de acesso temporário no repositório, buscar os tokens dos administradores através do `userRepository.findAdminTokens()` e invocar o `pushService.send(...)` enviando o título "Nova Solicitação de Acesso" e informando qual monitor solicitou acesso a qual turma.
  - **Estimativa**: 1.5h

## 3. Apresentação (Camada de Tela)

- [x] 3.1 **Encapsular classId na tela CreateAnnouncementScreen**
  - **Descrição**: Atualizar a chamada do Use Case em `CreateAnnouncementScreen.tsx`.
  - **Detalhes**: Mudar o quarto argumento na chamada `useCase.execute(...)` de `classId` simples para `[classId]`, em conformidade com a assinatura esperada de string array.
  - **Estimativa**: 0.5h

## 4. Testes Unitários

- [x] 4.1 **Eliminar "Mock Illusion" em SendAnnouncementUseCase.test.ts**
  - **Descrição**: Atualizar a suíte de testes de envio de avisos.
  - **Detalhes**: Alterar asserções soltas para validações rígidas de chamadas de mocks (`toHaveBeenCalledTimes(1)`) e garantir que a conversão defensiva de strings seja devidamente testada, provendo tanto strings avulsas quanto arrays de strings.
  - **Estimativa**: 1.0h
- [x] 4.2 **Atualizar testes unitários em RequestTemporaryAccessUseCase.test.ts**
  - **Descrição**: Atualizar os testes unitários do caso de uso de solicitação de acesso.
  - **Detalhes**: Ajustar os mocks do construtor adicionando o mock do repositório de usuários e do serviço de push. Escrever cenários garantindo que o push seja disparado com os argumentos e tokens corretos de administradores.
  - **Estimativa**: 1.0h

## Priorização e Classificação

🔴 **Core (Crítico)**
- Todos os itens de 1.1 a 4.2 são necessários e classificados como Core (Crítico) por se tratar de correção direta e eliminação de vazamento de lógicas/dados nos avisos e implementação de notificação nos pedidos de acesso em campo.
