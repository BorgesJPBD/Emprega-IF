import { Bookmark } from "lucide-react";

import { alternarSalva, useSalvas } from "../salvos";

export default function BotaoSalvar({ vaga, className = "" }) {
  const salvas = useSalvas();
  const salva = salvas.includes(String(vaga.id));

  return (
    <button
      type="button"
      aria-pressed={salva}
      aria-label={salva ? `Remover ${vaga.titulo} das vagas salvas` : `Salvar ${vaga.titulo}`}
      title={salva ? "Salva" : "Salvar vaga"}
      onClick={() => alternarSalva(vaga.id)}
      className={`salvar relative z-10 grid size-11 shrink-0 place-items-center rounded-full border transition-colors duration-150 ${
        salva
          ? "border-[#0a3622] bg-lima text-[#0a3622]"
          : "border-linha bg-superficie text-tinta-media hover:border-floresta hover:text-floresta"
      } ${className}`}
    >
      <Bookmark className="size-[18px]" strokeWidth={2.25} fill={salva ? "currentColor" : "none"} aria-hidden="true" />
    </button>
  );
}
