import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, KeyRound, MailCheck } from "lucide-react";

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
    <main className="container-site py-10 sm:py-16">
      <div className="mx-auto grid max-w-4xl overflow-hidden rounded-cartao border border-linha bg-superficie md:grid-cols-[1fr_1.15fr]">
        <div className="placa rounded-none px-6 py-8 sm:px-9 sm:py-10">
          <span className="picto"><KeyRound className="size-5" /></span>
          <h1 className="mt-6 text-4xl">Esqueci a senha</h1>
          <p className="mt-3 text-lg leading-relaxed text-white/85">
            Informe o e-mail da sua conta e enviamos um link para criar uma nova senha.
          </p>
          <p className="mt-8 border-t border-white/25 pt-5 text-[15px] text-white/85">
            Lembrou a senha?
          </p>
          <Link to="/login" className="botao botao--branco botao--compacto mt-3">
            Voltar para o login <ArrowRight className="seta size-4" />
          </Link>
        </div>

        <div className="px-6 py-8 sm:px-9 sm:py-10">
          {enviado ? (
            <div role="status">
              <span className="picto"><MailCheck className="size-5" /></span>
              <p className="mt-5 text-lg leading-relaxed">{enviado}</p>
              <p className="mt-2 text-[15px] text-tinta-fraca">O link vale por 1 hora e só pode ser usado uma vez.</p>
              <button type="button" onClick={() => setEnviado("")} className="link mt-6 text-[15px]">
                Não chegou? Enviar de novo
              </button>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={enviar} noValidate>
              <Campo
                nome="email"
                rotulo="E-mail"
                erro={erro}
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                required
              />
              <button type="submit" disabled={carregando} className="botao botao--largo min-h-14 text-lg">
                {carregando ? "Enviando..." : <>Enviar link <ArrowRight className="seta size-5" /></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
