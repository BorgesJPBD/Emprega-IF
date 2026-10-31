import { Info } from "lucide-react";

export const VAGAS_DE_EXEMPLO = import.meta.env.VITE_VAGAS_EXEMPLO !== "false";

export default function AvisoExemplo({ className = "" }) {
  if (!VAGAS_DE_EXEMPLO) return null;
  return (
    <p className={`flex items-start gap-2 text-[15px] text-tinta-media ${className}`}>
      <Info className="mt-0.5 size-4 shrink-0 text-acao" />
      As vagas e empresas exibidas no momento são exemplos para demonstração do projeto.
    </p>
  );
}
