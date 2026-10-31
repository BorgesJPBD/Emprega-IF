import { useEffect } from "react";

import PlacaTitulo from "./PlacaTitulo";

const ancora = (texto) =>
  texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function PaginaTexto({ titulo, resumo, atualizado, secoes }) {
  useEffect(() => window.scrollTo(0, 0), []);

  return (
    <main className="container-site pb-20 pt-6 sm:pt-10">
      <PlacaTitulo titulo={titulo} resumo={resumo}>
        {atualizado && <p className="mt-4 text-[15px] font-bold text-white/85">Atualizado em {atualizado}</p>}
      </PlacaTitulo>

      <div className="mt-4 grid gap-6 lg:grid-cols-[260px_1fr] lg:items-start">
        <nav aria-label="Nesta página" className="cartao hidden p-5 lg:sticky lg:top-24 lg:block">
          <p className="text-[15px] font-extrabold">Nesta página</p>
          <ul className="mt-3 space-y-1">
            {secoes.map(({ titulo: t }) => (
              <li key={t}>
                <a href={`#${ancora(t)}`} className="block rounded-[3px] py-1.5 text-[15px] text-tinta-media hover:text-acao hover:underline">{t}</a>
              </li>
            ))}
          </ul>
        </nav>

        <article className="cartao px-5 py-8 sm:px-10 sm:py-10">
          <div className="max-w-[68ch] space-y-10">
            {secoes.map(({ titulo: t, conteudo }) => (
              <section key={t} id={ancora(t)} className="scroll-mt-24">
                <h2 className="text-2xl">{t}</h2>
                <div className="mt-3 space-y-3 text-[17px] leading-relaxed text-tinta [&_a]:font-bold [&_a]:text-acao [&_li]:ml-5 [&_li]:list-disc [&_strong]:font-extrabold">
                  {conteudo}
                </div>
              </section>
            ))}
          </div>
        </article>
      </div>
    </main>
  );
}
