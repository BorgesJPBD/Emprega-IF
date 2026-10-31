import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, CircleCheck, LockKeyhole } from "lucide-react";

import { post } from "../api";
import Campo from "../componentes/Campo";

/* Passo 2 da recuperação: a pessoa chega pelo link do e-mail
   (/redefinir-senha?token=...) e escolhe a nova senha. */
export default function RedefinirSenha() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState("");
  const [pronto, setPronto] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function salvar(e) {
    e.preventDefault();
    setErros({});
    setErroGeral("");
    if (senha.length < 8) {
      setErros({ senha: "A senha precisa ter pelo menos 8 caracteres." });
      return;
    }
    if (senha !== confirmar) {
      setErros({ confirmar_senha: "As senhas não são iguais." });
      return;
    }
    setCarregando(true);
    try {
      await post("/auth/redefinir-senha", { token, senha, confirmar_senha: confirmar });
      setPronto(true);
    } catch (err) {
      const { senha: erroSenha, body, token: erroToken } = err.campos || {};
      if (erroSenha) setErros({ senha: erroSenha });
      else if (body) setErros({ confirmar_senha: body });
      else setErroGeral(erroToken ? "Este link é inválido. Peça um novo." : err.message);
    } finally {
      setCarregando(false);
    }
  }

  let conteudo;
  if (!token) {
    conteudo = (
      <p className="text-lg leading-relaxed">
        Este endereço não tem o código de recuperação.{" "}
        <Link to="/recuperar-senha" className="link">Peça um novo link</Link>.
      </p>
    );
  } else if (pronto) {
    conteudo = (
      <div role="status">
        <span className="picto"><CircleCheck className="size-5" /></span>
        <p className="mt-5 text-lg leading-relaxed">Senha alterada. Você já pode entrar com a nova senha.</p>
        <Link to="/login" className="botao botao--largo mt-6 min-h-14 text-lg">
          Entrar <ArrowRight className="seta size-5" />
        </Link>
      </div>
    );
  } else {
    conteudo = (
      <form className="space-y-5" onSubmit={salvar} noValidate>
        <Campo
          nome="senha"
          rotulo="Nova senha"
          erro={erros.senha}
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo de 8 caracteres"
          maxLength={72}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          autoFocus
          required
        />
        <Campo
          nome="confirmar_senha"
          rotulo="Confirmar nova senha"
          erro={erros.confirmar_senha}
          type="password"
          autoComplete="new-password"
          placeholder="Repita a senha"
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
          required
        />
        {erroGeral && (
          <p role="alert" className="aviso aviso--erro">
            {erroGeral} <Link to="/recuperar-senha" className="link">Pedir novo link</Link>
          </p>
        )}
        <button type="submit" disabled={carregando} className="botao botao--largo min-h-14 text-lg">
          {carregando ? "Salvando..." : <>Salvar nova senha <ArrowRight className="seta size-5" /></>}
        </button>
      </form>
    );
  }

  return (
    <main className="container-site py-10 sm:py-16">
      <div className="mx-auto grid max-w-4xl overflow-hidden rounded-cartao border border-linha bg-superficie md:grid-cols-[1fr_1.15fr]">
        <div className="placa rounded-none px-6 py-8 sm:px-9 sm:py-10">
          <span className="picto"><LockKeyhole className="size-5" /></span>
          <h1 className="mt-6 text-4xl">Criar nova senha</h1>
          <p className="mt-3 text-lg leading-relaxed text-white/85">
            Escolha uma senha com pelo menos 8 caracteres. O link do e-mail vale por 1 hora.
          </p>
        </div>
        <div className="px-6 py-8 sm:px-9 sm:py-10">{conteudo}</div>
      </div>
    </main>
  );
}
