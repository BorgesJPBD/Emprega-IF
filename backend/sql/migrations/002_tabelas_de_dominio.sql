-- ============================================================
-- 002 - Tabelas de domínio: setores e áreas
--
-- Antes, empresas.setor e vagas.area eram texto livre, e só a API
-- conferia se o valor era um dos aceitos. Agora cada valor existe uma
-- única vez numa tabela própria e é referenciado por chave
-- estrangeira: o próprio banco recusa um setor ou uma área
-- inexistente, e renomear um valor passa a ser um UPDATE de uma linha.
-- ============================================================

CREATE TABLE setores (
    id    SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome  VARCHAR(60) NOT NULL UNIQUE
);

INSERT INTO setores (nome) VALUES
    ('Tecnologia da Informação'), ('Educação'), ('Saúde'), ('Indústria'),
    ('Comércio'), ('Serviços'), ('Agronegócio'), ('Financeiro'),
    ('Logística'), ('Construção Civil'), ('Outro');

CREATE TABLE areas (
    id    SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome  VARCHAR(40) NOT NULL UNIQUE
);

INSERT INTO areas (nome) VALUES
    ('Tecnologia'), ('Administrativo'), ('Marketing'), ('Design'),
    ('Vendas'), ('Recursos Humanos'), ('Engenharia'), ('Logística'),
    ('Outra');

-- ---------- empresas.setor  ->  empresas.setor_id ----------
ALTER TABLE empresas ADD COLUMN setor_id SMALLINT REFERENCES setores (id);

UPDATE empresas e
   SET setor_id = COALESCE(
         (SELECT s.id FROM setores s WHERE s.nome = e.setor),
         (SELECT s.id FROM setores s WHERE s.nome = 'Outro'))
 WHERE e.setor IS NOT NULL;

ALTER TABLE empresas DROP COLUMN setor;

-- ---------- vagas.area  ->  vagas.area_id ----------
ALTER TABLE vagas ADD COLUMN area_id SMALLINT REFERENCES areas (id);

UPDATE vagas v
   SET area_id = COALESCE(
         (SELECT a.id FROM areas a WHERE a.nome = v.area),
         (SELECT a.id FROM areas a WHERE a.nome = 'Outra'))
 WHERE v.area IS NOT NULL;

ALTER TABLE vagas DROP COLUMN area;

-- índices nas chaves estrangeiras (o PostgreSQL não cria sozinho)
CREATE INDEX idx_empresas_setor ON empresas (setor_id);
CREATE INDEX idx_vagas_area     ON vagas (area_id);
