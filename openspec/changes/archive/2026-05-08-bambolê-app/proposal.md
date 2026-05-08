# Proposta — App Bambolê

> Atualizado com refinamentos de 13/03/2026

## O que é e por que construir

O **Bambolê** é o aplicativo móvel oficial do Centro de Recreação Infanto-Juvenil Bambolê. O centro opera com turmas de crianças acompanhadas por monitores, e hoje toda a comunicação com os responsáveis ocorre de forma informal (WhatsApp, ligações), sem registro centralizado de presenças, atividades ou avisos.

O app resolve três problemas centrais:

1. **Visibilidade para os pais** — responsáveis não acompanham o dia a dia dos filhos em tempo real
2. **Registro manual de presenças** — chamadas feitas em papel ou planilha, sem validação de local
3. **Comunicação descentralizada** — avisos importantes se perdem em grupos de WhatsApp

## Quem usa

| Perfil | Necessidade principal |
|--------|----------------------|
| **Pai/Responsável** (`parent`) | Acompanhar presença, ver fotos, receber avisos, justificar faltas |
| **Monitor** (`monitor`) | Fazer chamada com validação geográfica, publicar fotos, comunicar avisos da turma |
| **Admin** (`admin`) | Cadastrar crianças e turmas, vincular responsáveis, publicar comunicados gerais |

## Escopo

### Inclui (MVP)
- Autenticação com 3 roles (parent, monitor, admin)
- Cadastro de crianças com foto opcional (câmera) e filtro por turma
- Cadastro de monitores com senha definida pelo admin; redefinição de senha pelo admin quando necessário
- Vinculação pai ↔ filho por e-mail (com desvínculo)
- Turmas com **grade horária fixa** (dias + horário), Modalidade e Faixa Etária
- Chamada de presença com geolocalização (raio 200m) e 4 status — **bloqueada fora do horário da grade**
- Justificativa de faltas pelo pai — proativa (data futura) e retroativa — via calendário
- Agenda da turma com categorias fixas e recorrência semanal
- Captura e publicação de fotos de atividades
- Avisos da turma (monitor via Observações) e comunicados gerais (admin) via push
- Feed de fotos agrupado por atividade/dia
- Cache offline de leitura para o pai (SQLite + fila de escrita pendente com expiração de 7 dias e resolução de conflitos server-first)
- Perfil do pai: alterar nome, senha e foto; push gerenciado pelo SO
- **Monitor sem turma** entra em Modo Visualização com opção de solicitar turma; admin aprova ou rejeita
- Monitor pode acumular múltiplas turmas (principal + coberturas); Home exibe lista de turmas

### Push Notifications

| Evento | Destinatário |
|--------|-------------|
| Chamada marcada | Pai do filho |
| Foto publicada | Pais da turma |
| Aviso do monitor | Pais da turma |
| Comunicado geral | Todos os pais |
| Pré-justificativa do pai | Monitor da turma |

> Push gerenciado apenas pelo SO — sem toggle interno no app.
> Implementado via **Supabase Database Webhooks + Edge Functions**.

### LGPD — Imagem

| Regra | Descrição |
|-------|-----------|
| **Consentimento** | Pai aceita Termo de Consentimento de Imagem no 1º acesso (não skipável) |
| **Sem consentimento** | Feed bloqueado; monitor vê aviso visual na tela de chamada |
| **Acesso** | Fotos visíveis somente para pais da mesma turma (RLS por `class_id`) |
| **Retenção** | Fotos removidas automaticamente ao desmatrícula da criança |

### Não inclui
- Registro de saída das crianças
- Pagamentos ou mensalidades
- Chat entre pais e monitores
- Múltiplos centros / multi-tenant
- Toggle de notificações dentro do app

## Resultado esperado

Ao final do desenvolvimento, o Centro Bambolê terá um canal digital oficial que:
- Aumenta a confiança dos pais na instituição
- Reduz o trabalho operacional dos monitores com papel
- Centraliza a comunicação formal entre centro e responsáveis
- Deixa um registro histórico de presenças e atividades por criança
- Cumpre as exigências da LGPD no tratamento de imagens de crianças
