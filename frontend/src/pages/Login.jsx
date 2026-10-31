import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, LogIn } from "lucide-react";

import { post } from "../api";
import { salvarSessao } from "../auth";
import Campo from "../componentes/Campo";


export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [lembrarMe, setLembrarMe] = useState(false);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(e) {
    e.preventDefault();
    setErros({});
    setErroGeral("");
    setCarregando(true);
    try {
      const dados = await post("/auth/login", { email, senha, lembrar_me: lembrarMe });
      salvarSessao(dados, lembrarMe);
      navigate(location.state?.de ?? "/")
    } catch (err) {
      if (err.campos && Object.keys(err.campos).length) {
        setErros(err.campos);
      } else {
        setErroGeral(err.message || "Não foi possível entrar. Tente novamente.");
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="container-site py-10 sm:py-16">
      <div className="mx-auto grid max-w-4xl overflow-hidden rounded-cartao border border-linha bg-superficie md:grid-cols-[1fr_1.15fr]">
        <div className="placa rounded-none px-6 py-8 sm:px-9 sm:py-10">
          <span className="picto"><LogIn className="size-5" /></span>
          <h1 className="mt-6 text-4xl">Entrar</h1>
          <p className="mt-3 text-lg leading-relaxed text-white/85">
            Estudantes e empresas entram pelo mesmo lugar, com o e-mail do cadastro.
          </p>
          <p className="mt-8 border-t border-white/25 pt-5 text-[15px] text-white/85">
            Ainda não tem conta?
          </p>
          <Link to="/cadastro" className="botao botao--branco botao--compacto mt-3">
            Criar conta <ArrowRight className="seta size-4" />
          </Link>
        </div>

        <form className="space-y-5 px-6 py-8 sm:px-9 sm:py-10" onSubmit={handleSubmit} noValidate>
          <Campo
            nome="email"
            rotulo="E-mail"
            erro={erros.email}
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Campo
            nome="senha"
            rotulo="Senha"
            erro={erros.senha}
            type="password"
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />

          {erroGeral && <p role="alert" className="aviso aviso--erro">{erroGeral}</p>}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex cursor-pointer items-start gap-2.5 text-[15px]">
              <input
                type="checkbox"
                className="caixa"
                checked={lembrarMe}
                onChange={(e) => setLembrarMe(e.target.checked)}
              />
              <span>
                Lembrar-me
                <span className="block text-sm text-tinta-fraca">Não marque em computador compartilhado</span>
              </span>
            </label>
            <Link to="/recuperar-senha" className="link text-[15px]">Esqueci a senha</Link>
          </div>

          <button type="submit" disabled={carregando} className="botao botao--largo min-h-14 text-lg">
            {carregando ? "Entrando..." : <>Entrar <ArrowRight className="seta size-5" /></>}
          </button>
        </form>
      </div>
    </main>
  );
}
