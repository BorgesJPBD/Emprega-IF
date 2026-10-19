-- ============================================================
-- 003 - Primeira Forma Normal (1FN) nas listas da vaga
--
-- requisitos, diferenciais e beneficios eram guardados como um único
-- texto com um item por linha: um atributo multivalorado, o que fere
-- a 1FN (valores atômicos). Cada lista vira uma tabela:
--
--   vaga_requisitos    1:N  -> cada requisito pertence a uma vaga
--   vaga_diferenciais  1:N  -> idem
--   beneficios         N:N  -> o mesmo benefício ("Vale-transporte")
--   vaga_beneficios           aparece em várias vagas; guardá-lo uma
--                             vez evita repetição e grafias diferentes
--
-- `ordem` preserva a sequência em que a empresa digitou os itens.
-- ON DELETE CASCADE: a lista não faz sentido sem a vaga dona dela.
-- ============================================================

CREATE TABLE vaga_requisitos (
    vaga_id    UUID     NOT NULL REFERENCES vagas (id) ON DELETE CASCADE,
    ordem      SMALLINT NOT NULL CHECK (ordem >= 1),
    descricao  VARCHAR(300) NOT NULL CHECK (btrim(descricao) <> ''),
    PRIMARY KEY (vaga_id, ordem)
);

CREATE TABLE vaga_diferenciais (
    vaga_id    UUID     NOT NULL REFERENCES vagas (id) ON DELETE CASCADE,
    ordem      SMALLINT NOT NULL CHECK (ordem >= 1),
    descricao  VARCHAR(300) NOT NULL CHECK (btrim(descricao) <> ''),
    PRIMARY KEY (vaga_id, ordem)
);

CREATE TABLE beneficios (
    id    INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome  VARCHAR(80) NOT NULL
);
-- "Vale-transporte" e "vale-transporte" são o mesmo benefício
CREATE UNIQUE INDEX uq_beneficios_nome ON beneficios (lower(nome));

CREATE TABLE vaga_beneficios (
    vaga_id       UUID    NOT NULL REFERENCES vagas (id) ON DELETE CASCADE,
    beneficio_id  INTEGER NOT NULL REFERENCES beneficios (id) ON DELETE RESTRICT,
    PRIMARY KEY (vaga_id, beneficio_id)
);
-- a PK (vaga_id, beneficio_id) já atende buscas por vaga; este índice
-- atende o caminho inverso ("quais vagas oferecem este benefício?")
CREATE INDEX idx_vaga_beneficios_beneficio ON vaga_beneficios (beneficio_id);

-- ---------- migra o que já estava gravado como texto ----------
-- row_number() roda depois do WHERE: linhas em branco são descartadas
-- antes da numeração, então a ordem fica 1, 2, 3... sem buracos.
INSERT INTO vaga_requisitos (vaga_id, ordem, descricao)
SELECT v.id,
       row_number() OVER (PARTITION BY v.id ORDER BY item.n),
       left(btrim(item.texto), 300)
  FROM vagas v,
       regexp_split_to_table(v.requisitos, E'\n') WITH ORDINALITY AS item (texto, n)
 WHERE btrim(item.texto) <> '';

INSERT INTO vaga_diferenciais (vaga_id, ordem, descricao)
SELECT v.id,
       row_number() OVER (PARTITION BY v.id ORDER BY item.n),
       left(btrim(item.texto), 300)
  FROM vagas v,
       regexp_split_to_table(v.diferenciais, E'\n') WITH ORDINALITY AS item (texto, n)
 WHERE btrim(item.texto) <> '';

INSERT INTO beneficios (nome)
SELECT DISTINCT ON (lower(btrim(item))) left(btrim(item), 80)
  FROM vagas v, regexp_split_to_table(v.beneficios, E'\n') AS item
 WHERE btrim(item) <> ''
ON CONFLICT DO NOTHING;

INSERT INTO vaga_beneficios (vaga_id, beneficio_id)
SELECT DISTINCT v.id, b.id
  FROM vagas v
 CROSS JOIN LATERAL regexp_split_to_table(v.beneficios, E'\n') AS item
  JOIN beneficios b ON lower(b.nome) = lower(left(btrim(item), 80))
 WHERE btrim(item) <> '';

ALTER TABLE vagas
    DROP COLUMN requisitos,
    DROP COLUMN diferenciais,
    DROP COLUMN beneficios;
