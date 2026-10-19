-- ============================================================
-- Emprega IF - dados de exemplo (as 6 vagas do Figma)
--
-- Carregado pela API ao subir quando CARREGAR_DADOS_EXEMPLO=true,
-- depois das migrations. Rodar de novo não duplica nada.
--
-- Todas as empresas de exemplo entram com a senha: empresa123
-- (ex.: login rh@techsolutions.exemplo.com / empresa123)
--
-- Os prazos são relativos à data de hoje, para as vagas não
-- aparecerem como encerradas.
-- ============================================================

INSERT INTO empresas
    (razao_social, nome_fantasia, cnpj, setor_id, email_contato, telefone, senha_hash)
SELECT d.razao_social, d.nome_fantasia, d.cnpj, s.id, d.email, d.telefone,
       '$2b$12$gBCFZV/mglXVzlF85YGWT.pTN.EHwcYt4KBndZm9Dk.6DUZ5S3MtG'
  FROM (VALUES
    ('Tech Solutions Ltda',   'Tech Solutions',   '11222333000181', 'Tecnologia da Informação', 'rh@techsolutions.exemplo.com',   '11999990001'),
    ('Empresa ABC Ltda',      'Empresa ABC',      '11222333000262', 'Serviços',                 'rh@empresaabc.exemplo.com',      '21999990002'),
    ('Agência Criativa Ltda', 'Agência Criativa', '11222333000343', 'Serviços',                 'rh@agenciacriativa.exemplo.com', '31999990003'),
    ('Design Studio Ltda',    'Design Studio',    '11222333000424', 'Serviços',                 'rh@designstudio.exemplo.com',    '11999990004'),
    ('Varejo SA',             'Varejo SA',        '11222333000505', 'Comércio',                 'rh@varejosa.exemplo.com',        '41999990005'),
    ('RH Consultoria Ltda',   'RH Consultoria',   '11222333000696', 'Serviços',                 'rh@rhconsultoria.exemplo.com',   '61999990006')
  ) AS d (razao_social, nome_fantasia, cnpj, setor, email, telefone)
  JOIN setores s ON s.nome = d.setor
ON CONFLICT (cnpj) DO NOTHING;

-- Vagas com as listas (requisitos, diferenciais, benefícios) num único
-- comando: cada CTE grava uma tabela e a seguinte usa os ids devolvidos
-- pelo RETURNING. Uma vaga só entra se a empresa ainda não tiver uma
-- com o mesmo título.
WITH dados (cnpj, titulo, tipo, area, localizacao, modalidade,
            entrada, saida, carga, remuneracao, numero_vagas, publicada_ha, prazo_em,
            descricao, requisitos, diferenciais, beneficios) AS (
  VALUES
    ('11222333000181', 'Estágio em Desenvolvimento Web', 'Estagio', 'Tecnologia', 'São Paulo - SP', 'Híbrido',
     '08:00', '14:00', '30h/semana', 1200.00, 2, 10, 25,
     'Você vai atuar ao lado do time de produto, desenvolvendo e dando manutenção em telas e APIs de um sistema usado por clientes de varejo. A rotina inclui revisão de código com um desenvolvedor sênior, reuniões semanais com o time e a entrega de pequenas funcionalidades desde as primeiras semanas.',
     ARRAY['Cursando Análise e Desenvolvimento de Sistemas, Ciência da Computação ou áreas afins', 'A partir do 3º período', 'Noções de HTML, CSS e JavaScript', 'Vontade de aprender e de trabalhar em equipe'],
     ARRAY['Conhecimento de React ou Node.js', 'Familiaridade com Git e GitHub', 'Projetos próprios ou de curso para mostrar'],
     ARRAY['Vale-transporte', 'Vale-refeição', 'Recesso remunerado', 'Mentoria técnica']),

    ('11222333000262', 'Jovem Aprendiz — Administrativo', 'Jovem Aprendiz', 'Administrativo', 'Rio de Janeiro - RJ', 'Presencial',
     '13:00', '17:00', '20h/semana', 800.00, 3, 8, 20,
     'Você vai apoiar a rotina do setor administrativo: organização de documentos, atendimento de ligações e e-mails, lançamento de informações em planilhas e apoio às demais áreas. O programa inclui capacitação teórica em paralelo ao trabalho, conforme a legislação de aprendizagem.',
     ARRAY['Idade entre 14 e 24 anos', 'Estar matriculado e frequentando a escola', 'Boa comunicação e organização', 'Conhecimentos básicos de informática'],
     ARRAY['Familiaridade com planilhas e editor de texto', 'Curso técnico em andamento'],
     ARRAY['Vale-transporte', 'Vale-refeição', 'Curso de capacitação']),

    ('11222333000343', 'Estágio em Marketing Digital', 'Estagio', 'Marketing', 'Belo Horizonte - MG', 'Híbrido',
     '09:00', '15:00', '30h/semana', 1000.00, 1, 7, 30,
     'Você vai ajudar a planejar, produzir e acompanhar campanhas nas redes sociais de clientes da agência, analisando métricas semanais e sugerindo melhorias ao time de conteúdo.',
     ARRAY['Cursando Marketing, Publicidade, Comunicação ou áreas afins', 'Boa escrita e senso estético', 'Familiaridade com redes sociais como ferramenta de trabalho'],
     ARRAY['Noções de Canva ou edição de vídeo', 'Conhecimento de Google Analytics ou Meta Ads'],
     ARRAY['Vale-transporte', 'Auxílio-internet', 'Recesso remunerado']),

    ('11222333000424', 'Estágio em Design UX/UI', 'Estagio', 'Design', 'São Paulo - SP', 'Remoto',
     '09:00', '15:00', '30h/semana', 1100.00, 1, 14, 6,
     'Você vai participar de pesquisas com usuários, desenhar fluxos e telas no Figma e validar protótipos com o time de desenvolvimento, em projetos para empresas de diferentes setores.',
     ARRAY['Cursando Design, Sistemas de Informação ou áreas afins', 'Conhecimento básico de Figma', 'Interesse por pesquisa com usuários'],
     ARRAY['Portfólio com estudos de caso', 'Noções de acessibilidade web'],
     ARRAY['Auxílio-internet', 'Horário flexível', 'Recesso remunerado']),

    ('11222333000505', 'Jovem Aprendiz — Vendas', 'Jovem Aprendiz', 'Vendas', 'Curitiba - PR', 'Presencial',
     '14:00', '18:00', '20h/semana', 850.00, 4, 5, 35,
     'Você vai acompanhar a equipe de vendas da loja, aprendendo a atender clientes, organizar a exposição dos produtos e registrar pedidos no sistema, com capacitação ao longo do contrato.',
     ARRAY['Idade entre 14 e 24 anos', 'Estar matriculado e frequentando a escola', 'Boa comunicação e simpatia no atendimento'],
     ARRAY['Experiência em voluntariado ou projetos escolares', 'Facilidade com números'],
     ARRAY['Vale-transporte', 'Vale-refeição', 'Desconto em compras']),

    ('11222333000696', 'Estágio em Recursos Humanos', 'Estagio', 'Recursos Humanos', 'Brasília - DF', 'Presencial',
     '08:00', '14:00', '30h/semana', 1150.00, 1, 9, 22,
     'Você vai apoiar os processos de recrutamento e seleção: triagem de currículos, agendamento de entrevistas, contato com candidatos e atualização do banco de talentos.',
     ARRAY['Cursando Psicologia, Administração, Gestão de RH ou áreas afins', 'Boa comunicação e discrição com informações', 'Organização para lidar com agenda e prazos'],
     ARRAY['Noções de legislação trabalhista', 'Conhecimento de ferramentas de recrutamento'],
     ARRAY['Vale-transporte', 'Vale-refeição', 'Recesso remunerado'])
),
novas AS (
    INSERT INTO vagas
        (empresa_id, titulo, tipo, area_id, localizacao, modalidade,
         horario_entrada, horario_saida, carga_horaria, remuneracao, numero_vagas,
         descricao, situacao, data_publicacao, prazo_inscricao)
    SELECT e.id, d.titulo, d.tipo, a.id, d.localizacao, d.modalidade,
           d.entrada::time, d.saida::time, d.carga, d.remuneracao, d.numero_vagas,
           d.descricao, 'Ativa', now() - make_interval(days => d.publicada_ha),
           CURRENT_DATE + d.prazo_em
      FROM dados d
      JOIN empresas e ON e.cnpj = d.cnpj
      JOIN areas a    ON a.nome = d.area
     WHERE NOT EXISTS (
           SELECT 1 FROM vagas x WHERE x.empresa_id = e.id AND x.titulo = d.titulo)
    RETURNING id, empresa_id, titulo
),
ligadas AS (
    SELECT n.id AS vaga_id, d.requisitos, d.diferenciais, d.beneficios
      FROM novas n
      JOIN empresas e ON e.id = n.empresa_id
      JOIN dados d    ON d.cnpj = e.cnpj AND d.titulo = n.titulo
),
requisitos AS (
    INSERT INTO vaga_requisitos (vaga_id, ordem, descricao)
    SELECT l.vaga_id, item.ordem, item.texto
      FROM ligadas l, unnest(l.requisitos) WITH ORDINALITY AS item (texto, ordem)
),
diferenciais AS (
    INSERT INTO vaga_diferenciais (vaga_id, ordem, descricao)
    SELECT l.vaga_id, item.ordem, item.texto
      FROM ligadas l, unnest(l.diferenciais) WITH ORDINALITY AS item (texto, ordem)
),
beneficios_novos AS (
    INSERT INTO beneficios (nome)
    SELECT DISTINCT b FROM dados, unnest(dados.beneficios) AS b
    ON CONFLICT DO NOTHING
    RETURNING id, nome
)
-- Os benefícios gravados neste mesmo comando só aparecem pelo
-- RETURNING (as CTEs enxergam a tabela como estava no início), por
-- isso a união entre os que já existiam e os novos.
INSERT INTO vaga_beneficios (vaga_id, beneficio_id)
SELECT DISTINCT l.vaga_id, b.id
  FROM ligadas l
 CROSS JOIN LATERAL unnest(l.beneficios) AS nome_beneficio
  JOIN (SELECT id, nome FROM beneficios
        UNION
        SELECT id, nome FROM beneficios_novos) b
    ON lower(b.nome) = lower(nome_beneficio);
