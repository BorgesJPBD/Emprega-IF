import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

  async function handleSubmit(e) {
    e.preventDefault();
    setErros({});
    setErroGeral("");
    setCarregando(true);
    try {
      const dados = await post("/auth/login", { email, senha, lembrar_me: lembrarMe });
      salvarSessao(dados, lembrarMe);
      navigate("/");
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
    <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-[#f4f4f5] px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">Bem-vindo de volta</h1>
          <p className="mt-1.5 text-sm text-neutral-500">Entre para continuar sua jornada</p>
        </div>

        <div className="rounded-2xl border border-black/8 bg-white p-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Campo
              nome="email"
              rotulo="E-mail"
              erro={erros.email}
              type="email"
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
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />

            {erroGeral && <p className="text-xs text-red-500">{erroGeral}</p>}

            <div className="flex items-center justify-between pt-1">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  className="size-3.5 accent-neutral-900"
                  checked={lembrarMe}
                  onChange={(e) => setLembrarMe(e.target.checked)}
                />
                <span className="text-xs text-neutral-500">Lembrar-me</span>
              </label>
              <a href="#" className="text-xs text-neutral-500 hover:text-neutral-900">Esqueceu a senha?</a>
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="mt-2 w-full rounded-xl bg-neutral-900 py-3 text-sm font-medium text-white transition-all hover:bg-neutral-800 disabled:opacity-60"
            >
              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="mt-5 border-t border-black/8 pt-5 text-center">
            <p className="text-xs text-neutral-500">
              Não tem uma conta?{" "}
              <Link to="/cadastro/estudante" className="text-neutral-700 hover:text-neutral-900">
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}