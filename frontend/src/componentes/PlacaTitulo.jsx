import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function PlacaTitulo({ titulo, resumo, voltar, children }) {
  return (
    <div className="placa px-5 py-7 sm:px-10 sm:py-10">
      {voltar && (
        <Link to={voltar.para} className="mb-5 inline-flex items-center gap-2 text-[15px] font-bold text-white/85 hover:text-white">
          <ArrowLeft className="size-4" /> {voltar.rotulo}
        </Link>
      )}
      <h1 className="text-4xl sm:text-5xl">{titulo}</h1>
      {resumo && <p className="mt-3 max-w-2xl text-lg leading-relaxed text-white/85">{resumo}</p>}
      {children}
    </div>
  );
}
