/* Marca do Emprega-IF: uma maleta (trabalho) com uma seta de crescimento
   saindo dela, sobre o verde da plataforma. Desenho original, sem usar o
   logotipo oficial dos Institutos Federais. */
export function Marca({ tamanho = 32 }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#2f9e41" />
      {/* alça */}
      <path d="M12.5 11V9.6A1.6 1.6 0 0 1 14.1 8h3.8a1.6 1.6 0 0 1 1.6 1.6V11" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      {/* corpo da maleta */}
      <rect x="6.5" y="11" width="19" height="13.5" rx="3" fill="white" />
      {/* seta de crescimento */}
      <path d="M10.5 20.5l3.6-3.6 2.6 2.4 4.8-4.8" stroke="#2f9e41" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.6 14.5h2.9v2.9" stroke="#2f9e41" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Logo({ tamanho = 32, texto = "text-xl" }) {
  return (
    <span className="flex items-center gap-3">
      <Marca tamanho={tamanho} />
      <span className={`${texto} font-semibold tracking-tight text-neutral-900`}>
        Emprega<span className="text-marca-600">-IF</span>
      </span>
    </span>
  );
}
