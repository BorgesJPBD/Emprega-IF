import { Link } from "react-router-dom";
import { ArrowRight, Building2, Check, GraduationCap } from "lucide-react";

import PlacaTitulo from "../componentes/PlacaTitulo";

const OPCOES = [
  {
    chave: "estudante",
    Icone: GraduationCap,
    titulo: "Sou estudante",
    descricao:
      "Monte seu perfil, encontre vagas para o seu curso e candidate-se em um clique.",
    itens: ["Vagas de estágio e jovem aprendiz", "Acompanhamento de cada candidatura"],
    para: "/cadastro/estudante",
    acao: "Criar perfil de estudante",
    destaque: true,
  },
  {
    chave: "empresa",
    Icone: Building2,
    titulo: "Sou empresa",
    descricao:
      "Publique vagas e alcance diretamente os estudantes do Instituto Federal.",
    itens: ["Publicação de vagas", "Candidatos do público acadêmico"],
    para: "/cadastro/empresa",
    acao: "Criar conta empresarial",
    destaque: false,
  },
];

export default function EscolhaCadastro() {
  return (
    <main className="container-site pb-20 pt-6 sm:pt-10">
      <PlacaTitulo titulo="Criar conta" resumo="Escolha o tipo de conta para continuar." />

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        {OPCOES.map(({ chave, Icone, ...opcao }) => (
          <Link
            key={chave}
            to={opcao.para}
            className={`cartao group flex flex-col p-6 transition-colors sm:p-8 ${
              opcao.destaque ? "border-floresta" : "hover:border-floresta"
            }`}
          >
            <span className="picto"><Icone className="size-5" /></span>
            <h2 className="mt-5 text-3xl">{opcao.titulo}</h2>
            <p className="mt-2 text-[17px] leading-relaxed text-tinta-media">{opcao.descricao}</p>

            <ul className="mt-5 space-y-2.5 text-[15px]">
              {opcao.itens.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-[3px] bg-painel text-white">
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <span className={`botao mt-8 ${opcao.destaque ? "" : "botao--contorno"}`}>
              {opcao.acao}
              <ArrowRight className="seta size-5" />
            </span>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-[17px]">
        Já tem uma conta? <Link className="link" to="/login">Entrar</Link>
      </p>
    </main>
  );
}
