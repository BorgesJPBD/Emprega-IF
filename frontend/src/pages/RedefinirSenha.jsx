import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CircleCheck } from "lucide-react";

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
      else setErroGeral(erroToken ? "Este link é inválido. Peça um novo na tela de login." : err.message);
    } finally {
      setCarregando(false);
    }
  }

  const titulo = "mt-1.5 text-sm text-neutral-500";
  const cartao = "rounded-2xl border border-black/8 bg-white p-6";

  return (
    <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-[#f4f4f5] px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">Criar nova senha</h1>
          <p className={titulo}>Escolha uma senha com pelo menos 8 caracteres.</p>
        </div>

        <div className={cartao}>
          {!token ? (
            <p className="text-sm text-neutral-700">
              Este endereço não tem o código de recuperação.{" "}
              <Link to="/recuperar-senha" className="font-medium text-neutral-900 underline">Peça um novo link</Link>.
            </p>
          ) : pronto ? (
            <div className="text-center" role="status">
              <CircleCheck className="mx-auto size-9 text-marca-600" />
              <p className="mt-4 text-sm text-neutral-700">Senha alterada. Você já pode entrar com a nova senha.</p>
              <Link to="/login" className="mt-6 block w-full rounded-xl bg-neutral-900 py-3 text-sm font-medium text-white transition hover:bg-neutral-800">
                Entrar
              </Link>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={salvar}>
              <Campo
                nome="senha"
                rotulo="Nova senha"
                erro={erros.senha}
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo de 8 caracteres"
                minLength={8}
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
                <p role="alert" className="text-xs text-red-500">
                  {erroGeral}{" "}
                  <Link to="/recuperar-senha" className="font-medium underline">Pedir novo link</Link>
                </p>
              )}
              <button
                type="submit"
                disabled={carregando}
                className="w-full rounded-xl bg-neutral-900 py-3 text-sm font-medium text-white transition-all hover:bg-neutral-800 disabled:opacity-60"
              >
                {carregando ? "Salvando..." : "Salvar nova senha"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
