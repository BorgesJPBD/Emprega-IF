// Campo.jsx
/**
 * Um campo do formulário: rótulo, controle e mensagem de erro.
 * Concentrar isso aqui evita repetir a mesma estrutura oito vezes
 * e garante que todo campo fique acessível (label ligado ao input,
 * erro anunciado por aria-describedby).
 */
export default function Campo({
  nome,
  rotulo,
  erro,
  inteiro = false,
  children,
  ...props
}) {
  const idErro = `${nome}-erro`;

  return (
    <div className={inteiro ? "sm:col-span-2" : ""}>
      <label htmlFor={nome} className="mb-1.5 block text-xs font-medium text-neutral-600">
        {rotulo}
      </label>

      {children ? (
        children
      ) : (
        <input
          id={nome}
          name={nome}
          aria-invalid={erro ? "true" : undefined}
          aria-describedby={erro ? idErro : undefined}
          className={`w-full rounded-xl border px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 transition-all focus:outline-none ${
            erro
              ? "border-red-400 bg-red-50 focus:border-red-500"
              : "border-black/10 bg-neutral-50 focus:border-black/25 focus:bg-white"
          }`}
          {...props}
        />
      )}

      {erro && (
        <span className="mt-1 block text-xs text-red-500" id={idErro}>
          {erro}
        </span>
      )}
    </div>
  );
}