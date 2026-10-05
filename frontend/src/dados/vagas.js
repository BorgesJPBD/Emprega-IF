import { FileText, Monitor, Palette, ShoppingBag, TrendingUp, Users } from "lucide-react";

/* Dados de exemplo (as 6 vagas do Figma, agora com os detalhes da página da vaga).
   Quando o backend tiver o endpoint de vagas, troque este arquivo por uma
   chamada à API mantendo os mesmos campos. Datas em AAAA-MM-DD. */
export const VAGAS = [
  {
    id: 1, titulo: "Estágio em Desenvolvimento Web", empresa: "Tech Solutions", tipo: "Estágio", area: "Tecnologia",
    local: "São Paulo - SP", modalidade: "Híbrido", horario: "8:00 às 14:00", cargaHoraria: "30h/semana", valor: 1200,
    numeroVagas: 2, publicadaEm: "2026-09-28", prazo: "2026-10-30", Icone: Monitor,
    descricao: "Você vai atuar ao lado do time de produto, desenvolvendo e dando manutenção em telas e APIs de um sistema usado por clientes de varejo. A rotina inclui revisão de código com um desenvolvedor sênior, reuniões semanais com o time e a entrega de pequenas funcionalidades desde as primeiras semanas.",
    requisitos: ["Cursando Análise e Desenvolvimento de Sistemas, Ciência da Computação ou áreas afins", "A partir do 3º período", "Noções de HTML, CSS e JavaScript", "Vontade de aprender e de trabalhar em equipe"],
    diferenciais: ["Conhecimento de React ou Node.js", "Familiaridade com Git e GitHub", "Projetos próprios ou de curso para mostrar"],
    beneficios: ["Vale-transporte", "Vale-refeição", "Recesso remunerado", "Mentoria técnica"],
  },
  {
    id: 2, titulo: "Jovem Aprendiz — Administrativo", empresa: "Empresa ABC", tipo: "Jovem aprendiz", area: "Administrativo",
    local: "Rio de Janeiro - RJ", modalidade: "Presencial", horario: "13:00 às 17:00", cargaHoraria: "20h/semana", valor: 800,
    numeroVagas: 3, publicadaEm: "2026-09-30", prazo: "2026-10-25", Icone: FileText,
    descricao: "Você vai apoiar a rotina do setor administrativo: organização de documentos, atendimento de ligações e e-mails, lançamento de informações em planilhas e apoio às demais áreas. O programa inclui capacitação teórica em paralelo ao trabalho, conforme a legislação de aprendizagem.",
    requisitos: ["Idade entre 14 e 24 anos", "Estar matriculado e frequentando a escola", "Boa comunicação e organização", "Conhecimentos básicos de informática"],
    diferenciais: ["Familiaridade com planilhas e editor de texto", "Curso técnico em andamento"],
    beneficios: ["Vale-transporte", "Vale-refeição", "Curso de capacitação"],
  },
  {
    id: 3, titulo: "Estágio em Marketing Digital", empresa: "Agência Criativa", tipo: "Estágio", area: "Marketing",
    local: "Belo Horizonte - MG", modalidade: "Híbrido", horario: "9:00 às 15:00", cargaHoraria: "30h/semana", valor: 1000,
    numeroVagas: 1, publicadaEm: "2026-10-01", prazo: "2026-11-05", Icone: TrendingUp,
    descricao: "Você vai ajudar a planejar, produzir e acompanhar campanhas nas redes sociais de clientes da agência, analisando métricas semanais e sugerindo melhorias ao time de conteúdo.",
    requisitos: ["Cursando Marketing, Publicidade, Comunicação ou áreas afins", "Boa escrita e senso estético", "Familiaridade com redes sociais como ferramenta de trabalho"],
    diferenciais: ["Noções de Canva ou edição de vídeo", "Conhecimento de Google Analytics ou Meta Ads"],
    beneficios: ["Vale-transporte", "Auxílio-internet", "Recesso remunerado"],
  },
  {
    id: 4, titulo: "Estágio em Design UX/UI", empresa: "Design Studio", tipo: "Estágio", area: "Design",
    local: "São Paulo - SP", modalidade: "Remoto", horario: "9:00 às 15:00", cargaHoraria: "30h/semana", valor: 1100,
    numeroVagas: 1, publicadaEm: "2026-09-25", prazo: "2026-10-20", Icone: Palette,
    descricao: "Você vai participar de pesquisas com usuários, desenhar fluxos e telas no Figma e validar protótipos com o time de desenvolvimento, em projetos para empresas de diferentes setores.",
    requisitos: ["Cursando Design, Sistemas de Informação ou áreas afins", "Conhecimento básico de Figma", "Interesse por pesquisa com usuários"],
    diferenciais: ["Portfólio com estudos de caso", "Noções de acessibilidade web"],
    beneficios: ["Auxílio-internet", "Horário flexível", "Recesso remunerado"],
  },
  {
    id: 5, titulo: "Jovem Aprendiz — Vendas", empresa: "Varejo SA", tipo: "Jovem aprendiz", area: "Vendas",
    local: "Curitiba - PR", modalidade: "Presencial", horario: "14:00 às 18:00", cargaHoraria: "20h/semana", valor: 850,
    numeroVagas: 4, publicadaEm: "2026-10-02", prazo: "2026-11-10", Icone: ShoppingBag,
    descricao: "Você vai acompanhar a equipe de vendas da loja, aprendendo a atender clientes, organizar a exposição dos produtos e registrar pedidos no sistema, com capacitação ao longo do contrato.",
    requisitos: ["Idade entre 14 e 24 anos", "Estar matriculado e frequentando a escola", "Boa comunicação e simpatia no atendimento"],
    diferenciais: ["Experiência em voluntariado ou projetos escolares", "Facilidade com números"],
    beneficios: ["Vale-transporte", "Vale-refeição", "Desconto em compras"],
  },
  {
    id: 6, titulo: "Estágio em Recursos Humanos", empresa: "RH Consultoria", tipo: "Estágio", area: "Recursos Humanos",
    local: "Brasília - DF", modalidade: "Presencial", horario: "8:00 às 14:00", cargaHoraria: "30h/semana", valor: 1150,
    numeroVagas: 1, publicadaEm: "2026-09-29", prazo: "2026-10-28", Icone: Users,
    descricao: "Você vai apoiar os processos de recrutamento e seleção: triagem de currículos, agendamento de entrevistas, contato com candidatos e atualização do banco de talentos.",
    requisitos: ["Cursando Psicologia, Administração, Gestão de RH ou áreas afins", "Boa comunicação e discrição com informações", "Organização para lidar com agenda e prazos"],
    diferenciais: ["Noções de legislação trabalhista", "Conhecimento de ferramentas de recrutamento"],
    beneficios: ["Vale-transporte", "Vale-refeição", "Recesso remunerado"],
  },
];