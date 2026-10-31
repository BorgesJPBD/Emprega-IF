import { Link } from "react-router-dom";
import { ArrowRight, Check, Plus } from "lucide-react";

import Trajeto from "./Trajeto";

export default function PaginaInstitucional({ conteudo }) {
  const {
    titulo, subtitulo, acaoPrincipal, acaoSecundaria,
    passos, beneficios, perguntas, chamadaFinal,
  } = conteudo;

  return (
    <main>
      <section className="pt-6 sm:pt-10">
        <div className="container-site">
          <div className="placa placa--moldura px-6 py-9 sm:px-12 sm:py-12 lg:px-16">
            <h1 className="max-w-4xl text-[2.5rem] sm:text-6xl">{titulo}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/85 sm:text-xl">{subtitulo}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to={acaoPrincipal.para} className="botao botao--claro min-h-14 px-7 text-lg">
                {acaoPrincipal.rotulo} <ArrowRight className="seta size-5" />
              </Link>
              {acaoSecundaria && (
                <Link to={acaoSecundaria.para} className="botao botao--branco min-h-14 px-7 text-lg">
                  {acaoSecundaria.rotulo}
                </Link>
              )}
            </div>

          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="container-site">
          <h2 className="text-4xl sm:text-5xl">Como funciona</h2>
          <div className="mt-12">
            <Trajeto paradas={passos} desenhar />
          </div>
        </div>
      </section>

      <section className="border-y border-linha bg-superficie py-16 sm:py-24">
        <div className="container-site">
          <h2 className="text-4xl sm:text-5xl">Por que usar</h2>
          <ul className="mt-10 grid gap-x-12 md:grid-cols-2">
            {beneficios.map((beneficio) => (
              <li key={beneficio.titulo} className="flex gap-4 border-t border-linha py-6">
                <span className="mt-1 grid size-7 shrink-0 place-items-center rounded-[3px] bg-painel text-white">
                  <Check className="size-4" strokeWidth={3} />
                </span>
                <div>
                  <h3 className="text-xl">{beneficio.titulo}</h3>
                  <p className="mt-2 text-[17px] leading-relaxed text-tinta-media">{beneficio.texto}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="container-site">
          <h2 className="text-4xl sm:text-5xl">Perguntas frequentes</h2>

          <div className="cartao mt-10 max-w-4xl divide-y divide-linha">
            {perguntas.map((item) => (
              <details key={item.pergunta} className="group">
                <summary className="flex min-h-16 cursor-pointer items-center justify-between gap-4 px-5 py-4 text-lg font-extrabold marker:content-none hover:bg-superficie-2 sm:px-7 [&::-webkit-details-marker]:hidden">
                  {item.pergunta}
                  <span className="picto picto--pequeno transition-transform duration-150 group-open:rotate-45">
                    <Plus className="size-4" strokeWidth={3} />
                  </span>
                </summary>
                <p className="px-5 pb-6 text-[17px] leading-relaxed text-tinta-media sm:px-7">
                  {item.resposta}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16 sm:pb-24">
        <div className="container-site">
          <div className="placa flex flex-col gap-6 px-5 py-8 sm:px-10 sm:py-10 md:flex-row md:items-center md:justify-between lg:px-14">
            <div>
              <h2 className="max-w-xl text-3xl sm:text-4xl">{chamadaFinal.titulo}</h2>
              <p className="mt-2 max-w-lg text-lg text-white/85">{chamadaFinal.texto}</p>
            </div>
            <Link to={chamadaFinal.para} className="botao botao--claro shrink-0">
              {chamadaFinal.rotulo} <ArrowRight className="seta size-5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
