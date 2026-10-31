import { Link } from "react-router-dom";

import BotaoSalvar from "./BotaoSalvar";
import EtiquetaLocal from "./EtiquetaLocal";
import { TARJA_TIPO, bolsaDe, ehNova, jornada, prazoDa } from "../vagas";

export default function CartaoVaga({ vaga, destaque = false, className = "" }) {
  const bolsa = bolsaDe(vaga);
  const comVT = vaga.beneficios?.some((b) => /transporte/i.test(b));
  const prazo = prazoDa(vaga);
  const nova = ehNova(vaga);

  return (
    <article
      className={`cartao cartao--vivo group relative flex min-w-0 flex-col has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-3 has-[a:focus-visible]:outline-floresta ${
        destaque ? "cartao--destaque lg:col-span-2" : ""
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3 px-5 pt-5">
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className={`tarja ${TARJA_TIPO[vaga.tipo] ?? "tarja--neutra"}`}>{vaga.tipo}</span>
          {nova && <span className="tarja tarja--nova">Nova</span>}
        </div>
        <BotaoSalvar vaga={vaga} className="-mr-1 -mt-1" />
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-3">
        <h3 className={destaque ? "text-[1.625rem] sm:text-[2rem]" : "text-[1.375rem]"}>
          <Link to={`/vagas/${vaga.id}`} className="after:absolute after:inset-0 after:rounded-cartao focus-visible:outline-none">
            {vaga.titulo}
          </Link>
        </h3>
        <p className="mt-1.5 truncate text-[15px] font-medium text-tinta-media" title={vaga.empresa}>{vaga.empresa}</p>

        {destaque && vaga.descricao && (
          <p className="mt-3 line-clamp-2 max-w-[60ch] text-[15px] leading-relaxed text-tinta-media">{vaga.descricao}</p>
        )}

        <div className="mt-auto pt-5">
          <p className="mono flex flex-wrap items-baseline gap-x-2 text-floresta">
            {bolsa ? (
              <>
                <span className={`font-bold tracking-tight ${destaque ? "text-[1.75rem]" : "text-[1.375rem]"}`}>{bolsa}</span>
                <span className="text-[13px] font-medium text-tinta-media">/mês{comVT && " + VT"}</span>
              </>
            ) : (
              <span className="text-[1.125rem] font-bold">A combinar</span>
            )}
          </p>
          {jornada(vaga).length > 0 && (
            <p className="mono mt-1.5 text-[13px] font-medium text-tinta-media">{jornada(vaga).join(" • ")}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-linha px-5 py-3">
        <EtiquetaLocal local={vaga.local} />
        {prazo && (
          <span className={`dado shrink-0 ${prazo.urgente ? "font-bold text-urgente" : "text-tinta-media"}`}>
            {prazo.urgente && <span aria-hidden="true" className="mr-1.5 inline-block size-1.5 rounded-full bg-urgente align-middle" />}
            {prazo.texto}
          </span>
        )}
      </div>
    </article>
  );
}
