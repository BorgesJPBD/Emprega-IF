import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import Logo from "./Logo";

const COLUNAS = [
  {
    titulo: "Estudantes",
    links: [
      { rotulo: "Buscar vagas", para: "/vagas" },
      { rotulo: "Criar perfil", para: "/cadastro/estudante" },
      { rotulo: "Como funciona", para: "/para-estudantes" },
    ],
  },
  {
    titulo: "Empresas",
    links: [
      { rotulo: "Criar conta empresarial", para: "/cadastro/empresa" },
      { rotulo: "Publicar vaga", para: "/vagas/nova" },
      { rotulo: "Por que publicar aqui", para: "/para-empresas" },
    ],
  },
  {
    titulo: "Acesso",
    links: [{ rotulo: "Entrar", para: "/login" }],
  },
  {
    titulo: "Institucional",
    links: [
      { rotulo: "Quem somos", para: "/quem-somos" },
      { rotulo: "Termos de uso", para: "/termos" },
      { rotulo: "Privacidade", para: "/privacidade" },
    ],
  },
];

export default function Rodape() {
  const ano = new Date().getFullYear();

  return (
    <footer className="sobre-placa w-full bg-painel-2 text-white">
      <div className="container-site py-14">
        <div className="flex flex-col gap-6 border-b border-white/20 pb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Logo altura={36} claro />
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-white/80">
              Estágios e vagas de jovem aprendiz para estudantes do Instituto Federal de
              Mato Grosso do Sul, num só lugar.
            </p>
          </div>
          <Link to="/vagas" className="botao botao--claro self-start sm:self-auto">
            Ver vagas abertas <ArrowRight className="seta size-5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 pt-10 md:grid-cols-4">
          {COLUNAS.map((coluna) => (
            <div key={coluna.titulo}>
              <h2 className="font-display text-lg font-bold tracking-tight text-white">{coluna.titulo}</h2>
              <ul className="mt-3">
                {coluna.links.map((link) => (
                  <li key={link.rotulo}>
                    <Link to={link.para} className="group flex items-center justify-between gap-2 border-b border-white/12 py-2.5 text-[15px] text-white/80 transition-colors hover:text-white">
                      {link.rotulo}
                      <ArrowRight className="size-4 shrink-0 opacity-50 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 text-sm text-white/70 sm:flex-row sm:justify-between">
          <p>© {ano} Emprega IF</p>
          <p>Projeto de extensão do IFMS. Não é um serviço oficial do Instituto Federal.</p>
        </div>
      </div>
    </footer>
  );
}
