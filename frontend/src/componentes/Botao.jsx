import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function Botao({
  para,
  variante = "padrao",
  compacto = false,
  largo = false,
  seta = false,
  className = "",
  children,
  ...resto
}) {
  const classes = [
    "botao",
    variante !== "padrao" && `botao--${variante}`,
    compacto && "botao--compacto",
    largo && "botao--largo",
    className,
  ].filter(Boolean).join(" ");

  const conteudo = (
    <>
      {children}
      {seta && <ArrowRight className="seta size-5" aria-hidden="true" />}
    </>
  );

  if (para) {
    return <Link to={para} className={classes} {...resto}>{conteudo}</Link>;
  }
  return <button type="button" className={classes} {...resto}>{conteudo}</button>;
}
