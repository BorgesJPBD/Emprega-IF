import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { post } from "../api";
import { limparSessao } from "../auth";
import InputSenha from "./InputSenha";

/* Bloco "Excluir conta" do Meu perfil (só estudante). A exclusão pede a
   senha e é definitiva: a API apaga a conta e, pelo ON DELETE CASCADE do
   banco, as candidaturas, o histórico, o currículo e os links junto. */
export default function ExcluirConta() {
  const ref = useRef(null);
  const [aberto, setAberto] = useState(false);
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [feito, setFeito] = useState(false);

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;
    if (aberto && !dialogo.open) dialogo.showModal();
    if (!aberto && dialogo.open) dialogo.close();
  }, [aberto]);

  function abrir() {
    setSenha("");
    setErro("");
    setAberto(true);
  }

  // Depois de excluída, a janela só sai pelo botão "Ir para o início".
  const fechar = () => {
    if (!enviando && !feito) setAberto(false);
  };

  async function excluir(evento) {
    evento.preventDefault();
    if (!senha) {
      setErro("Digite a sua senha para confirmar.");
      return;
    }
    setEnviando(true);
    setErro("");
    try {
      await post("/estudantes/me/excluir", { senha });
      limparSessao();
      setFeito(true);
    } catch (e) {
      setErro(e.campos?.senha || e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <section className="cartao mt-4 p-5 sm:p-7">
        <h2 className="text-2xl">Excluir conta</h2>
        <p className="mt-2 max-w-[60ch] text-[15px] leading-relaxed text-tinta-media">
          Apaga de vez o seu cadastro, as suas candidaturas, o currículo e os seus links. As empresas deixam de
          ver você nos painéis delas. Não dá para desfazer.
        </p>
        <button type="button" onClick={abrir} className="botao botao--perigo mt-5">
          Excluir minha conta
        </button>
      </section>

      <dialog
        ref={ref}
        aria-labelledby="excluir-titulo"
        onCancel={(e) => {
          e.preventDefault(); // Esc
          fechar();
        }}
        onClick={(e) => {
          if (e.target === ref.current) fechar(); // clique no fundo escurecido
        }}
        className="cartao m-auto w-[calc(100%-2rem)] max-w-md p-0 backdrop:bg-black/50"
      >
        {feito ? (
          <div className="p-6 sm:p-8">
            <h2 id="excluir-titulo" className="text-2xl">Conta excluída</h2>
            <p className="mt-3 text-[17px] leading-relaxed text-tinta-media">
              Seus dados foram apagados. Obrigado por ter usado o Emprega IF.
            </p>
            <Link to="/" className="botao botao--largo mt-7">Ir para o início</Link>
          </div>
        ) : (
          <form onSubmit={excluir} noValidate className="p-6 sm:p-8">
            <h2 id="excluir-titulo" className="text-2xl">Excluir sua conta?</h2>
            <p className="mt-3 text-[17px] leading-relaxed text-tinta-media">Isso apaga de forma definitiva:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[16px] text-tinta">
              <li>seus dados de cadastro;</li>
              <li>suas candidaturas e o histórico delas;</li>
              <li>seu currículo e seus links de LinkedIn e Instagram.</li>
            </ul>
            <p className="mt-3 text-[15px] text-tinta-media">
              Depois disso, você pode criar uma nova conta quando quiser.
            </p>

            <div className="mt-5">
              <label htmlFor="senha-exclusao" className="rotulo">Digite a sua senha para confirmar</label>
              <InputSenha
                id="senha-exclusao"
                name="senha-exclusao"
                autoComplete="current-password"
                className="entrada"
                aria-invalid={erro ? "true" : undefined}
                aria-describedby={erro ? "senha-exclusao-erro" : undefined}
                value={senha}
                onChange={(e) => {
                  setSenha(e.target.value);
                  setErro("");
                }}
              />
              {erro && <span id="senha-exclusao-erro" role="alert" className="erro-campo">{erro}</span>}
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={fechar} disabled={enviando} className="botao botao--contorno">
                Voltar
              </button>
              <button type="submit" disabled={enviando} className="botao botao--perigo">
                {enviando ? "Excluindo..." : "Excluir definitivamente"}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}