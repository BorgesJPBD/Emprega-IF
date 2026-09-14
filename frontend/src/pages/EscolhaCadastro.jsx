import { Link } from "react-router-dom";

const ICONE = {
  estudante: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
         strokeLinejoin="round" aria-hidden="true">
      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
      <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
    </svg>
  ),
  empresa: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
         strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="7" width="18" height="14" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 13h18" />
    </svg>
  ),
};

const OPCOES = [
  {
    chave: "estudante",
    titulo: "Sou estudante",
    descricao:
      "Monte seu perfil, receba vagas compatíveis com seu curso e candidate-se em um clique.",
    itens: ["Vagas de estágio e jovem aprendiz", "Recomendações pelo seu perfil"],
    para: "/cadastro/estudante",
    acao: "Criar perfil de estudante",
    destaque: true,
  },
  {
    chave: "empresa",
    titulo: "Sou empresa",
    descricao:
      "Publique vagas e alcance diretamente os estudantes do Instituto Federal.",
    itens: ["Publicação de vagas", "Candidatos do público acadêmico"],
    para: "/cadastro/empresa",
    acao: "Criar conta empresarial",
    destaque: false,
  },
];

export default function EscolhaCadastro() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-14">
      <div className="text-center">
        <span className="inline-block rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-600">
          Criar conta
        </span>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-neutral-900">
          Como você vai usar o Emprega-IF?
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Escolha o tipo de conta para continuar
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
        {OPCOES.map((opcao) => (
          <Link
            key={opcao.chave}
            to={opcao.para}
            className={`group flex flex-col rounded-2xl border bg-white p-7 transition hover:-translate-y-0.5 hover:shadow-lg ${
              opcao.destaque
                ? "border-neutral-900 shadow-sm"
                : "border-neutral-200 hover:border-neutral-400"
            }`}
          >
            <span
              className={`grid h-11 w-11 place-items-center rounded-xl ${
                opcao.destaque
                  ? "bg-neutral-900 text-white"
                  : "border border-neutral-200 bg-neutral-50 text-neutral-700"
              }`}
            >
              {ICONE[opcao.chave]}
            </span>

            <h2 className="mt-5 text-xl font-semibold text-neutral-900">
              {opcao.titulo}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-500">
              {opcao.descricao}
            </p>

            <ul className="mt-5 space-y-2 text-sm text-neutral-600">
              {opcao.itens.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="2.5"
                       strokeLinecap="round" strokeLinejoin="round"
                       className="mt-1 shrink-0 text-neutral-400"
                       aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            <span
              className={`mt-7 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
                opcao.destaque
                  ? "bg-neutral-900 text-white group-hover:bg-black"
                  : "border border-neutral-300 text-neutral-900 group-hover:border-neutral-900"
              }`}
            >
              {opcao.acao}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                   strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </Link>
        ))}
      </div>

      <p className="mt-9 text-center text-sm text-neutral-500">
        Já tem uma conta?{" "}
        <Link className="font-medium text-neutral-900" to="/login">
          Entrar
        </Link>
      </p>
    </main>
  );
}