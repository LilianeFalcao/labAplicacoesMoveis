# Proposta — App Bambolê

> Atualizado com refinamentos de design — 10/03/2026

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
- Cadastro de monitores com senha definida pelo admin
- Vinculação pai ↔ filho por e-mail (com desvínculo)
- Chamada de presença com geolocalização (raio 200m, hardcoded) e 4 status
- Justificativa de faltas pelo pai — proativa (data futura) e retroativa — via calendário
- Agenda da turma com categorias fixas e recorrência semanal
- Captura e publicação de fotos de atividades
- Avisos da turma (monitor via Observações) e comunicados gerais (admin) via push
- Feed de fotos agrupado por atividade/dia
- Cache offline de leitura para o pai (SQLite + fila de escrita pendente)
- Perfil do pai: alterar nome, senha e foto; push gerenciado pelo SO

### Push Notifications

| Evento | Destinatário |
|--------|-------------|
| Chamada marcada | Pai do filho |
| Foto publicada | Pais da turma |
| Aviso do monitor | Pais da turma |
| Comunicado geral | Todos os pais |
| Pré-justificativa do pai | Monitor da turma |

> Push gerenciado apenas pelo SO — sem toggle interno no app.

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
