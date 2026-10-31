import { Component } from "react";

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
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-4 py-16 sm:px-6">
        <h1 className="text-3xl">Algo deu errado nesta tela</h1>
        <p className="mt-2 text-[17px] text-tinta-media">
          Recarregue a página. Se o erro continuar, avise a equipe do projeto.
        </p>

        {import.meta.env.DEV && (
          <pre className="aviso aviso--erro mt-6 block max-h-72 overflow-auto whitespace-pre-wrap font-mono text-xs font-normal leading-relaxed">
            {String(erro?.message || erro)}
            {erro?.stack ? `\n\n${erro.stack.split("\n").slice(1, 6).join("\n")}` : ""}
          </pre>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="botao"
          >
            Recarregar página
          </button>
          <a
            href="/"
            className="botao botao--contorno"
          >
            Ir para o início
          </a>
        </div>
      </main>
    );
  }
}