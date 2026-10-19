import { useEffect, useState } from "react";
import { ChevronDown, Search, SearchX } from "lucide-react";

import CartaoVaga from "../componentes/CartaoVaga";
import { buscarVagas } from "../vagas";

const ESTILO = `
@keyframes entra{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
.anima-entra{animation:entra .6s cubic-bezier(.2,.7,.2,1) both}
@media (prefers-reduced-motion:reduce){.anima-entra{animation:none}}
`;

/* opções dos filtros: só o que existe nas vagas abertas */
const opcoes = (vagas, campo) =>
  [...new Set(vagas.map((v) => v[campo]))].sort((a, b) => a.localeCompare(b, "pt-BR"));

const VAZIO = { q: "", tipo: "", area: "", local: "" };

function Seletor({ rotulo, todas, valor, lista, onChange }) {
  return (
    <div className="relative flex-1">
      <select
        aria-label={rotulo}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-xl border border-neutral-200 bg-white px-4 py-3 pr-10 text-sm text-neutral-800 transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
      >
        <option value="">{rotulo}: {todas}</option>
        {lista.map((item) => (
          <option key={item} value={item}>{rotulo}: {item}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
    </div>
  );
}

export default function Vagas() {
  const [rascunho, setRascunho] = useState(VAZIO); // o que está nos selects
  const [filtros, setFiltros] = useState(VAZIO);   // o que foi aplicado em "Buscar vagas"
  const [todas, setTodas] = useState([]);          // sem filtro, para montar as opções
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  // primeira carga: todas as vagas abertas
  useEffect(() => {
    buscarVagas()
      .then((vagas) => { setTodas(vagas); setLista(vagas); })
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  // a filtragem acontece no banco (GET /vagas?tipo=...&area=...&localizacao=...)
  async function aplicar(novos) {
    setFiltros(novos);
    setCarregando(true);
    setErro("");
    try {
      setLista(await buscarVagas({ q: novos.q, tipo: novos.tipo, area: novos.area, localizacao: novos.local }));
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  const TIPOS = opcoes(todas, "tipo");
  const AREAS = opcoes(todas, "area");
  const LOCAIS = opcoes(todas, "local");

  const alterar = (campo) => (valor) => setRascunho((atual) => ({ ...atual, [campo]: valor }));

  function buscar(evento) {
    evento.preventDefault();
    aplicar(rascunho);
  }

  function limpar() {
    setRascunho(VAZIO);
    aplicar(VAZIO);
  }

  return (
    <main className="mx-auto max-w-screen-xl px-8 py-16">
      <style>{ESTILO}</style>

      <h1 className="text-5xl font-semibold tracking-tight text-neutral-900">Vagas disponíveis</h1>
      <p className="mt-2 text-sm text-neutral-500">Explore as oportunidades sem precisar fazer login</p>

      <form
        onSubmit={buscar}
        className="mt-10 flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-5 md:flex-row md:flex-wrap"
      >
        {/* busca textual no banco: título e descrição, sem diferenciar acentos */}
        <div className="relative w-full md:basis-full">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="search"
            aria-label="Buscar vagas por palavra"
            placeholder="Busque por palavra: desenvolvimento, design, vendas..."
            value={rascunho.q}
            maxLength={100}
            onChange={(e) => alterar("q")(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white py-3 pl-11 pr-4 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
          />
        </div>
        <Seletor rotulo="Tipo" todas="Todas" valor={rascunho.tipo} lista={TIPOS} onChange={alterar("tipo")} />
        <Seletor rotulo="Área" todas="Todas" valor={rascunho.area} lista={AREAS} onChange={alterar("area")} />
        <Seletor rotulo="Local" todas="Todos" valor={rascunho.local} lista={LOCAIS} onChange={alterar("local")} />
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-8 py-3 text-sm font-medium text-white transition hover:bg-black md:w-auto"
        >
          <Search className="size-4" /> Buscar vagas
        </button>
      </form>

      <p className="mt-8 text-xs text-neutral-500" aria-live="polite">
        {carregando
          ? "Carregando vagas..."
          : lista.length === 1 ? "1 vaga encontrada" : `${lista.length} vagas encontradas`}
      </p>

      {erro ? (
        <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>
      ) : carregando ? (
        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl border border-neutral-200 bg-white" />
          ))}
        </div>
      ) : lista.length > 0 ? (
        <div key={JSON.stringify(filtros)} className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {lista.map((vaga, i) => (
            <CartaoVaga key={vaga.id} vaga={vaga} indice={i} />
          ))}
        </div>
      ) : (
        <div className="anima-entra mt-4 flex flex-col items-center rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
          <SearchX className="size-8 text-neutral-400" />
          <h2 className="mt-4 text-base font-medium text-neutral-900">
            {todas.length ? "Nenhuma vaga encontrada" : "Nenhuma vaga aberta no momento"}
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            {todas.length
              ? "Troque a palavra, o tipo, a área ou o local para ver mais oportunidades."
              : "Assim que uma empresa publicar uma vaga, ela aparece aqui."}
          </p>
          <button
            type="button"
            onClick={limpar}
            className="mt-6 rounded-xl border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-900 transition hover:border-neutral-900"
          >
            Limpar filtros
          </button>
        </div>
      )}
    </main>
  );
}