import { useState } from "react";
import { Link } from "react-router-dom";
import { MailCheck } from "lucide-react";

import { post } from "../api";
import Campo from "../componentes/Campo";

/* Passo 1 da recuperação: a pessoa informa o e-mail e recebe um link.
   A mensagem de sucesso é sempre a mesma (a API não revela se o e-mail
   tem conta), então a tela também não diz nada além disso. */
export default function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    try {
      const resposta = await post("/auth/recuperar-senha", { email });
      setEnviado(resposta.mensagem);
    } catch (err) {
      setErro(err.campos?.email || err.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-[#f4f4f5] px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">Esqueceu a senha?</h1>
          <p className="mt-1.5 text-sm text-neutral-500">Informe o e-mail da sua conta e enviamos um link para criar uma nova senha.</p>
        </div>

        <div className="rounded-2xl border border-black/8 bg-white p-6">
          {enviado ? (
            <div className="text-center" role="status">
              <MailCheck className="mx-auto size-9 text-marca-600" />
              <p className="mt-4 text-sm leading-relaxed text-neutral-700">{enviado}</p>
              <p className="mt-2 text-xs text-neutral-500">O link vale por 1 hora.</p>
              <button
                type="button"
                onClick={() => setEnviado("")}
                className="mt-6 text-xs font-medium text-neutral-600 underline-offset-4 hover:text-neutral-900 hover:underline"
              >
                Não chegou? Enviar de novo
              </button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={enviar}>
              <Campo
                nome="email"
                rotulo="E-mail"
                erro={erro}
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                required
              />
              <button
                type="submit"
                disabled={carregando}
                className="w-full rounded-xl bg-neutral-900 py-3 text-sm font-medium text-white transition-all hover:bg-neutral-800 disabled:opacity-60"
              >
                {carregando ? "Enviando..." : "Enviar link"}
              </button>
            </form>
          )}

          <div className="mt-5 border-t border-black/8 pt-5 text-center">
            <Link to="/login" className="text-xs text-neutral-600 hover:text-neutral-900">Voltar para o login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
