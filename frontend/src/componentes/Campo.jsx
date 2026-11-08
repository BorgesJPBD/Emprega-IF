import InputSenha from "./InputSenha";

export default function Campo({
  nome,
  rotulo,
  erro,
  inteiro = false,
  children,
  ...props
}) {
  const idErro = `${nome}-erro`;
  // Todo campo type="password" ganha o botão de mostrar/ocultar a senha.
  const Entrada = props.type === "password" ? InputSenha : "input";

  return (
    <div className={inteiro ? "sm:col-span-2" : ""}>
      <label htmlFor={nome} className="rotulo">
        {rotulo}
      </label>

      {children ? (
        children
      ) : (
        <Entrada
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