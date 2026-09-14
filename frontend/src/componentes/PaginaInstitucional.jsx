import { Link } from "react-router-dom";

/**
 * Layout das páginas "Para Estudantes" e "Para Empresas".
 * As duas têm a mesma estrutura e mudam só o conteúdo, então para ajustar
 * uma frase mexe-se no arquivo da página, não neste.
 */
export default function PaginaInstitucional({ conteudo }) {
  const {
    etiqueta, titulo, subtitulo, acaoPrincipal, acaoSecundaria,
    numeros, passos, beneficios, perguntas, chamadaFinal,
  } = conteudo;

  return (
    <main>
      <section className="mx-auto max-w-screen-xl px-8 py-20 text-center">
        <span className="inline-block rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-600">
          {etiqueta}
        </span>

        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-neutral-900 sm:text-5xl">
          {titulo}
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-neutral-500">
          {subtitulo}
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            to={acaoPrincipal.para}
            className="rounded-xl bg-neutral-900 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-black"
          >
            {acaoPrincipal.rotulo}
          </Link>
          {acaoSecundaria && (
            <Link
              to={acaoSecundaria.para}
              className="rounded-xl border border-neutral-300 px-6 py-3.5 text-sm font-medium text-neutral-900 transition hover:border-neutral-900"
            >
              {acaoSecundaria.rotulo}
            </Link>
          )}
        </div>

        {numeros && (
          <dl className="mx-auto mt-14 grid max-w-2xl grid-cols-3 gap-6 border-t border-neutral-200 pt-9">
            {numeros.map((item) => (
              <div key={item.rotulo}>
                <dt className="text-2xl font-semibold text-neutral-900">
                  {item.valor}
                </dt>
                <dd className="mt-1 text-xs text-neutral-500">{item.rotulo}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <section className="border-y border-neutral-200 bg-white">
        <div className="mx-auto max-w-screen-xl px-8 py-20">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-neutral-900">
            Como funciona
          </h2>

          <ol className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-3">
            {passos.map((passo, indice) => (
              <li key={passo.titulo}>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-neutral-900 text-sm font-medium text-white">
                  {indice + 1}
                </span>
                <h3 className="mt-5 text-lg font-medium text-neutral-900">
                  {passo.titulo}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                  {passo.texto}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-screen-xl px-8 py-20">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {beneficios.map((beneficio) => (
            <div
              key={beneficio.titulo}
              className="rounded-2xl border border-neutral-200 bg-white p-7"
            >
              <h3 className="text-base font-medium text-neutral-900">
                {beneficio.titulo}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                {beneficio.texto}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-3xl px-8 py-20">
          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900">
            Perguntas frequentes
          </h2>

          <div className="mt-9 divide-y divide-neutral-200 border-y border-neutral-200">
            {perguntas.map((item) => (
              <details key={item.pergunta} className="group py-5">
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-medium text-neutral-900 marker:content-none">
                  {item.pergunta}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                       strokeLinejoin="round"
                       className="shrink-0 text-neutral-400 transition group-open:rotate-45"
                       aria-hidden="true">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                  {item.resposta}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-screen-xl px-8 py-20">
        <div className="rounded-3xl bg-neutral-900 px-8 py-16 text-center">
          <h2 className="mx-auto max-w-xl text-3xl font-semibold tracking-tight text-white">
            {chamadaFinal.titulo}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-neutral-400">
            {chamadaFinal.texto}
          </p>
          <Link
            to={chamadaFinal.para}
            className="mt-8 inline-block rounded-xl bg-white px-6 py-3.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-200"
          >
            {chamadaFinal.rotulo}
          </Link>
        </div>
      </section>
    </main>
  );
}