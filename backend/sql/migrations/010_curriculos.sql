-- ============================================================
-- 010 - Currículo do estudante (modelo da plataforma)
--
-- O currículo é guardado como dados (JSON), não como arquivo: ocupa
-- poucos KB por estudante e o PDF é gerado na hora pelo navegador.
-- Os limites de tamanho de cada campo são conferidos pela API.
--
-- Uma linha por estudante. ON DELETE CASCADE: se a conta do
-- estudante for excluída, o currículo vai junto (LGPD, art. 18, VI).
-- O próprio estudante também pode apagar o currículo quando quiser.
-- ============================================================

CREATE TABLE curriculos (
    estudante_id   UUID PRIMARY KEY REFERENCES estudantes (id) ON DELETE CASCADE,
    dados          JSONB       NOT NULL,
    atualizado_em  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT ck_curriculos_objeto CHECK (jsonb_typeof(dados) = 'object')
);