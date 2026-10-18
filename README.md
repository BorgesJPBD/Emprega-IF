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
| Banco de dados (4 tabelas) | operante |
| UC01 — Cadastrar Perfil de Estudante | completo |
| Autenticação (Login, Figura 5) | completo |
| Tela de Cadastro de Estudante (Figura 3) | completa |
| Cabeçalho e rodapé do site | completos |
| Cadastro de Empresa | completo |
| Página Inicial (Figura 2) | completa, com vagas vindas do banco |
| Listagem e detalhe de vagas | completos, com filtros no banco |
| Publicar Vaga (UC03, Figura 4) | completo (exige login de empresa) |
| Candidatura a vaga | completa (exige login de estudante) |
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
│   ├── sql/schema.sql      criação física do banco (seção 4.8.2)
│   ├── sql/dados_exemplo.sql  6 empresas e 6 vagas para desenvolvimento
│   └── app/
│       ├── db.py           único ponto que conversa com o banco
│       ├── schemas.py      valida o que entra, define o que sai
│       ├── seguranca.py    hash bcrypt e token JWT
│       ├── dependencias.py quem está logado (exigir_empresa, exigir_estudante)
│       ├── validadores.py  regras de domínio (CPF, vínculo com o IF)
│       └── routers/        um arquivo por caso de uso
│           ├── estudantes.py   UC01
│           ├── empresas.py     cadastro de empresa
│           ├── vagas.py        listagem e UC03
│           ├── candidaturas.py candidatura a vaga
│           └── auth.py         login
├── frontend/               interface web (React + Vite)
    └── src/
        ├── api.js          todo fetch passa por aqui
        ├── auth.js         sessão do usuário no navegador
        ├── vagas.js        busca as vagas na API e adapta para as telas
        ├── componentes/    peças reaproveitadas
        └── pages/          uma tela por arquivo
├── docker-compose.yml      sobe banco + API + frontend juntos
└── scripts/                instalação automática (setup.ps1 e setup.sh)
```

Onde colocar código novo:

| O que você cria | Onde |
|---|---|
| uma tela | `frontend/src/pages/` |
| a rota da tela | uma linha em `App.jsx` |
| um endpoint | `backend/app/routers/` |
| validação de campos | `backend/app/schemas.py` |
| tabela ou coluna | `backend/sql/schema.sql` |

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
em segundos. O `schema.sql` roda sozinho na criação do banco, então não é
preciso criar tabela nenhuma na mão.

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

O `schema.sql` pode ser rodado de novo sem perder dados: ele só cria o que
falta (tabelas e colunas novas). Depois de puxar alterações no banco:

```bash
# Docker
docker compose exec db psql -U postgres -d emprega_if -f /docker-entrypoint-initdb.d/01_schema.sql
docker compose exec db psql -U postgres -d emprega_if -f /docker-entrypoint-initdb.d/02_dados_exemplo.sql

# Instalação local (dentro da pasta backend)
psql -U postgres -d emprega_if -f sql/schema.sql
psql -U postgres -d emprega_if -f sql/dados_exemplo.sql
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
- As tabelas e as vagas de exemplo são criadas sozinhas na primeira vez que a API
  sobe (`CRIAR_TABELAS_AO_INICIAR` e `CARREGAR_DADOS_EXEMPLO`).
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

Quando alguém mexer no banco, a alteração vai no `backend/sql/schema.sql` e é
comunicada ao time — quem estiver no Docker recria com `docker compose down -v`
seguido de `docker compose up`; quem estiver com instalação local roda o
`schema.sql` de novo.

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

## 6. Ajustes no modelo de dados

O modelo do item 4.8.2 precisou de complementos para as telas funcionarem.
Nenhuma entidade ou relacionamento foi alterado — a modelagem original foi
mantida e complementada. Todos os ajustes estão comentados no `schema.sql`:

| Ajuste | Motivo |
|---|---|
| `estudantes.senha_hash` | a tabela não tinha campo de senha, mas a classe `Usuario` (Figura 9) e as telas de Cadastro e Login exigem uma |
| `estudantes.periodo` | o UC01 lista Período como campo obrigatório |
| `estudantes.instituicao`, `telefone` | campos presentes no protótipo da Figura 3 |
| `empresas`: `nome_fantasia`, `setor`, `email_contato`, `telefone`, `senha_hash` | campos do protótipo da Figura 4; sem e-mail e senha a empresa não consegue autenticar |
| `vagas.situacao` | implementa os cinco estados da Figura 11 (Rascunho, Ativa, EmSelecao, Finalizada, Cancelada) |
| `vagas`: `descricao`, `requisitos`, `prazo_inscricao` | citados no UC03 e nas regras de negócio |

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
| GET | `/vagas` | vagas abertas; filtros `tipo`, `area`, `localizacao` |
| GET | `/vagas/{id}` | detalhes de uma vaga |
| GET | `/vagas/{id}/parecidas` | vagas abertas do mesmo tipo ou área |
| POST | `/vagas` | publica vaga — **empresa logada** (UC03) |
| POST | `/candidaturas` | candidata-se a uma vaga — **estudante logado** |
| GET | `/candidaturas/minhas` | candidaturas do estudante logado |
| GET | `/health` | verifica a conexão com o banco |

Rotas marcadas como logadas exigem o cabeçalho `Authorization: Bearer <token>`
(o `api.js` do frontend envia sozinho). Sem token ou com token vencido: 401;
com o papel errado (estudante tentando publicar, por exemplo): 403.

---

## 9. Próximos passos

- Página Inicial (Figura 2) e Publicar Vaga (UC03, Figura 4)
- Painel da empresa: listar as próprias vagas e ver os candidatos
- Tela "Minhas candidaturas" para o estudante (o endpoint já existe)
- Cabeçalho mostrando quem está logado, com botão de sair
- E-mail de confirmação do cadastro (UC01, passos 5 e 6) — a coluna `ativo` já
  existe no banco
- Filtragem de vagas e algoritmo de recomendação (UC02)
