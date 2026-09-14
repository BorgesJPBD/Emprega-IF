import PaginaInstitucional from "../componentes/PaginaInstitucional";

const CONTEUDO = {
  etiqueta: "Para estudantes",
  titulo: "Sua primeira oportunidade começa aqui",
  subtitulo:
    "Vagas de estágio e jovem aprendiz reunidas num lugar só, pensadas para quem " +
    "está começando. Sem currículo complicado e sem burocracia.",
  acaoPrincipal: { rotulo: "Criar meu perfil", para: "/cadastro/estudante" },
  acaoSecundaria: { rotulo: "Ver vagas", para: "/vagas" },
  numeros: [
    { valor: "100%", rotulo: "gratuito para estudantes" },
    { valor: "3", rotulo: "níveis: médio, técnico e superior" },
    { valor: "1", rotulo: "clique para se candidatar" },
  ],
  passos: [
    {
      titulo: "Crie seu perfil",
      texto:
        "Informe seu curso, período e e-mail institucional. Leva menos de dois " +
        "minutos e não exige experiência anterior.",
    },
    {
      titulo: "Receba recomendações",
      texto:
        "O sistema cruza seu perfil com as vagas publicadas e mostra primeiro " +
        "as mais compatíveis com sua área e seu nível.",
    },
    {
      titulo: "Candidate-se",
      texto:
        "Achou uma vaga interessante, clique para se candidatar e acompanhe o " +
        "andamento: pendente, entrevista ou finalizado.",
    },
  ],
  beneficios: [
    {
      titulo: "Feito para quem está começando",
      texto:
        "As plataformas comuns são desenhadas para quem já tem carreira. Aqui o " +
        "perfil é simples e nenhuma vaga exige experiência que você ainda não teve.",
    },
    {
      titulo: "Exclusivo do Instituto Federal",
      texto:
        "O cadastro é validado pelo e-mail institucional, então você concorre " +
        "apenas com outros estudantes do IF.",
    },
    {
      titulo: "Tudo num lugar só",
      texto:
        "Chega de procurar oportunidade espalhada entre mural, grupo de WhatsApp " +
        "e rede social. As vagas ficam centralizadas e organizadas.",
    },
    {
      titulo: "Filtros que importam",
      texto:
        "Busque por cidade, área de atuação e tipo de oportunidade, e encontre o " +
        "que cabe na sua grade de aulas.",
    },
  ],
  perguntas: [
    {
      pergunta: "Quem pode se cadastrar?",
      resposta:
        "Estudantes regularmente matriculados no Instituto Federal, nos níveis " +
        "médio, técnico e superior. O vínculo é conferido pelo e-mail institucional.",
    },
    {
      pergunta: "A plataforma cobra alguma coisa?",
      resposta: "Não. O uso é gratuito para estudantes.",
    },
    {
      pergunta: "Qual a diferença entre estágio e jovem aprendiz?",
      resposta:
        "O estágio é uma atividade ligada ao seu curso, com foco no aprendizado " +
        "prático da área. O jovem aprendiz é um contrato de trabalho com " +
        "capacitação profissional, voltado a quem tem entre 14 e 24 anos. A " +
        "plataforma reúne os dois tipos.",
    },
    {
      pergunta: "Preciso ter experiência?",
      resposta:
        "Não. As vagas publicadas aqui são de primeira oportunidade, voltadas " +
        "justamente para quem ainda não trabalhou.",
    },
    {
      pergunta: "Como sei se fui selecionado?",
      resposta:
        "Cada candidatura tem um status que a empresa atualiza ao longo do " +
        "processo, e você acompanha pela sua área logada.",
    },
  ],
  chamadaFinal: {
    titulo: "Pronto para a primeira oportunidade?",
    texto:
      "Crie seu perfil agora e comece a receber vagas compatíveis com seu curso.",
    rotulo: "Criar meu perfil",
    para: "/cadastro/estudante",
  },
};

export default function ParaEstudantes() {
  return <PaginaInstitucional conteudo={CONTEUDO} />;
}