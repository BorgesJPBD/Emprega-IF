// Rodape.jsx
import Logo from "./Logo";
import { Link } from "react-router-dom";

const COLUNAS = [
  {
    titulo: "Estudantes",
    links: [
      { rotulo: "Buscar vagas", para: "/vagas" },
      { rotulo: "Criar perfil", para: "/cadastro/estudante" },
    ],
  },
  {
    titulo: "Empresas",
    links: [{ rotulo: "Criar conta empresarial", para: "/cadastro/empresa" }],
  },
  {
    titulo: "Acesso",
    links: [{ rotulo: "Fazer login", para: "/login" }],
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
    <footer className="w-full bg-neutral-900 px-8 py-16 text-neutral-400">
      <div className="mx-auto max-w-screen-xl">
        <div className="mb-14 flex items-center gap-3">
          <Logo tamanho={28} texto="text-lg" claro />
        </div>
        <p className="-mt-10 mb-14 max-w-sm text-sm leading-relaxed text-neutral-400">
          Estágios e vagas de jovem aprendiz para estudantes do Instituto Federal de
          Mato Grosso do Sul, num só lugar.
        </p>

        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {COLUNAS.map((coluna) => (
            <div key={coluna.titulo}>
              <h3 className="mb-4 text-sm font-medium text-white">
                {coluna.titulo}
              </h3>
              <ul className="space-y-3">
                {coluna.links.map((link) => (
                  <li key={link.rotulo}>
                    <Link to={link.para} className="text-sm text-neutral-400 transition-colors hover:text-white">
                      {link.rotulo}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-neutral-500">© {ano} Emprega-IF</p>
          <p className="text-xs text-neutral-500">Projeto de extensão do IFMS. Não é um serviço oficial do Instituto Federal.</p>
        </div>
      </div>
    </footer>
  );
}