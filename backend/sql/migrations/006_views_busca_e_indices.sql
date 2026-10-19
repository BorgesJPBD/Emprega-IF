-- ============================================================
-- 006 - Views, busca textual e revisão de índices
-- ============================================================

-- ------------------------------------------------------------
-- 1. Busca por palavra nas vagas (Full Text Search)
--
-- `busca` é uma coluna GERADA: o PostgreSQL recalcula sozinho a cada
-- INSERT/UPDATE, a partir do título (peso A, mais relevante) e da
-- descrição (peso B). O dicionário 'portuguese' reduz as palavras ao
-- radical (estágio/estágios, desenvolvedor/desenvolvimento), e o
-- unaccent ignora acentos ("estagio" encontra "Estágio").
-- O índice GIN torna a busca rápida mesmo com muitas vagas.
-- ------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS unaccent;

-- unaccent() não é IMMUTABLE (depende de configuração), e coluna gerada
-- e índice exigem funções IMMUTABLE. Esta versão fixa o dicionário.
CREATE FUNCTION sem_acento(texto text) RETURNS text
LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT
RETURN public.unaccent('public.unaccent'::regdictionary, texto);

ALTER TABLE vagas ADD COLUMN busca tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('portuguese', sem_acento(coalesce(titulo, ''))), 'A') ||
    setweight(to_tsvector('portuguese', sem_acento(coalesce(descricao, ''))), 'B')
) STORED;

CREATE INDEX idx_vagas_busca ON vagas USING GIN (busca);

-- ------------------------------------------------------------
-- 2. Revisão de índices
-- ------------------------------------------------------------
-- Redundante: UNIQUE (estudante_id, vaga_id) já cria um índice cuja
-- primeira coluna é estudante_id, e ele atende as mesmas consultas.
DROP INDEX IF EXISTS idx_candidaturas_estudante;

-- Baixa seletividade: tipo tem 2 valores e situacao 5. Um índice que
-- devolve metade da tabela não é usado; o planner prefere ler a tabela.
DROP INDEX IF EXISTS idx_vagas_tipo;
DROP INDEX IF EXISTS idx_vagas_situacao;

-- Índice parcial: só as vagas Ativas, já na ordem da listagem
-- (mais recentes primeiro). Menor e exatamente do formato da consulta.
CREATE INDEX idx_vagas_ativas ON vagas (data_publicacao DESC)
    WHERE situacao = 'Ativa';

-- Painel da empresa: contar candidaturas por vaga.
CREATE INDEX idx_candidaturas_vaga ON candidaturas (vaga_id);

-- ------------------------------------------------------------
-- 3. Views
-- ------------------------------------------------------------

-- Vaga completa, como a aplicação mostra: com empresa, área, listas
-- (em ordem) e situação de inscrição já calculada.
CREATE VIEW vw_vagas AS
SELECT v.id,
       v.titulo,
       v.tipo,
       a.nome                                    AS area,
       v.localizacao,
       v.modalidade,
       v.horario_entrada,
       v.horario_saida,
       v.carga_horaria,
       v.remuneracao,
       v.numero_vagas,
       v.descricao,
       ARRAY(SELECT r.descricao FROM vaga_requisitos r
              WHERE r.vaga_id = v.id ORDER BY r.ordem)            AS requisitos,
       ARRAY(SELECT d.descricao FROM vaga_diferenciais d
              WHERE d.vaga_id = v.id ORDER BY d.ordem)            AS diferenciais,
       ARRAY(SELECT b.nome FROM vaga_beneficios vb
               JOIN beneficios b ON b.id = vb.beneficio_id
              WHERE vb.vaga_id = v.id ORDER BY b.nome)            AS beneficios,
       v.situacao,
       (v.situacao = 'Ativa'
        AND (v.prazo_inscricao IS NULL OR v.prazo_inscricao >= CURRENT_DATE))
                                                 AS inscricoes_abertas,
       v.data_publicacao,
       v.prazo_inscricao,
       v.empresa_id,
       COALESCE(e.nome_fantasia, e.razao_social) AS empresa_nome,
       v.busca
  FROM vagas v
  JOIN empresas e ON e.id = v.empresa_id
  LEFT JOIN areas a ON a.id = v.area_id;

-- Painel da empresa: cada vaga com a contagem de candidaturas por status.
CREATE VIEW vw_painel_vagas AS
SELECT v.id,
       v.empresa_id,
       v.titulo,
       v.tipo,
       v.situacao,
       v.data_publicacao,
       v.prazo_inscricao,
       count(c.id)                                         AS total_candidaturas,
       count(c.id) FILTER (WHERE c.status = 'Pendente')    AS pendentes,
       count(c.id) FILTER (WHERE c.status = 'Entrevista')  AS em_entrevista,
       count(c.id) FILTER (WHERE c.status = 'Finalizado')  AS finalizadas
  FROM vagas v
  LEFT JOIN candidaturas c ON c.vaga_id = v.id
 GROUP BY v.id;

-- Números da página inicial.
CREATE VIEW vw_estatisticas AS
SELECT (SELECT count(*) FROM estudantes WHERE ativo)  AS estudantes,
       (SELECT count(*) FROM empresas)                AS empresas,
       (SELECT count(*) FROM vagas
         WHERE situacao = 'Ativa'
           AND (prazo_inscricao IS NULL OR prazo_inscricao >= CURRENT_DATE))
                                                      AS vagas_abertas,
       (SELECT count(*) FROM candidaturas)            AS candidaturas;
