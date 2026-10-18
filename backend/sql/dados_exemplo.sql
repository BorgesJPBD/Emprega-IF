-- ============================================================
-- Emprega IF - dados de exemplo (as 6 vagas do Figma)
--
-- Opcional: serve para a Home e a página de Vagas não aparecerem
-- vazias durante o desenvolvimento e a apresentação.
--
-- No Docker roda sozinho na criação do banco. Na instalação local:
--   psql -U postgres -d emprega_if -f sql/dados_exemplo.sql
--
-- Todas as empresas de exemplo entram com a senha: empresa123
-- (ex.: login rh@techsolutions.exemplo.com / empresa123)
--
-- Os prazos são relativos à data de hoje, para as vagas não
-- aparecerem como encerradas. Rodar de novo não duplica nada.
-- ============================================================

INSERT INTO empresas
    (razao_social, nome_fantasia, cnpj, setor, email_contato, telefone, senha_hash)
VALUES
    ('Tech Solutions Ltda',   'Tech Solutions',  '11222333000181', 'Tecnologia da Informação', 'rh@techsolutions.exemplo.com',  '11999990001', '$2b$12$gBCFZV/mglXVzlF85YGWT.pTN.EHwcYt4KBndZm9Dk.6DUZ5S3MtG'),
    ('Empresa ABC Ltda',      'Empresa ABC',     '11222333000262', 'Serviços',                 'rh@empresaabc.exemplo.com',     '21999990002', '$2b$12$gBCFZV/mglXVzlF85YGWT.pTN.EHwcYt4KBndZm9Dk.6DUZ5S3MtG'),
    ('Agência Criativa Ltda', 'Agência Criativa','11222333000343', 'Serviços',                 'rh@agenciacriativa.exemplo.com','31999990003', '$2b$12$gBCFZV/mglXVzlF85YGWT.pTN.EHwcYt4KBndZm9Dk.6DUZ5S3MtG'),
    ('Design Studio Ltda',    'Design Studio',   '11222333000424', 'Serviços',                 'rh@designstudio.exemplo.com',   '11999990004', '$2b$12$gBCFZV/mglXVzlF85YGWT.pTN.EHwcYt4KBndZm9Dk.6DUZ5S3MtG'),
    ('Varejo SA',             'Varejo SA',       '11222333000505', 'Comércio',                 'rh@varejosa.exemplo.com',       '41999990005', '$2b$12$gBCFZV/mglXVzlF85YGWT.pTN.EHwcYt4KBndZm9Dk.6DUZ5S3MtG'),
    ('RH Consultoria Ltda',   'RH Consultoria',  '11222333000696', 'Serviços',                 'rh@rhconsultoria.exemplo.com',  '61999990006', '$2b$12$gBCFZV/mglXVzlF85YGWT.pTN.EHwcYt4KBndZm9Dk.6DUZ5S3MtG')
ON CONFLICT (cnpj) DO NOTHING;

-- Cada vaga só entra se a empresa ainda não tiver uma vaga com o mesmo título.
INSERT INTO vagas
    (empresa_id, titulo, tipo, area, localizacao, modalidade,
     horario_entrada, horario_saida, carga_horaria, remuneracao, numero_vagas,
     descricao, requisitos, diferenciais, beneficios,
     situacao, data_publicacao, prazo_inscricao)
SELECT e.id, v.titulo, v.tipo, v.area, v.localizacao, v.modalidade,
       v.entrada::time, v.saida::time, v.carga, v.remuneracao, v.numero_vagas,
       v.descricao, v.requisitos, v.diferenciais, v.beneficios,
       'Ativa', now() - (v.publicada_ha || ' days')::interval,
       CURRENT_DATE + v.prazo_em
  FROM (VALUES
    ('11222333000181', 'Estágio em Desenvolvimento Web', 'Estagio', 'Tecnologia', 'São Paulo - SP', 'Híbrido',
     '08:00', '14:00', '30h/semana', 1200.00, 2, 10, 25,
     'Você vai atuar ao lado do time de produto, desenvolvendo e dando manutenção em telas e APIs de um sistema usado por clientes de varejo. A rotina inclui revisão de código com um desenvolvedor sênior, reuniões semanais com o time e a entrega de pequenas funcionalidades desde as primeiras semanas.',
     E'Cursando Análise e Desenvolvimento de Sistemas, Ciência da Computação ou áreas afins\nA partir do 3º período\nNoções de HTML, CSS e JavaScript\nVontade de aprender e de trabalhar em equipe',
     E'Conhecimento de React ou Node.js\nFamiliaridade com Git e GitHub\nProjetos próprios ou de curso para mostrar',
     E'Vale-transporte\nVale-refeição\nRecesso remunerado\nMentoria técnica'),

    ('11222333000262', 'Jovem Aprendiz — Administrativo', 'Jovem Aprendiz', 'Administrativo', 'Rio de Janeiro - RJ', 'Presencial',
     '13:00', '17:00', '20h/semana', 800.00, 3, 8, 20,
     'Você vai apoiar a rotina do setor administrativo: organização de documentos, atendimento de ligações e e-mails, lançamento de informações em planilhas e apoio às demais áreas. O programa inclui capacitação teórica em paralelo ao trabalho, conforme a legislação de aprendizagem.',
     E'Idade entre 14 e 24 anos\nEstar matriculado e frequentando a escola\nBoa comunicação e organização\nConhecimentos básicos de informática',
     E'Familiaridade com planilhas e editor de texto\nCurso técnico em andamento',
     E'Vale-transporte\nVale-refeição\nCurso de capacitação'),

    ('11222333000343', 'Estágio em Marketing Digital', 'Estagio', 'Marketing', 'Belo Horizonte - MG', 'Híbrido',
     '09:00', '15:00', '30h/semana', 1000.00, 1, 7, 30,
     'Você vai ajudar a planejar, produzir e acompanhar campanhas nas redes sociais de clientes da agência, analisando métricas semanais e sugerindo melhorias ao time de conteúdo.',
     E'Cursando Marketing, Publicidade, Comunicação ou áreas afins\nBoa escrita e senso estético\nFamiliaridade com redes sociais como ferramenta de trabalho',
     E'Noções de Canva ou edição de vídeo\nConhecimento de Google Analytics ou Meta Ads',
     E'Vale-transporte\nAuxílio-internet\nRecesso remunerado'),

    ('11222333000424', 'Estágio em Design UX/UI', 'Estagio', 'Design', 'São Paulo - SP', 'Remoto',
     '09:00', '15:00', '30h/semana', 1100.00, 1, 14, 6,
     'Você vai participar de pesquisas com usuários, desenhar fluxos e telas no Figma e validar protótipos com o time de desenvolvimento, em projetos para empresas de diferentes setores.',
     E'Cursando Design, Sistemas de Informação ou áreas afins\nConhecimento básico de Figma\nInteresse por pesquisa com usuários',
     E'Portfólio com estudos de caso\nNoções de acessibilidade web',
     E'Auxílio-internet\nHorário flexível\nRecesso remunerado'),

    ('11222333000505', 'Jovem Aprendiz — Vendas', 'Jovem Aprendiz', 'Vendas', 'Curitiba - PR', 'Presencial',
     '14:00', '18:00', '20h/semana', 850.00, 4, 5, 35,
     'Você vai acompanhar a equipe de vendas da loja, aprendendo a atender clientes, organizar a exposição dos produtos e registrar pedidos no sistema, com capacitação ao longo do contrato.',
     E'Idade entre 14 e 24 anos\nEstar matriculado e frequentando a escola\nBoa comunicação e simpatia no atendimento',
     E'Experiência em voluntariado ou projetos escolares\nFacilidade com números',
     E'Vale-transporte\nVale-refeição\nDesconto em compras'),

    ('11222333000696', 'Estágio em Recursos Humanos', 'Estagio', 'Recursos Humanos', 'Brasília - DF', 'Presencial',
     '08:00', '14:00', '30h/semana', 1150.00, 1, 9, 22,
     'Você vai apoiar os processos de recrutamento e seleção: triagem de currículos, agendamento de entrevistas, contato com candidatos e atualização do banco de talentos.',
     E'Cursando Psicologia, Administração, Gestão de RH ou áreas afins\nBoa comunicação e discrição com informações\nOrganização para lidar com agenda e prazos',
     E'Noções de legislação trabalhista\nConhecimento de ferramentas de recrutamento',
     E'Vale-transporte\nVale-refeição\nRecesso remunerado')
  ) AS v (cnpj, titulo, tipo, area, localizacao, modalidade,
          entrada, saida, carga, remuneracao, numero_vagas, publicada_ha, prazo_em,
          descricao, requisitos, diferenciais, beneficios)
  JOIN empresas e ON e.cnpj = v.cnpj
 WHERE NOT EXISTS (
       SELECT 1 FROM vagas x WHERE x.empresa_id = e.id AND x.titulo = v.titulo
 );
