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
  const classes = ["campo"];
  if (inteiro) classes.push("campo--inteiro");
  if (erro) classes.push("campo--invalido");

  return (
    <div className={classes.join(" ")}>
      <label htmlFor={nome}>{rotulo}</label>

      {children ? (
        children
      ) : (
        <input
          id={nome}
          name={nome}
          aria-invalid={erro ? "true" : undefined}
          aria-describedby={erro ? idErro : undefined}
          {...props}
        />
      )}

      {erro && (
        <span className="campo__erro" id={idErro}>
          {erro}
        </span>
      )}
    </div>
  );
}
