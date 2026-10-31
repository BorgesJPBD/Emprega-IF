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
      <label htmlFor={nome} className="rotulo">
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
          className="entrada"
          {...props}
        />
      )}

      {erro && (
        <span className="erro-campo" id={idErro}>
          {erro}
        </span>
      )}
    </div>
  );
}
