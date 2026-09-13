import { Link } from "react-router-dom";

export default function Cabecalho() {
  return (
    <header className="cabecalho">
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

      <nav className="cabecalho__links">
        <a href="#vagas">Vagas</a>
        <a href="#estudantes">Para Estudantes</a>
        <a href="#empresas">Para Empresas</a>
      </nav>

      <div className="cabecalho__acoes">
        <Link className="botao-texto" to="/login">
          Entrar
        </Link>
        <Link className="botao-contorno" to="/vagas/nova">
          Publicar vaga
        </Link>
        <Link className="botao" to="/cadastro/estudante">
          Cadastrar-se
        </Link>
      </div>
    </header>
  );
}
