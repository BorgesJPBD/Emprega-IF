<h1 align="center">Emprega IF</h1>

<p align="center">
  Plataforma que conecta estudantes do Instituto Federal a vagas de estágio e jovem aprendiz.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/FastAPI-API%20REST-009688?logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Docker-compose-2496ED?logo=docker&logoColor=white" alt="Docker">
</p>

<p align="center">
  <a href="#3-como-rodar">Como rodar</a> ·
  <a href="#4-trabalhando-em-equipe">Trabalhando em equipe</a> ·
  <a href="#5-decisões-técnicas">Decisões técnicas</a>
</p>

---

Implementação da documentação v3.0 (Prof. Apio Carnielo e Silva). Projeto
acadêmico do Instituto Federal.

> **Começando agora?** Com Docker instalado, são três comandos:
> `git clone`, `cd emprega-if` e `docker compose up`.

---

## 1. Situação do projeto

| Tela / caso de uso | Situação |
|---|---|
| Banco de dados (10 tabelas, 3 views, 4 triggers, migrations) | operante |
| UC01 — Cadastrar Perfil de Estudante | completo |
| Autenticação (Login, Figura 5) | completo |
| Tela de Cadastro de Estudante (Figura 3) | completa |
| Cabeçalho e rodapé do site | completos |
| Cadastro de Empresa | completo |
| Página Inicial (Figura 2) | completa, com vagas vindas do banco |
| Listagem e detalhe de vagas | completos, com filtros no banco |
| Publicar Vaga (UC03, Figura 4) | completo (exige login de empresa) |
| Candidatura a vaga | completa (exige login de estudante) |
| Busca de vagas por palavra (Full Text Search) | completa |
| Painel da empresa (vagas, candidatos, andamento) | completo |
| Minhas candidaturas, com histórico de status | completa |
| E-mail de confirmação de candidatura e de mudança de status | completo (Brevo) |
| Vagas recomendadas (UC02) | pendente |

---

## 2. Arquitetura

Segue a seção 4.1 da documentação, com as três camadas rodando separadas:

```
React 18 (Vite)   :5173     Camada de Apresentação
        │  JSON / HTTP
FastAPI + Uvicorn :8000     Camada de Lógica de Negócio
        │  SQL / psycopg 3
PostgreSQL        :5432     Camada de Dados
```

Stack conforme a seção 4.9 da documentação, com o acesso ao banco feito em SQL
puro.

```
emprega-if/
├── backend/                API REST (FastAPI)
│   ├── main.py             aplicação, CORS e lifespan do pool
│   ├── config.py           variáveis de ambiente
│   ├── sql/migrations/     o banco, em scripts numerados (001, 002, ...)
│   ├── sql/dados_exemplo.sql  6 empresas e 6 vagas para desenvolvimento
│   └── app/
│       ├── db.py           único ponto que conversa com o banco
│       ├── migracoes.py    aplica as migrations pendentes quando a API sobe
│       ├── schemas.py      valida o que entra, define o que sai
│       ├── seguranca.py    hash bcrypt e token JWT
│       ├── dependencias.py quem está logado (exigir_empresa, exigir_estudante)
│       ├── validadores.py  regras de domínio (CPF, vínculo com o IF)
│       └── routers/        um arquivo por caso de uso
│           ├── estudantes.py   UC01
│           ├── empresas.py     cadastro de empresa
│           ├── vagas.py        listagem e UC03
│           ├── candidaturas.py candidatura e andamento
│           ├── estatisticas.py números da página inicial
│           └── auth.py         login
├── frontend/               interface web (React + Vite)
    └── src/
        ├── api.js          todo fetch passa por aqui
        ├── auth.js         sessão do usuário no navegador
        ├── vagas.js        busca as vagas na API e adapta para as telas
        ├── componentes/    peças reaproveitadas
        └── pages/          uma tela por arquivo
├── docker-compose.yml      sobe banco + API + frontend juntos
└── render.yaml             configuração da hospedagem (Render)
```

Onde colocar código novo:

| O que você cria | Onde |
|---|---|
| uma tela | `frontend/src/pages/` |
| a rota da tela | uma linha em `App.jsx` |
| um endpoint | `backend/app/routers/` |
| validação de campos | `backend/app/schemas.py` |
| tabela, coluna, view, trigger | um arquivo novo em `backend/sql/migrations/` (o próximo número) |

---

## 3. Como rodar

Há dois caminhos. Escolha um.

### Caminho A — Docker (recomendado)

Não exige Python, Node nem PostgreSQL instalados: só o
[Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
git clone <url-do-repositorio>
cd emprega-if
docker compose up
```

Pronto. Na primeira vez demora alguns minutos baixando as imagens; depois sobe
em segundos. As tabelas são criadas pela própria API quando ela sobe (migrations),
então não é preciso criar tabela nenhuma na mão.

> Se a porta 5432 já estiver ocupada por um PostgreSQL instalado no Windows,
> crie um arquivo `.env` na raiz do projeto com a linha `DB_PORTA=5433`.

| Endereço | O que é |
|---|---|
| <http://localhost:5173> | interface web |
| <http://localhost:8000/docs> | documentação interativa da API |
| <http://localhost:8000/health> | teste de conexão com o banco |
| `localhost:5432` | banco (usuário `postgres`, senha `postgres`) |

O código fica montado dentro dos contêineres: editar um arquivo recarrega a
aplicação na hora, sem reconstruir nada.

Comandos úteis:

```bash
docker compose up -d          # sobe em segundo plano
docker compose logs -f api    # acompanha o log da API
docker compose down           # para tudo
docker compose down -v        # para tudo E apaga o banco (recomeçar do zero)
```

### Caminho B — Instalação na máquina

Exige Python 3.10+, Node 18+ e PostgreSQL 13+ instalados. O script cuida do
resto: ambiente virtual, dependências, arquivos `.env`, criação do banco e das
tabelas.

```powershell
# Windows
.\scripts\setup.ps1
```

```bash
# Linux / macOS
bash scripts/setup.sh
```

Ao final, ele diz os dois comandos para subir o projeto — um em cada terminal:

```bash
cd backend && uvicorn main:app --reload    # com o ambiente virtual ativado
cd frontend && npm run dev
```

Se preferir fazer tudo manualmente, os passos estão em `scripts/setup.ps1`, que
é legível de cima a baixo.

### 3.1 Telas disponíveis

- <http://localhost:5173/> — página inicial
- <http://localhost:5173/vagas> — vagas abertas, com filtros
- <http://localhost:5173/vagas/nova> — publicar vaga (login de empresa)
- <http://localhost:5173/cadastro/estudante> e <http://localhost:5173/cadastro/empresa>
- <http://localhost:5173/login>

O banco já nasce com 6 empresas e 6 vagas de exemplo (`sql/dados_exemplo.sql`).
Todas as empresas de exemplo usam a senha `empresa123` — por exemplo,
`rh@techsolutions.exemplo.com` / `empresa123` para testar a publicação de vagas.

### 3.2 Atualizando um banco que já existe

Não precisa fazer nada: ao subir, a API aplica sozinha as migrations que o seu
banco ainda não tem, sem apagar dados (veja a seção 6.1). Basta reiniciar:

```bash
docker compose restart api
```

Se preferir começar do zero no Docker: `docker compose down -v` e depois
`docker compose up` (isso apaga todos os cadastros).

### 3.3 Problemas comuns

| Sintoma | Causa |
|---|---|
| `Could not import module "main"` | o uvicorn foi rodado fora da pasta `backend` |
| `Não foi possível falar com o servidor` na tela | o backend não está rodando |
| A alteração no `.env` não fez efeito | o Vite e o uvicorn só leem o `.env` ao iniciar; reinicie |
| `psql: command not found` no Windows | falta `C:\Program Files\PostgreSQL\<versão>\bin` no PATH |
| `port is already allocated` no Docker | já existe algo usando a porta 5432, 8000 ou 5173 — provavelmente o PostgreSQL instalado na máquina |
| O e-mail do cadastro é recusado | por padrão só aceita domínio do IF; deixe `DOMINIOS_EMAIL_PERMITIDOS=` vazio no `.env` |

---

### 3.4 Colocando no ar (Render + Neon)

- **Banco:** [Neon](https://neon.tech), plano grátis. Copie a *connection string* do projeto.
- **API e site:** [Render](https://render.com) → **New → Blueprint** → este repositório.
  O `render.yaml` já descreve os dois serviços; o Render só pede o `DATABASE_URL`
  (a string do Neon).
- As tabelas e as vagas de exemplo são criadas sozinhas quando a API sobe
  (migrations e `CARREGAR_DADOS_EXEMPLO`). Um `git push` com migration nova
  atualiza o banco do Neon no próximo deploy.
- **E-mails:** o plano grátis do Render bloqueia SMTP, então o envio usa a API do
  [Brevo](https://www.brevo.com) (grátis, 300 e-mails por dia). No Brevo: crie a conta,
  verifique um remetente em *Senders* e gere uma chave em *SMTP & API → API Keys*. No
  Render, em `emprega-if-api` → *Environment*, preencha `BREVO_API_KEY` e
  `EMAIL_REMETENTE` (o e-mail verificado). Sem a chave, o site funciona e só não envia.
- No plano grátis a API "dorme" após 15 minutos sem acesso e leva cerca de 1 minuto
  para acordar: abra o site alguns minutos antes de apresentar.

---

## 4. Trabalhando em equipe

**Nunca suba arquivos `.env`.** Eles contêm a senha do banco e a chave de
assinatura dos tokens, e já estão no `.gitignore`. Cada pessoa cria o seu a
partir do `.env.example` — que é o arquivo versionado, sem segredo nenhum
dentro.

Também não vão para o repositório: `node_modules/`, `.venv/` e `dist/`. São
reconstruídos por `npm install` e `pip install`, e somam centenas de megabytes.

Quando alguém mexer no banco, a alteração vai num arquivo novo em
`backend/sql/migrations/`, com o próximo número. Nunca edite uma migration que
já foi aplicada: o banco de quem já rodou não vai receber a mudança. Mudanças
feitas direto no pgAdmin não ficam no projeto e se perdem.

Para evitar conflito, combinem quem pega qual tela: cada tela mexe em arquivos
próprios (`pages/`, `routers/`), então trabalhos paralelos raramente se
esbarram — exceto em `App.jsx` e `main.py`, onde cada tela nova acrescenta uma
linha. Conflito ali é pequeno e fácil de resolver.

---

## 5. Decisões técnicas

**SQL puro em vez de SQLAlchemy.** A documentação previa ORM. Optamos por SQL
escrito à mão porque o algoritmo de recomendação do UC02 vai depender de
consultas com cruzamento de perfil e ordenação por relevância, onde o controle
direto sobre a query importa. O acesso fica centralizado em `db.py`, então uma
troca futura por ORM é localizada.

**psycopg 3 em vez de psycopg2.** Mesma biblioteca citada na seção 4.10, em
versão atual, com suporte nativo a operações assíncronas — o modelo de execução
do FastAPI.

**Pool de conexões.** Abrir conexão a cada requisição é caro. O pool mantém
conexões prontas para reuso, sustentando o RN-03 (resposta em até 3 segundos).

**Senha em bcrypt.** O banco guarda apenas o hash; a senha em texto puro não
existe em lugar nenhum do sistema. Atende o RN-05.

**Mensagem genérica de erro no login.** A resposta é sempre "E-mail ou senha
inválidos". Dizer qual dos dois está errado permitiria descobrir quem tem conta
na plataforma testando e-mails. Junto disso, quando o e-mail não existe a rota
processa um hash descartável, para igualar o tempo de resposta — sem isso, a
resposta mais rápida entregaria a mesma informação.

**Sessão conforme o "Lembrar-me".** Marcado, a sessão persiste por 30 dias no
`localStorage`; desmarcado, vai para o `sessionStorage` e é descartada ao fechar
a aba. Importante em computador compartilhado, como os laboratórios do IF.

**Validação no servidor, não só no navegador.** As máscaras e checagens da tela
existem para dar retorno rápido, mas toda regra é reaplicada na API, porque
validação apenas no frontend é contornável.

---

## 6. Modelo de dados

O modelo do item 4.8.2 foi mantido nas suas quatro entidades principais
(estudantes, empresas, vagas, candidaturas) e complementado. Cada evolução está
numa migration comentada em `backend/sql/migrations/`.

### 6.1 Migrations

| Arquivo | O que faz |
|---|---|
| `001_estrutura_inicial.sql` | as 4 tabelas do item 4.8.2 com os complementos do protótipo |
| `002_tabelas_de_dominio.sql` | `setores` e `areas` viram tabelas com chave estrangeira |
| `003_primeira_forma_normal.sql` | requisitos, diferenciais e benefícios saem do texto e viram tabelas (1FN) |
| `004_integridade.sql` | `TIMESTAMPTZ`, `NOT NULL`, `CHECK` de formato e `ON DELETE` explícito |
| `005_regras_e_historico.sql` | triggers de regra de negócio e histórico de status |
| `006_views_busca_e_indices.sql` | views, busca textual (GIN) e revisão de índices |

A tabela `schema_migrations` registra quais já rodaram. Cada arquivo roda numa
transação: se falhar no meio, nada fica pela metade.

### 6.2 Complementos ao item 4.8.2

| Ajuste | Motivo |
|---|---|
| `estudantes.senha_hash` | a tabela não tinha campo de senha, mas a classe `Usuario` (Figura 9) e as telas de Cadastro e Login exigem uma |
| `estudantes.periodo` | o UC01 lista Período como campo obrigatório |
| `estudantes.instituicao`, `telefone` | campos presentes no protótipo da Figura 3 |
| `empresas`: `nome_fantasia`, `setor_id`, `email_contato`, `telefone`, `senha_hash` | campos do protótipo da Figura 4; sem e-mail e senha a empresa não consegue autenticar |
| `vagas.situacao` | implementa os cinco estados da Figura 11 (Rascunho, Ativa, EmSelecao, Finalizada, Cancelada) |
| `vagas`: `descricao`, `prazo_inscricao`, `modalidade`, horários, `numero_vagas` | citados no UC03 e no protótipo da tela Publicar Vaga |

### 6.3 Decisões de modelagem

- **1FN:** um requisito ou benefício por linha. `vaga_requisitos` e
  `vaga_diferenciais` são 1:N com a vaga (com `ordem`); `beneficios` é um
  catálogo ligado às vagas por `vaga_beneficios` (N:N), então "Vale-transporte"
  existe uma vez só, sem grafias diferentes.
- **Tabelas de domínio:** `setores` e `areas` em vez de texto livre. O banco
  recusa valor inexistente, e as telas carregam as listas dele.
- **Integridade no banco, não só na API:** CPF com 11 dígitos, CNPJ com 14,
  e-mail em minúsculas, saída depois da entrada, prazo depois da publicação.
- **Exclusões:** empresa com vagas não pode ser apagada (`RESTRICT`); vaga não se
  apaga, muda de situação (exclusão lógica); apagar um estudante apaga as
  candidaturas dele (`CASCADE`), atendendo o direito de eliminação da LGPD.
- **Triggers:** candidatura só em vaga aberta; ciclo de vida da vaga
  (Rascunho → Ativa → EmSelecao → Finalizada, ou Cancelada); andamento da
  candidatura (Pendente → Entrevista → Finalizado); histórico de status gravado
  pelo próprio banco em `candidatura_historico`.
- **Views:** `vw_vagas` (vaga completa, usada pela API), `vw_painel_vagas`
  (contagem de candidaturas por status) e `vw_estatisticas` (página inicial).
- **Busca:** coluna gerada `busca` (`tsvector`, título com peso maior que a
  descrição, dicionário português e sem acentos) com índice GIN.
- **Índices:** removidos os redundantes (`candidaturas(estudante_id)` já é coberto
  pelo `UNIQUE (estudante_id, vaga_id)`) e os de baixa seletividade (`tipo`,
  `situacao`); criado um índice parcial só das vagas ativas.

---

## 7. Regras implementadas no cadastro

- **CPF** conferido pelos dois dígitos verificadores, não apenas pelo formato
- **Vínculo com o IF** verificado pelo domínio do e-mail (UC01, passo 3)
- **Nome completo** exigido (precisa de sobrenome)
- **Senha** com mínimo de 8 caracteres e confirmação idêntica
- **Aceite dos termos** obrigatório (RN-04, LGPD)
- **E-mail e CPF únicos**, garantidos em dois níveis: checagem na aplicação e
  restrição `UNIQUE` no banco

Cada exceção prevista no UC01 tem uma resposta HTTP correspondente:

| Situação | Resposta |
|---|---|
| Cadastro criado | 201 Created |
| E-mail ou CPF já cadastrado | 409 Conflict |
| Dados inválidos | 422, com o erro de cada campo |
| Credenciais incorretas no login | 401 Unauthorized |

---

## 8. Endpoints

| Método | Rota | Descrição |
|---|---|---|
| POST | `/estudantes` | cadastra o perfil do estudante (UC01) |
| POST | `/auth/login` | autentica estudante ou empresa e devolve o JWT |
| POST | `/empresas` | cadastra o perfil da empresa |
| GET | `/vagas` | vagas abertas; busca `q` e filtros `tipo`, `area`, `localizacao` |
| GET | `/vagas/opcoes` | tipos, áreas (da tabela `areas`) e modalidades |
| GET | `/vagas/{id}` | detalhes de uma vaga |
| GET | `/vagas/{id}/parecidas` | vagas abertas do mesmo tipo ou área |
| POST | `/vagas` | publica vaga — **empresa logada** (UC03) |
| PATCH | `/vagas/{id}/situacao` | encerra, finaliza ou cancela — **empresa dona** |
| GET | `/vagas/{id}/candidatos` | candidatos da vaga — **empresa dona** |
| GET | `/empresas/me/vagas` | painel: vagas da empresa com contagens — **empresa logada** |
| GET | `/empresas/setores` | setores (da tabela `setores`) |
| POST | `/candidaturas` | candidata-se a uma vaga — **estudante logado** |
| GET | `/candidaturas/minhas` | candidaturas do estudante logado, com histórico |
| PATCH | `/candidaturas/{id}/status` | muda o andamento e avisa o estudante por e-mail — **empresa dona da vaga** |
| GET | `/estatisticas` | totais da página inicial |
| GET | `/health` | verifica a conexão com o banco |

Rotas marcadas como logadas exigem o cabeçalho `Authorization: Bearer <token>`
(o `api.js` do frontend envia sozinho). Sem token ou com token vencido: 401;
com o papel errado (estudante tentando publicar, por exemplo): 403.

---

## 9. Próximos passos

- E-mail de confirmação do cadastro (UC01, passos 5 e 6) — a coluna `ativo` já
  existe no banco
- Algoritmo de recomendação de vagas por perfil (UC02)
