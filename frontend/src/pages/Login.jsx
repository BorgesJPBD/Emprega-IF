import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Campo from "../componentes/Campo";
import { ErroApi, post } from "../api";
import { salvarSessao } from "../auth";

export default function Login() {
  const navegar = useNavigate();
  const [form, setForm] = useState({ email: "", senha: "", lembrar_me: false });
  const [erros, setErros] = useState({});
  const [avisoErro, setAvisoErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  function alterar(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    setErros(({ [campo]: _, ...resto }) => resto);
  }

  async function enviar(evento) {
    evento.preventDefault();
    setEnviando(true);
    setErros({});
    setAvisoErro("");

    try {
      const sessao = await post("/auth/login", form);
      salvarSessao(sessao, form.lembrar_me);
      // Estudante cai nas vagas recomendadas (UC02); empresa, na área de vagas (UC03).
      navegar(sessao.usuario.papel === "empresa" ? "/vagas/nova" : "/vagas");
    } catch (erro) {
      if (erro instanceof ErroApi) {
        setErros(erro.campos);
        setAvisoErro(erro.message);
      } else {
        setAvisoErro("Erro inesperado. Tente novamente.");
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="pagina pagina--estreita">
      <span className="selo-tela" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2" strokeLinecap="round"
             strokeLinejoin="round">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <polyline points="10 17 15 12 10 7" />
          <line x1="15" y1="12" x2="3" y2="12" />
        </svg>
      </span>

      <h1>Bem-vindo de volta</h1>
      <p className="pagina__apoio">Entre para continuar sua jornada</p>

      <form className="cartao formulario-suave" onSubmit={enviar} noValidate>
        {avisoErro && <p className="aviso aviso--erro">{avisoErro}</p>}

        <div className="pilha">
          <Campo
            nome="email"
            rotulo="E-mail"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            value={form.email}
            erro={erros.email}
            onChange={(e) => alterar("email", e.target.value)}
          />

          <Campo
            nome="senha"
            rotulo="Senha"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            value={form.senha}
            erro={erros.senha}
            onChange={(e) => alterar("senha", e.target.value)}
          />
        </div>

        <div className="linha-opcoes">
          <label className="lembrar" htmlFor="lembrar_me">
            <input
              id="lembrar_me"
              type="checkbox"
              checked={form.lembrar_me}
              onChange={(e) => alterar("lembrar_me", e.target.checked)}
            />
            Lembrar-me
          </label>

          <Link className="link-discreto" to="/recuperar-senha">
            Esqueceu a senha?
          </Link>
        </div>

        <button className="botao botao--largo" type="submit" disabled={enviando}>
          {enviando ? "Entrando..." : "Entrar"}
        </button>

        <p className="rodape-cartao rodape-cartao--dividido">
          Não tem uma conta? <Link to="/cadastro/estudante">Cadastre-se</Link>
        </p>
      </form>
    </main>
  );
}
