import { Link } from "react-router-dom";
import { ArrowUpRight, Clock, MapPin } from "lucide-react";

/** Cartão de vaga. `indice` escalona a entrada quando a lista aparece. */
export default function CartaoVaga({ vaga, indice = 0 }) {
  const { Icone } = vaga;
  return (
    <article
      className="anima-entra flex flex-col rounded-2xl border border-neutral-200 bg-white p-6 transition duration-200 hover:-translate-y-1 hover:shadow-md"
      style={{ animationDelay: `${indice * 90}ms` }}
    >
      <div className="flex items-start justify-between">
        <span className="grid size-10 place-items-center rounded-xl bg-neutral-100 text-neutral-600">
          <Icone className="size-5" />
        </span>
        <span className="rounded-full border border-neutral-200 px-2.5 py-0.5 text-[11px] text-neutral-600">
          {vaga.tipo}
        </span>
      </div>

      <h3 className="mt-5 text-base font-medium text-neutral-900">{vaga.titulo}</h3>
      <p className="mt-1 text-sm text-neutral-400">{vaga.empresa}</p>

      <ul className="mt-4 space-y-1.5 text-xs text-neutral-500">
        <li className="flex items-center gap-2"><MapPin className="size-3.5 text-neutral-400" />{vaga.local}</li>
        <li className="flex items-center gap-2"><Clock className="size-3.5 text-neutral-400" />{vaga.horario}</li>
      </ul>

      <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-4">
        <span className="text-sm font-medium text-neutral-900">
        {vaga.valor ? `R$ ${vaga.valor.toLocaleString("pt-BR")} / mês` : "A combinar"}
        </span>
        <Link
          to={`/vagas/${vaga.id}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
        >
          Ver vaga <ArrowUpRight className="size-3" />
        </Link>
      </div>
    </article>
  );
}