import { useMemo, useState } from "react";
import { ChevronDown, Search, SearchX } from "lucide-react";

import CartaoVaga from "../componentes/CartaoVaga";
import { VAGAS } from "../dados/vagas";

const ESTILO = `
@keyframes entra{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
.anima-entra{animation:entra .6s cubic-bezier(.2,.7,.2,1) both}
@media (prefers-reduced-motion:reduce){.anima-entra{animation:none}}
`;

const opcoes = (campo) =>
  [...new Set(VAGAS.map((v) => v[campo]))].sort((a, b) => a.localeCompare(b, "pt-BR"));

const TIPOS = opcoes("tipo");
const AREAS = opcoes("area");
const LOCAIS = opcoes("local");
const VAZIO = { tipo: "", area: "", local: "" };

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

  const lista = useMemo(
    () =>
      VAGAS.filter(
        (v) =>
          (!filtros.tipo || v.tipo === filtros.tipo) &&
          (!filtros.area || v.area === filtros.area) &&
          (!filtros.local || v.local === filtros.local)
      ),
    [filtros]
  );

  const alterar = (campo) => (valor) => setRascunho((atual) => ({ ...atual, [campo]: valor }));

  function buscar(evento) {
    evento.preventDefault();
    setFiltros(rascunho);
  }

  function limpar() {
    setRascunho(VAZIO);
    setFiltros(VAZIO);
  }

  return (
    <main className="mx-auto max-w-screen-xl px-8 py-16">
      <style>{ESTILO}</style>

      <p className="text-xs uppercase tracking-widest text-neutral-400">Oportunidades</p>
      <h1 className="mt-4 text-5xl font-semibold tracking-tight text-neutral-900">Vagas disponíveis</h1>
      <p className="mt-2 text-sm text-neutral-500">Explore as oportunidades sem precisar fazer login</p>

      <form
        onSubmit={buscar}
        className="mt-10 flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-5 md:flex-row"
      >
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
        {lista.length === 1 ? "1 vaga encontrada" : `${lista.length} vagas encontradas`}
      </p>

      {lista.length > 0 ? (
        <div key={JSON.stringify(filtros)} className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {lista.map((vaga, i) => (
            <CartaoVaga key={vaga.id} vaga={vaga} indice={i} />
          ))}
        </div>
      ) : (
        <div className="anima-entra mt-4 flex flex-col items-center rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
          <SearchX className="size-8 text-neutral-400" />
          <h2 className="mt-4 text-base font-medium text-neutral-900">Nenhuma vaga com esses filtros</h2>
          <p className="mt-1 text-sm text-neutral-500">Troque o tipo, a área ou o local para ver mais oportunidades.</p>
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