import { Component } from "react";

/**
 * Se qualquer tela quebrar ao renderizar, mostra o erro aqui em vez de deixar a
 * página branca. Em desenvolvimento exibe a mensagem técnica; em produção, só o aviso.
 */
export default class ErroTela extends Component {
  state = { erro: null };

  static getDerivedStateFromError(erro) {
    return { erro };
  }

  componentDidCatch(erro, info) {
    console.error("Erro ao renderizar a tela:", erro, info.componentStack);
  }

  render() {
    const { erro } = this.state;
    if (!erro) return this.props.children;

    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Algo deu errado nesta tela</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Recarregue a página. Se o erro continuar, avise a equipe do projeto.
        </p>

        {import.meta.env.DEV && (
          <pre className="mt-6 max-h-72 overflow-auto rounded-xl border border-red-200 bg-red-50 p-4 text-xs leading-relaxed text-red-800">
            {String(erro?.message || erro)}
            {erro?.stack ? `\n\n${erro.stack.split("\n").slice(1, 6).join("\n")}` : ""}
          </pre>
        )}

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-black"
          >
            Recarregar página
          </button>
          <a
            href="/"
            className="rounded-xl border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-900 transition hover:border-neutral-900"
          >
            Ir para o início
          </a>
        </div>
      </main>
    );
  }
}