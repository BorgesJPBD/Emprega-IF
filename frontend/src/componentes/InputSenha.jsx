import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/* Campo de senha com o "olhinho" para mostrar ou ocultar o que foi digitado.
   Recebe as mesmas props de um <input>; o type é controlado aqui dentro. */
export default function InputSenha({ className = "entrada", ...props }) {
  const [visivel, setVisivel] = useState(false);

  return (
    <div className="relative">
      <input {...props} type={visivel ? "text" : "password"} className={`${className} pr-12`} />
      <button
        type="button"
        onClick={() => setVisivel((v) => !v)}
        aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
        aria-pressed={visivel}
        title={visivel ? "Ocultar senha" : "Mostrar senha"}
        className="absolute right-1.5 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full text-tinta-media transition-colors hover:bg-superficie-2 hover:text-floresta"
      >
        {visivel ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}
      </button>
    </div>
  );
}