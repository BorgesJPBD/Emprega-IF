-- ============================================================
-- 008 - Desistência da candidatura
--
-- O estudante pode desistir enquanto a candidatura está em andamento.
-- Desistente e Finalizado são estados finais. O histórico de status
-- continua sendo gravado pelo trigger da migration 005.
-- ============================================================

ALTER TABLE candidaturas DROP CONSTRAINT IF EXISTS candidaturas_status_check;
ALTER TABLE candidaturas
    ADD CONSTRAINT ck_candidaturas_status
    CHECK (status IN ('Pendente', 'Entrevista', 'Finalizado', 'Desistente'));

-- O trigger tg_candidaturas_andamento continua ligado; só a função muda.
CREATE OR REPLACE FUNCTION fn_candidaturas_andamento() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.status IS DISTINCT FROM OLD.status AND NOT (
           (OLD.status = 'Pendente'   AND NEW.status IN ('Entrevista', 'Finalizado', 'Desistente'))
        OR (OLD.status = 'Entrevista' AND NEW.status IN ('Finalizado', 'Desistente'))
    ) THEN
        RAISE EXCEPTION 'Não é possível mudar a candidatura de "%" para "%".',
            OLD.status, NEW.status
            USING ERRCODE = 'P0001';
    END IF;
    RETURN NEW;
END;
$$;

-- Painel: quem desistiu deixa de contar nas candidaturas em andamento
-- e ganha contagem própria (coluna nova no fim, como o PostgreSQL exige).
CREATE OR REPLACE VIEW vw_painel_vagas AS
SELECT v.id,
       v.empresa_id,
       v.titulo,
       v.tipo,
       v.situacao,
       v.data_publicacao,
       v.prazo_inscricao,
       count(c.id) FILTER (WHERE c.status <> 'Desistente') AS total_candidaturas,
       count(c.id) FILTER (WHERE c.status = 'Pendente')    AS pendentes,
       count(c.id) FILTER (WHERE c.status = 'Entrevista')  AS em_entrevista,
       count(c.id) FILTER (WHERE c.status = 'Finalizado')  AS finalizadas,
       count(c.id) FILTER (WHERE c.status = 'Desistente')  AS desistentes
  FROM vagas v
  LEFT JOIN candidaturas c ON c.vaga_id = v.id
 GROUP BY v.id;