# Barbearia Vintage — Frontend

Interface web do sistema de gestão da Barbearia Vintage: login, agenda organizada por data e horário, e cadastro de clientes. Pensada para ser usada no dia a dia por pessoas sem conhecimento técnico.

Case da 2ª fase do Processo Seletivo da Insper Jr.

## Stack

| Camada | Tecnologia | Por quê |
|---|---|---|
| Framework | React 18 + Vite | Componentização simples e dev server instantâneo |
| Rotas | React Router | Rotas protegidas: sem login, tudo redireciona para a tela de entrada |
| Estado | Context API | Auth e toasts globais sem dependência extra — o escopo não pede mais que isso |
| Estilo | CSS puro com design tokens | Identidade visual própria (estética de barbearia clássica), sem framework de UI |

## Como rodar

```bash
npm install
npm run dev   # abre em http://localhost:5173
```

Copie `.env.example` para `.env` — a única variável é `VITE_API_URL` apontando para o backend.

> O backend precisa estar rodando (repositório `barbearia-backend`).

**Login de teste:** `admin@barbeariavintage.com` / `barbearia123`

## Telas

- **Site público (`/`)** — a página vista pelo cliente: hero editorial, menu de serviços com preços, fotos e o **painel de agendamento online** — o cliente escolhe serviço, **profissional** (cada um dos 6 com escala própria de dias e horários), dia e um dos horários livres daquele profissional, e confirma; a solicitação cai direto na agenda interna e dispara o e-mail de confirmação via n8n. Se o profissional não atende no dia exibido, o painel avança sozinho para o próximo dia com horários. O rodapé leva à Área do funcionário.
- **Login (`/login`)** — autentica contra a API; o token JWT fica no localStorage e a sessão é restaurada ao recarregar.
- **Agenda** — agendamentos agrupados por dia e ordenados por horário, com filtros (Hoje / Próximos 7 dias / Todos), destaque para o dia atual, mudança de status em um clique (com atualização otimista), edição e remoção com confirmação.
- **Profissionais** — lista com a ficha de cada um dos 6 profissionais (escala e agendamentos ativos); cada ficha abre a **página individual do profissional**, com a agenda só dele, estatísticas rápidas e os mesmos controles de status/edição da agenda geral. O badge do profissional na agenda geral também leva à página dele.
- **Clientes** — fichas de cliente em grade (inspiradas nos fichários das barbearias clássicas e em franquias como Truefitt & Hill, Pall Mall Barbers e V's Barbershop): monograma, número de registro, preferências anotadas e contagem de atendimentos, com busca por nome/email, cadastro, edição e remoção (avisando que os agendamentos vinculados também são removidos).

## Decisões de UX (usuários leigos)

- Ações principais sempre visíveis e com rótulos por extenso — nada escondido em menus.
- Status coloridos e legíveis (Agendado / Concluído / Cancelado / Não compareceu), alterados por um seletor único na própria linha da agenda.
- Toda ação dá feedback imediato (toasts de sucesso/erro) e toda remoção pede confirmação.
- Erros da API aparecem em linguagem clara — ex.: ao tentar marcar um horário já ocupado, a mensagem diz quem está ocupando.

## Estrutura

```
src/
  api.js           # camada única de chamadas à API (token, erros, sessão)
  auth.jsx         # contexto de autenticação
  toast.jsx        # feedback visual global
  statuses.js      # os 4 status do case
  styles.css       # design system (tokens, componentes, animações)
  pages/           # Login, Agenda, Clients
  components/      # Layout, Modal, ConfirmDialog, AppointmentForm, ClientForm
```
