import logo from "../assets/logo.png";
import logoBranca from "../assets/logo-branca.png";

export default function Logo({ altura = 36, claro = false }) {
  const medidas = {
    alt: "Emprega IF",
    height: altura,
    width: Math.round(altura * (509 / 160)),
    style: { height: altura, width: "auto" },
    draggable: false,
  };
  if (claro) return <img src={logoBranca} {...medidas} />;
  return (
    <>
      <img src={logo} className="logo--tema-claro" {...medidas} />
      <img src={logoBranca} className="logo--tema-escuro" {...medidas} alt="" aria-hidden="true" />
    </>
  );
}
