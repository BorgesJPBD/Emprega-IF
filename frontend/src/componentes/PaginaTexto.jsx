import { useEffect } from "react";

/* Layout das páginas de texto do rodapé (Quem somos, Termos, Privacidade):
   título, data de atualização e seções com subtítulo. */
export default function PaginaTexto({ titulo, resumo, atualizado, secoes }) {
  useEffect(() => window.scrollTo(0, 0), []);

  return (
    <main className="bg-white">
      <article className="mx-auto max-w-2xl px-6 py-16 sm:py-20">
        <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl">{titulo}</h1>
        {resumo && <p className="mt-5 text-lg leading-relaxed text-neutral-600">{resumo}</p>}
        {atualizado && <p className="mt-4 text-sm text-neutral-400">Atualizado em {atualizado}</p>}

        <div className="mt-12 space-y-10">
          {secoes.map(({ titulo: t, conteudo }) => (
            <section key={t}>
              <h2 className="text-xl font-semibold text-neutral-900">{t}</h2>
              <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-neutral-600 [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-neutral-800">
                {conteudo}
              </div>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
