import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Cabecalho() {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/8 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-screen-xl items-center justify-between px-8">
        <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-70">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#111111" />
            <circle cx="8" cy="22" r="4" fill="white" />
            <circle cx="24" cy="22" r="4" fill="white" />
            <path d="M12 22 Q16 9 20 22" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <circle cx="16" cy="11.5" r="2.5" fill="white" />
          </svg>
          <span className="text-xl font-semibold tracking-tight text-neutral-900">
            Emprega<span className="text-neutral-400">-IF</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link to="/vagas" className="text-sm text-neutral-500 transition-colors hover:text-neutral-900">
            Vagas
          </Link>
          <Link to="/para-estudantes" className="text-sm text-neutral-500 transition-colors hover:text-neutral-900">
            Para Estudantes
          </Link>
          <Link to="/para-empresas" className="text-sm text-neutral-500 transition-colors hover:text-neutral-900">
            Para Empresas
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link to="/login" className="rounded-lg px-4 py-2 text-sm text-neutral-500 transition-colors hover:text-neutral-900">
            Entrar
          </Link>
          <Link
            to="/vagas/nova"
            className="rounded-lg border border-black/12 bg-neutral-100 px-4 py-2 text-sm text-neutral-700 transition-all hover:border-black/20 hover:bg-neutral-200"
          >
            Publicar vaga
          </Link>
          <Link
            to="/cadastro"
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-neutral-800"
          >
            Cadastrar-se
          </Link>
        </div>

        <button
          className="flex size-9 items-center justify-center rounded-lg text-neutral-500 hover:text-neutral-900 md:hidden"
          onClick={() => setMenuAberto(!menuAberto)}
        >
          {menuAberto ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {menuAberto && (
        <div className="border-t border-black/8 bg-white px-8 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            <Link to="/vagas" className="text-sm text-neutral-600" onClick={() => setMenuAberto(false)}>Vagas</Link>
            <Link to="/para-estudantes" className="text-sm text-neutral-600" onClick={() => setMenuAberto(false)}>Para Estudantes</Link>
            <Link to="/para-empresas" className="text-sm text-neutral-600" onClick={() => setMenuAberto(false)}>Para Empresas</Link>
            <Link to="/vagas/nova" className="text-sm text-neutral-600" onClick={() => setMenuAberto(false)}>Publicar vaga</Link>
            <div className="flex gap-3 pt-2">
              <Link to="/login" className="flex-1 rounded-lg border border-black/12 py-2 text-center text-sm text-neutral-700" onClick={() => setMenuAberto(false)}>Entrar</Link>
              <Link to="/cadastro" className="flex-1 rounded-lg bg-neutral-900 py-2 text-center text-sm font-medium text-white" onClick={() => setMenuAberto(false)}>Cadastrar-se</Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}