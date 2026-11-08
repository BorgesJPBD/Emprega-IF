import { useEffect, useRef } from "react";

/* Janela de confirmação no visual do site (no lugar do window.confirm).
   Usa o <dialog> nativo: o navegador cuida do foco, do Esc e de bloquear
   a página por trás. O foco inicial fica em "Cancelar", a opção segura. */
export default function Confirmacao({
  aberto,
  titulo,
  texto,
  confirmar = "Confirmar",
  cancelar = "Cancelar",
  perigo = false,
  ocupado = false,
  aoConfirmar,
  aoCancelar,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;
    if (aberto && !dialogo.open) dialogo.showModal();
    if (!aberto && dialogo.open) dialogo.close();
  }, [aberto]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirmacao-titulo"
      aria-describedby="confirmacao-texto"
      onCancel={(e) => {
        e.preventDefault(); // Esc
        if (!ocupado) aoCancelar();
      }}
      onClick={(e) => {
        // clique no fundo escurecido (o padding fica no div de dentro)
        if (e.target === ref.current && !ocupado) aoCancelar();
      }}
      className="cartao m-auto w-[calc(100%-2rem)] max-w-md p-0 backdrop:bg-black/50"
    >
      <div className="p-6 sm:p-8">
        <h2 id="confirmacao-titulo" className="text-2xl">{titulo}</h2>
        <p id="confirmacao-texto" className="mt-3 text-[17px] leading-relaxed text-tinta-media">{texto}</p>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={aoCancelar} disabled={ocupado} className="botao botao--contorno">
            {cancelar}
          </button>
          <button
            type="button"
            onClick={aoConfirmar}
            disabled={ocupado}
            className={`botao ${perigo ? "botao--perigo" : ""}`}
          >
            {ocupado ? "Aguarde..." : confirmar}
          </button>
        </div>
      </div>
    </dialog>
  );
}