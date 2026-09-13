// Rodape.jsx
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
    <footer className="w-full border-t border-black/8 bg-white px-8 py-16">
      <div className="mx-auto max-w-screen-xl">
        <div className="mb-14 flex items-center gap-3">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#111111" />
            <circle cx="8" cy="22" r="4" fill="white" />
            <circle cx="24" cy="22" r="4" fill="white" />
            <path d="M12 22 Q16 9 20 22" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <circle cx="16" cy="11.5" r="2.5" fill="white" />
          </svg>
          <span className="text-lg font-semibold text-neutral-900">
            Emprega<span className="text-neutral-400">-IF</span>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {COLUNAS.map((coluna) => (
            <div key={coluna.titulo}>
              <h3 className="mb-4 text-xs font-medium uppercase tracking-widest text-neutral-400">
                {coluna.titulo}
              </h3>
              <ul className="space-y-3">
                {coluna.links.map((link) => (
                  <li key={link.rotulo}>
                    <Link to={link.para} className="text-sm text-neutral-500 transition-colors hover:text-neutral-900">
                      {link.rotulo}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-black/6 pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-neutral-400">© {ano} Emprega-IF. Todos os direitos reservados.</p>
          <p className="text-xs text-neutral-400">Plataforma oficial do Instituto Federal</p>
        </div>
      </div>
    </footer>
  );
}