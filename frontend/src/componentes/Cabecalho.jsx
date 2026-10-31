import Logo from "./Logo";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Bookmark, LogOut, Menu, X } from "lucide-react";

import { lerSessao, limparSessao } from "../auth";
import { useSalvas } from "../salvos";

const primeiroNome = (nome = "") => nome.trim().split(/\s+/)[0];

const LINKS = [
  { rotulo: "Vagas", para: "/vagas" },
  { rotulo: "Para estudantes", para: "/para-estudantes" },
  { rotulo: "Para empresas", para: "/para-empresas" },
];

// const CHAVE_TEMA = "emprega-if:tema";
//
// /** Tema em uso: o escolhido aqui ou, sem escolha, o do sistema. */
// function temaAtual() {
//   const escolhido = document.documentElement.dataset.tema;
//   if (escolhido) return escolhido;
//   return window.matchMedia("(prefers-color-scheme: dark)").matches ? "escuro" : "claro";
// }
// function BotaoTema() {
//   const [tema, setTema] = useState(temaAtual);
//   function alternar() {
//     const novo = tema === "escuro" ? "claro" : "escuro";
//     document.documentElement.dataset.tema = novo;
//     try { localStorage.setItem(CHAVE_TEMA, novo); } catch { /* sem armazenamento */ }
//     setTema(novo);
//   }
//   return (
//     <button
//       type="button"
//       onClick={alternar}
//       aria-label={tema === "escuro" ? "Usar tema claro" : "Usar tema escuro"}
//       className="grid size-11 place-items-center rounded-full text-tinta-media transition-colors duration-150 hover:bg-superficie-2 hover:text-floresta"
//     >
//       {tema === "escuro" ? <Sun className="size-5" /> : <Moon className="size-5" />}
//     </button>
//   );
// }

function Salvas() {
  const salvas = useSalvas();
  return (
    <Link
      to="/vagas?salvas=1"
      aria-label={`Vagas salvas: ${salvas.length}`}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-tinta-media transition-colors duration-150 hover:bg-superficie-2 hover:text-floresta"
    >
      <Bookmark className="size-[18px]" fill={salvas.length ? "currentColor" : "none"} />
      <span key={salvas.length} className="conta-sobe mono text-sm font-bold">{salvas.length}</span>
    </Link>
  );
}

export default function Cabecalho() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [sessao, setSessao] = useState(lerSessao);
  const { pathname } = useLocation();
  const navegar = useNavigate();

  useEffect(() => {
    setSessao(lerSessao());
    setMenuAberto(false);
  }, [pathname]);

  const ativa = (rota) => pathname === rota || (rota === "/vagas" && /^\/vagas\/(?!nova)/.test(pathname));

  const usuario = sessao?.usuario;
  const ehEmpresa = usuario?.papel === "empresa";

  function sair() {
    limparSessao();
    setSessao(null);
    setMenuAberto(false);
    navegar("/");
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-linha bg-fundo">
      <div className="container-site flex h-16 items-center justify-between gap-4 sm:h-18">
        <Link to="/" className="shrink-0" aria-label="Emprega IF, página inicial">
          <Logo altura={30} />
        </Link>

        <nav aria-label="Principal" className="hidden h-full items-stretch gap-1 lg:flex">
          {LINKS.map(({ rotulo, para }) => (
            <Link
              key={para}
              to={para}
              aria-current={ativa(para) ? "page" : undefined}
              className={`relative flex items-center px-3 text-[15px] font-semibold transition-colors duration-150 ${
                ativa(para) ? "text-floresta" : "text-tinta-media hover:text-floresta"
              }`}
            >
              {rotulo}
              {ativa(para) && <span className="absolute inset-x-3 -bottom-px h-[3px] bg-lima" aria-hidden="true" />}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Salvas />
          {/* <BotaoTema /> */}

          {usuario ? (
            <div className="ml-2 hidden items-center gap-2 lg:flex">
              <Link to={ehEmpresa ? "/painel" : "/minhas-candidaturas"} className="botao botao--contorno botao--compacto">
                {ehEmpresa ? "Painel" : "Minhas candidaturas"}
              </Link>
              {ehEmpresa && (
                <Link to="/vagas/nova" className="botao botao--lima botao--compacto">Publicar vaga</Link>
              )}
              <div className="ml-2 flex items-center gap-2.5 border-l border-linha pl-4" title={usuario.email}>
                <span className="grid size-9 place-items-center rounded-full border border-[#0a3622] bg-lima font-display text-sm font-extrabold text-[#0a3622]">
                  {primeiroNome(usuario.nome).charAt(0).toUpperCase()}
                </span>
                <div className="leading-tight">
                  <p className="max-w-40 truncate text-sm font-semibold">{ehEmpresa ? usuario.nome : primeiroNome(usuario.nome)}</p>
                  <p className="dado text-[10px] text-tinta-media">{ehEmpresa ? "Empresa" : "Estudante"}</p>
                </div>
              </div>
              <button type="button" onClick={sair} className="ml-1 inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-tinta-media transition-colors hover:bg-superficie-2 hover:text-floresta">
                <LogOut className="size-4" /> Sair
              </button>
            </div>
          ) : (
            <div className="ml-2 hidden items-center gap-2 lg:flex">
              <Link to="/login" className="px-3 py-2 text-[15px] font-semibold text-tinta-media transition-colors hover:text-floresta">Entrar</Link>
              <Link to="/vagas/nova" className="botao botao--contorno botao--compacto">Publicar vaga</Link>
              <Link to="/cadastro" className="botao botao--lima botao--compacto">Cadastrar-se</Link>
            </div>
          )}

          <button
            type="button"
            aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuAberto}
            className="grid size-11 place-items-center rounded-full text-floresta hover:bg-superficie-2 lg:hidden"
            onClick={() => setMenuAberto(!menuAberto)}
          >
            {menuAberto ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {menuAberto && (
        <div className="border-t border-linha bg-superficie lg:hidden">
          <nav aria-label="Principal" className="container-site flex flex-col py-2">
            {LINKS.map(({ rotulo, para }) => (
              <Link
                key={para}
                to={para}
                aria-current={ativa(para) ? "page" : undefined}
                className="flex min-h-13 items-center justify-between border-b border-linha font-display text-xl font-bold tracking-tight text-floresta"
              >
                {rotulo}
                {ativa(para) && <span className="aqui">Você está aqui</span>}
              </Link>
            ))}
            {(!usuario || ehEmpresa) && (
              <Link to="/vagas/nova" className="flex min-h-13 items-center border-b border-linha font-display text-xl font-bold tracking-tight text-floresta">Publicar vaga</Link>
            )}
            {usuario && (
              <Link to={ehEmpresa ? "/painel" : "/minhas-candidaturas"} className="flex min-h-13 items-center border-b border-linha font-display text-xl font-bold tracking-tight text-floresta">
                {ehEmpresa ? "Painel" : "Minhas candidaturas"}
              </Link>
            )}
            {usuario ? (
              <div className="flex items-center justify-between py-4">
                <span className="text-sm font-semibold">
                  {ehEmpresa ? usuario.nome : primeiroNome(usuario.nome)}
                  <span className="font-normal text-tinta-media"> · {ehEmpresa ? "Empresa" : "Estudante"}</span>
                </span>
                <button type="button" onClick={sair} className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold">
                  <LogOut className="size-4" /> Sair
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 py-4">
                <Link to="/login" className="botao botao--contorno">Entrar</Link>
                <Link to="/cadastro" className="botao botao--lima">Cadastrar-se</Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
