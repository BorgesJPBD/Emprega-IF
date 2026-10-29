-- ============================================================
-- 007 - Recuperação de senha
--
-- Cada pedido de "Esqueceu a senha?" gera um código de uso único,
-- enviado por e-mail. O banco guarda só o HASH (SHA-256) do código,
-- nunca o código em si: quem tiver acesso ao banco não consegue usar
-- um link pendente. O código vale por 1 hora e só uma vez.
--
-- O pedido pertence a um estudante OU a uma empresa. Em vez de uma
-- coluna genérica "usuario_id" sem chave estrangeira, são duas FKs
-- opcionais e um CHECK que exige exatamente uma delas: assim o banco
-- continua garantindo a integridade referencial, e a exclusão de uma
-- conta apaga junto os pedidos dela (CASCADE).
-- ============================================================

CREATE TABLE redefinicoes_senha (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    estudante_id  UUID REFERENCES estudantes (id) ON DELETE CASCADE,
    empresa_id    UUID REFERENCES empresas (id)   ON DELETE CASCADE,
    token_hash    CHAR(64)    NOT NULL UNIQUE,
    criado_em     TIMESTAMPTZ NOT NULL DEFAULT now(),
    expira_em     TIMESTAMPTZ NOT NULL,
    usado_em      TIMESTAMPTZ,

    CONSTRAINT ck_redefinicao_um_dono
        CHECK (num_nonnulls(estudante_id, empresa_id) = 1),
    CONSTRAINT ck_redefinicao_validade
        CHECK (expira_em > criado_em),
    CONSTRAINT ck_redefinicao_uso
        CHECK (usado_em IS NULL OR usado_em >= criado_em)
);

-- Busca dos pedidos ainda abertos de cada conta (para invalidá-los
-- quando um novo pedido é feito).
CREATE INDEX idx_redefinicoes_estudante ON redefinicoes_senha (estudante_id) WHERE usado_em IS NULL;
CREATE INDEX idx_redefinicoes_empresa   ON redefinicoes_senha (empresa_id)   WHERE usado_em IS NULL;
