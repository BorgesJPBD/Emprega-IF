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
    <footer className="rodape">
      <div className="rodape__interno">
        <Link className="marca" to="/">
          <span className="marca__selo" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <circle cx="4.5" cy="4" r="2.1" />
              <circle cx="9.5" cy="4" r="2.1" />
              <path d="M1 12c0-1.9 1.6-3.4 3.5-3.4S8 10.1 8 12H1Z" />
              <path d="M6 12c0-1.9 1.6-3.4 3.5-3.4S13 10.1 13 12H6Z" />
            </svg>
          </span>
          <span>
            <strong>Emprega</strong>
            <span>-IF</span>
          </span>
        </Link>

        <div className="rodape__colunas">
          {COLUNAS.map((coluna) => (
            <nav className="rodape__coluna" key={coluna.titulo}>
              <h2>{coluna.titulo}</h2>
              <ul>
                {coluna.links.map((link) => (
                  <li key={link.rotulo}>
                    <Link to={link.para}>{link.rotulo}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="rodape__base">
          <span>© {ano} Emprega-IF. Todos os direitos reservados.</span>
          <span>Plataforma oficial do Instituto Federal</span>
        </div>
      </div>
    </footer>
  );
}
