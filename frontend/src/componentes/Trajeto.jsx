import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";

const REDUZ =
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const DEITADA = {
  sm: {
    lista: "sm:grid-cols-[repeat(var(--n),minmax(0,1fr))]",
    item: "sm:block sm:pb-0 sm:pr-4",
    trilho: "sm:left-8 sm:right-0 sm:top-[14px] sm:bottom-auto sm:h-1 sm:w-auto",
    origem: "sm:origin-left",
    apagado: "sm:scale-x-0 sm:scale-y-100",
    texto: "sm:mt-3",
  },
  md: {
    lista: "md:grid-cols-[repeat(var(--n),minmax(0,1fr))]",
    item: "md:block md:pb-0 md:pr-6",
    trilho: "md:left-10 md:right-0 md:top-[17px] md:bottom-auto md:h-1 md:w-auto",
    origem: "md:origin-left",
    apagado: "md:scale-x-0 md:scale-y-100",
    texto: "md:mt-5",
  },
};
const NENHUMA = { lista: "", item: "", trilho: "", origem: "", apagado: "", texto: "" };

export default function Trajeto({ paradas, atual, desenhar = false, compacto = false, vertical = false }) {
  const mapa = atual === undefined;
  const ate = mapa ? paradas.length - 1 : atual;
  const d = vertical ? NENHUMA : DEITADA[compacto ? "sm" : "md"];
  const ref = useRef(null);
  const [visivel, setVisivel] = useState(!desenhar || REDUZ);

  useEffect(() => {
    if (visivel) return;
    const el = ref.current;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setVisivel(true);
        obs.disconnect();
      }
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [visivel]);

  const tempo = (i) => (desenhar && !REDUZ ? { transitionDelay: `${i * 420}ms` } : undefined);

  return (
    <ol ref={ref} className={`grid grid-cols-1 gap-0 ${d.lista}`} style={{ "--n": paradas.length }}>
      {paradas.map((p, i) => {
        const cumprida = !mapa && i < atual;
        const aqui = !mapa && i === atual;
        const ligada = visivel && i <= ate;
        return (
          <li key={p.titulo} className={`relative flex gap-4 ${compacto ? "pb-5" : "pb-8"} ${d.item}`}>
            {i < paradas.length - 1 && (
              <span
                aria-hidden="true"
                className={`absolute bg-linha ${compacto ? "left-[14px] top-8 bottom-0 w-1" : "left-[17px] top-10 bottom-0 w-1"} ${d.trilho}`}
              >
                <span
                  className={`absolute inset-0 origin-top bg-acao transition-transform duration-500 ease-out ${d.origem} ${
                    visivel && i < ate ? "scale-100" : `scale-y-0 ${d.apagado}`
                  }`}
                  style={desenhar && !REDUZ ? { transitionDelay: `${i * 420 + 220}ms` } : undefined}
                />
              </span>
            )}

            <span
              className={`relative z-10 grid shrink-0 place-items-center rounded-full border-[1.5px] mono font-bold transition-colors duration-300 ${
                compacto ? "size-8 text-sm" : "size-10"
              } ${ligada ? "border-[#0a3622] bg-lima text-[#0a3622]" : "border-linha bg-superficie text-tinta-fraca"} ${aqui && ligada ? "ring-2 ring-floresta ring-offset-2 ring-offset-superficie" : ""}`}
              style={tempo(i)}
            >
              {cumprida && ligada ? <Check className="size-4" strokeWidth={3} /> : i + 1}
            </span>

            <span className={`block min-w-0 ${d.texto}`}>
              <span className={`flex flex-wrap items-center gap-2 font-display font-bold tracking-tight ${compacto ? "text-base" : "text-xl"}`}>
                {p.titulo}
                {aqui && p.aqui && <span className="aqui py-0 text-xs">{p.aqui}</span>}
              </span>
              {p.texto && <span className={`mt-1 block text-tinta-media ${compacto ? "text-sm" : "text-[15px] leading-relaxed"}`}>{p.texto}</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
