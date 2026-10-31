import PlacaTitulo from "./PlacaTitulo";

export default function PaginaFormulario({ titulo, resumo, voltar, largura = "max-w-3xl", children }) {
  return (
    <main className="container-site pb-20 pt-6 sm:pt-10">
      <div className={`mx-auto ${largura}`}>
        <PlacaTitulo titulo={titulo} resumo={resumo} voltar={voltar} />
        <div className="cartao mt-4 p-5 sm:p-8">{children}</div>
      </div>
    </main>
  );
}
