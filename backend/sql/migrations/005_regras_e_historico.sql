-- ============================================================
-- 005 - Regras de negócio no banco (triggers) e histórico de status
--
-- As regras abaixo também são conferidas pela API, mas aqui viram
-- garantia: qualquer gravação, venha de onde vier, passa por elas.
-- Mensagens de erro em português porque chegam até a tela.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Ciclo de vida da vaga (diagrama de estados, Figura 11)
--
--   Rascunho ──> Ativa ──> EmSelecao ──> Finalizada
--       │          │           │
--       └──────────┴───────────┴──────> Cancelada
--
-- Finalizada e Cancelada são estados finais. Também preenche
-- data_publicacao na primeira vez que a vaga fica Ativa.
-- ------------------------------------------------------------
CREATE FUNCTION fn_vagas_ciclo_de_vida() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND NEW.situacao IS DISTINCT FROM OLD.situacao THEN
        IF NOT (
               (OLD.situacao = 'Rascunho'  AND NEW.situacao IN ('Ativa', 'Cancelada'))
            OR (OLD.situacao = 'Ativa'     AND NEW.situacao IN ('EmSelecao', 'Cancelada'))
            OR (OLD.situacao = 'EmSelecao' AND NEW.situacao IN ('Finalizada', 'Cancelada'))
        ) THEN
            RAISE EXCEPTION 'Não é possível mudar a vaga de "%" para "%".',
                OLD.situacao, NEW.situacao
                USING ERRCODE = 'P0001';
        END IF;
    END IF;

    IF NEW.situacao = 'Ativa' AND NEW.data_publicacao IS NULL THEN
        NEW.data_publicacao := now();
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER tg_vagas_ciclo_de_vida
    BEFORE INSERT OR UPDATE OF situacao ON vagas
    FOR EACH ROW EXECUTE FUNCTION fn_vagas_ciclo_de_vida();

-- ------------------------------------------------------------
-- 2. Candidatura só em vaga aberta, por estudante ativo
-- ------------------------------------------------------------
CREATE FUNCTION fn_candidaturas_validar() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
    v_situacao  vagas.situacao%TYPE;
    v_prazo     vagas.prazo_inscricao%TYPE;
BEGIN
    SELECT situacao, prazo_inscricao INTO v_situacao, v_prazo
      FROM vagas WHERE id = NEW.vaga_id;

    IF v_situacao IS DISTINCT FROM 'Ativa' OR v_prazo < CURRENT_DATE THEN
        RAISE EXCEPTION 'As inscrições para esta vaga estão encerradas.'
            USING ERRCODE = 'P0001';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM estudantes WHERE id = NEW.estudante_id AND ativo) THEN
        RAISE EXCEPTION 'Cadastro de estudante não ativado.'
            USING ERRCODE = 'P0001';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER tg_candidaturas_validar
    BEFORE INSERT ON candidaturas
    FOR EACH ROW EXECUTE FUNCTION fn_candidaturas_validar();

-- ------------------------------------------------------------
-- 3. Andamento da candidatura
--
--   Pendente ──> Entrevista ──> Finalizado
--       └───────────────────────────^
-- ------------------------------------------------------------
CREATE FUNCTION fn_candidaturas_andamento() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.status IS DISTINCT FROM OLD.status AND NOT (
           (OLD.status = 'Pendente'   AND NEW.status IN ('Entrevista', 'Finalizado'))
        OR (OLD.status = 'Entrevista' AND NEW.status = 'Finalizado')
    ) THEN
        RAISE EXCEPTION 'Não é possível mudar a candidatura de "%" para "%".',
            OLD.status, NEW.status
            USING ERRCODE = 'P0001';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER tg_candidaturas_andamento
    BEFORE UPDATE OF status ON candidaturas
    FOR EACH ROW EXECUTE FUNCTION fn_candidaturas_andamento();

-- ------------------------------------------------------------
-- 4. Histórico de status (auditoria)
--
-- Cada inserção ou mudança de status de uma candidatura gera uma linha
-- aqui, gravada pelo próprio banco. A aplicação não precisa lembrar de
-- registrar, e não tem como "esquecer".
-- ------------------------------------------------------------
CREATE TABLE candidatura_historico (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    candidatura_id   UUID NOT NULL REFERENCES candidaturas (id) ON DELETE CASCADE,
    status_anterior  VARCHAR(20),               -- NULL na criação
    status_novo      VARCHAR(20) NOT NULL,
    alterado_em      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_historico_candidatura ON candidatura_historico (candidatura_id, alterado_em);

CREATE FUNCTION fn_candidaturas_historico() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO candidatura_historico (candidatura_id, status_anterior, status_novo, alterado_em)
        VALUES (NEW.id, NULL, NEW.status, NEW.data_inscricao);
    ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
        INSERT INTO candidatura_historico (candidatura_id, status_anterior, status_novo)
        VALUES (NEW.id, OLD.status, NEW.status);
    END IF;
    RETURN NULL;   -- AFTER trigger: o valor de retorno é ignorado
END;
$$;

CREATE TRIGGER tg_candidaturas_historico
    AFTER INSERT OR UPDATE OF status ON candidaturas
    FOR EACH ROW EXECUTE FUNCTION fn_candidaturas_historico();

-- candidaturas que já existiam ganham o registro de criação
INSERT INTO candidatura_historico (candidatura_id, status_anterior, status_novo, alterado_em)
SELECT id, NULL, status, data_inscricao FROM candidaturas;
