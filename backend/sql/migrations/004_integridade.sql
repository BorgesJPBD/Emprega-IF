-- ============================================================
-- 004 - Integridade: tipos, obrigatoriedade, formatos e exclusões
--
-- Regras que antes só a API garantia passam a valer também no banco.
-- Assim, um INSERT feito por fora da API (pgAdmin, script, outra
-- aplicação) não consegue gravar dado inválido.
-- ============================================================

-- ---------- data com fuso horário ----------
-- As demais datas do banco são TIMESTAMPTZ; esta era TIMESTAMP (sem
-- fuso). Os valores antigos foram gravados em UTC (fuso do servidor).
ALTER TABLE candidaturas
    ALTER COLUMN data_inscricao TYPE TIMESTAMPTZ USING data_inscricao AT TIME ZONE 'UTC',
    ALTER COLUMN data_inscricao SET NOT NULL,
    ALTER COLUMN status SET NOT NULL;

ALTER TABLE vagas ALTER COLUMN tipo SET NOT NULL;

-- ---------- formatos (só dígitos, e-mail minúsculo) ----------
ALTER TABLE estudantes
    ADD CONSTRAINT ck_estudantes_cpf      CHECK (cpf ~ '^[0-9]{11}$'),
    ADD CONSTRAINT ck_estudantes_telefone CHECK (telefone ~ '^[0-9]{10,11}$'),
    ADD CONSTRAINT ck_estudantes_email    CHECK (email_if = lower(email_if) AND email_if LIKE '%_@_%');

ALTER TABLE empresas
    ADD CONSTRAINT ck_empresas_cnpj     CHECK (cnpj ~ '^[0-9]{14}$'),
    ADD CONSTRAINT ck_empresas_telefone CHECK (telefone ~ '^[0-9]{10,11}$'),
    ADD CONSTRAINT ck_empresas_email    CHECK (email_contato = lower(email_contato) AND email_contato LIKE '%_@_%');

-- ---------- coerência dos dados da vaga ----------
ALTER TABLE vagas
    ADD CONSTRAINT ck_vagas_remuneracao CHECK (remuneracao >= 0),
    ADD CONSTRAINT ck_vagas_horario     CHECK (horario_saida > horario_entrada),
    ADD CONSTRAINT ck_vagas_prazo       CHECK (prazo_inscricao >= data_publicacao::date);
-- Obs.: um CHECK só reprova quando o resultado é FALSE. Com um dos
-- lados NULL o resultado é NULL e a linha passa: horário e prazo
-- continuam opcionais.

-- ---------- o que acontece ao excluir (ON DELETE) ----------
-- empresa -> vagas: RESTRICT. Empresa com vagas não pode ser apagada,
--   porque levaria junto o histórico de candidaturas de estudantes.
-- vaga -> candidaturas: RESTRICT. Vaga não se apaga: muda de situação
--   para 'Cancelada' ou 'Finalizada' (exclusão lógica).
-- estudante -> candidaturas: CASCADE. Atende o direito de eliminação
--   de dados pessoais (LGPD, art. 18, VI): apagar o estudante apaga
--   as candidaturas dele.
ALTER TABLE vagas
    DROP CONSTRAINT vagas_empresa_id_fkey,
    ADD CONSTRAINT fk_vagas_empresa
        FOREIGN KEY (empresa_id) REFERENCES empresas (id) ON DELETE RESTRICT;

ALTER TABLE candidaturas
    DROP CONSTRAINT candidaturas_vaga_id_fkey,
    DROP CONSTRAINT candidaturas_estudante_id_fkey,
    ADD CONSTRAINT fk_candidaturas_vaga
        FOREIGN KEY (vaga_id) REFERENCES vagas (id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_candidaturas_estudante
        FOREIGN KEY (estudante_id) REFERENCES estudantes (id) ON DELETE CASCADE;
