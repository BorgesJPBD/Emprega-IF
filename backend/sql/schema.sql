-- ============================================================
-- Emprega IF - criação física do modelo de dados
-- Base: seção 4.8.2 da documentação (v3.0)
--
-- Rodar com:
--   psql -U postgres -d emprega_if -f sql/schema.sql
-- ============================================================

-- gen_random_uuid() vem com o PostgreSQL 13+; no 12 ou anterior
-- é preciso habilitar a extensão pgcrypto.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------------------------------------------------------------
-- estudantes
--
-- Colunas acrescentadas em relação ao item 4.8.2:
--   senha_hash   -> a classe Usuario (Figura 9) e as telas de
--                   Cadastro e Login exigem senha; a tabela
--                   original não tinha o campo.
--   periodo      -> o UC01 lista Período como obrigatório.
--   instituicao  -> campo presente no protótipo (Figura 3).
--   telefone     -> campo presente no protótipo (Figura 3).
--   ativo        -> UC01 passos 5 e 6 (ativação por e-mail).
--   criado_em    -> auditoria.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS estudantes (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome         VARCHAR(100) NOT NULL,
    cpf          VARCHAR(11)  UNIQUE NOT NULL,
    curso        VARCHAR(50)  NOT NULL,
    email_if     VARCHAR(100) UNIQUE NOT NULL,
    senha_hash   VARCHAR(255) NOT NULL,
    periodo      SMALLINT     NOT NULL CHECK (periodo BETWEEN 1 AND 12),
    instituicao  VARCHAR(100) NOT NULL,
    telefone     VARCHAR(11),
    ativo        BOOLEAN      NOT NULL DEFAULT TRUE,
    criado_em    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- empresas  (igual ao item 4.8.2, + senha_hash e auditoria)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS empresas (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    razao_social   VARCHAR(100) NOT NULL,
    cnpj           VARCHAR(14)  UNIQUE NOT NULL,
    nome_fantasia  VARCHAR(100),
    setor          VARCHAR(60),
    email_contato  VARCHAR(100) UNIQUE NOT NULL,
    telefone       VARCHAR(11),
    senha_hash     VARCHAR(255) NOT NULL,
    criado_em      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- vagas  (igual ao item 4.8.2, + estados da Figura 11)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vagas (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id      UUID REFERENCES empresas (id) NOT NULL,
    titulo          VARCHAR(100) NOT NULL,
    tipo            VARCHAR(20) CHECK (tipo IN ('Estagio', 'Jovem Aprendiz')),
    descricao       TEXT,
    requisitos      TEXT,
    remuneracao     DECIMAL(10, 2),
    localizacao     VARCHAR(100),
    situacao        VARCHAR(20) NOT NULL DEFAULT 'Rascunho'
                    CHECK (situacao IN ('Rascunho', 'Ativa', 'EmSelecao',
                                        'Finalizada', 'Cancelada')),
    prazo_inscricao DATE,
    data_publicacao TIMESTAMPTZ
);

-- ------------------------------------------------------------
-- candidaturas  (igual ao item 4.8.2)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS candidaturas (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estudante_id   UUID REFERENCES estudantes (id) NOT NULL,
    vaga_id        UUID REFERENCES vagas (id) NOT NULL,
    data_inscricao TIMESTAMP DEFAULT now(),
    status         VARCHAR(20) DEFAULT 'Pendente'
                   CHECK (status IN ('Pendente', 'Entrevista', 'Finalizado')),
    UNIQUE (estudante_id, vaga_id)
);

-- Índices para a busca e a recomendação de vagas (RN-03: 3 segundos)
CREATE INDEX IF NOT EXISTS idx_vagas_situacao ON vagas (situacao);
CREATE INDEX IF NOT EXISTS idx_vagas_tipo ON vagas (tipo);
CREATE INDEX IF NOT EXISTS idx_candidaturas_estudante ON candidaturas (estudante_id);
