import PaginaInstitucional from "../componentes/PaginaInstitucional";

const CONTEUDO = {
  etiqueta: "Para empresas",
  titulo: "Contrate os talentos do Instituto Federal",
  subtitulo:
    "Publique suas vagas de estágio e jovem aprendiz diretamente para " +
    "estudantes do IF, com formação técnica e alinhada à sua necessidade.",
  acaoPrincipal: { rotulo: "Criar conta empresarial", para: "/cadastro/empresa" },
  acaoSecundaria: { rotulo: "Publicar vaga", para: "/vagas/nova" },
  numeros: [
    { valor: "0", rotulo: "custo para publicar" },
    { valor: "100%", rotulo: "candidatos do IF" },
    { valor: "2", rotulo: "tipos: estágio e aprendiz" },
  ],
  passos: [
    {
      titulo: "Crie a conta da empresa",
      texto:
        "Informe razão social, CNPJ, setor de atuação e contato. O CNPJ é " +
        "validado no cadastro para garantir a confiabilidade das vagas.",
    },
    {
      titulo: "Publique a vaga",
      texto:
        "Descreva título, tipo, requisitos, remuneração, localização e prazo " +
        "de inscrição. A vaga fica visível para os estudantes elegíveis.",
    },
    {
      titulo: "Gerencie as candidaturas",
      texto:
        "Acompanhe quem se inscreveu e movimente cada candidato pelo processo, " +
        "de pendente a entrevista e finalizado.",
    },
  ],
  beneficios: [
    {
      titulo: "Público certo, sem ruído",
      texto:
        "Sua vaga é vista por estudantes do Instituto Federal, com formação " +
        "técnica na área. Menos triagem de currículo fora do perfil.",
    },
    {
      titulo: "Candidatos qualificados",
      texto:
        "O IF forma nos níveis médio, técnico e superior, com currículo voltado " +
        "à prática profissional desde o início do curso.",
    },
    {
      titulo: "Publicação sem burocracia",
      texto:
        "Um formulário e a vaga entra no ar, já no conjunto que alimenta as " +
        "recomendações automáticas para os estudantes.",
    },
    {
      titulo: "Conformidade",
      texto:
        "A plataforma segue a legislação de estágio e de jovem aprendiz " +
        "vigente no Brasil, e trata os dados conforme a LGPD.",
    },
  ],
  perguntas: [
    {
      pergunta: "Publicar vaga tem custo?",
      resposta:
        "Não. A plataforma é um projeto do Instituto Federal e a publicação é " +
        "gratuita para empresas parceiras.",
    },
    {
      pergunta: "Que tipos de vaga posso publicar?",
      resposta:
        "Estágio e jovem aprendiz. A plataforma é dedicada a primeiras " +
        "oportunidades, então vagas efetivas não se enquadram.",
    },
    {
      pergunta: "Quem vê as vagas publicadas?",
      resposta:
        "Apenas estudantes com cadastro validado por e-mail institucional do IF.",
    },
    {
      pergunta: "Posso encerrar uma vaga antes do prazo?",
      resposta:
        "Sim. A vaga pode ser cancelada a qualquer momento, ou finalizada quando " +
        "o candidato for contratado.",
    },
    {
      pergunta: "Quais dados preciso informar no cadastro?",
      resposta:
        "Razão social, CNPJ, setor de atuação, e-mail corporativo e telefone. " +
        "Nome fantasia e endereço são opcionais.",
    },
  ],
  chamadaFinal: {
    titulo: "Comece a receber candidaturas",
    texto:
      "Crie a conta da sua empresa e publique a primeira vaga para os " +
      "estudantes do Instituto Federal.",
    rotulo: "Criar conta empresarial",
    para: "/cadastro/empresa",
  },
};

export default function ParaEmpresas() {
  return <PaginaInstitucional conteudo={CONTEUDO} />;
}