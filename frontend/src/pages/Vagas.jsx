import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Bookmark, Search, SearchX, X } from "lucide-react";

import AvisoExemplo from "../componentes/AvisoExemplo";
import Botao from "../componentes/Botao";
import CartaoVaga from "../componentes/CartaoVaga";
import Pilula, { GrupoPilulas } from "../componentes/Pilula";
import { useSalvas } from "../salvos";
import { TURNOS_LIVRES, buscarVagas, cidadeDe, turnoDa } from "../vagas";

function opcoes(vagas, campo) {
  const contagem = new Map();
  vagas.forEach((v) => contagem.set(v[campo], (contagem.get(v[campo]) ?? 0) + 1));
  return [...contagem].sort((a, b) => a[0].localeCompare(b[0], "pt-BR"));
}

const VAZIO = { q: "", tipo: "", area: "", local: "", turno: "", salvas: "" };

const lerUrl = (params) => Object.fromEntries(Object.keys(VAZIO).map((k) => [k, params.get(k) ?? ""]));
const paraUrl = (f) => Object.fromEntries(Object.entries(f).filter(([, v]) => v));

const doisDigitos = (n) => String(n).padStart(2, "0");

export default function Vagas() {
  const [params, setParams] = useSearchParams();
  const inicial = lerUrl(params);
  const [rascunho, setRascunho] = useState(inicial);
  const [filtros, setFiltros] = useState(inicial);
  const [todas, setTodas] = useState([]);
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const salvas = useSalvas();
  const campo = useRef(null);
  const pedido = useRef(0);

  async function aplicar(novos) {
    const meu = ++pedido.current;
    setFiltros(novos);
    setParams(paraUrl(novos), { replace: true });
    setCarregando(true);
    setErro("");
    try {
      const vagas = await buscarVagas({ q: novos.q, tipo: novos.tipo, area: novos.area, localizacao: novos.local });
      if (meu === pedido.current) setLista(vagas);
    } catch (e) {
      if (meu === pedido.current) setErro(e.message);
    } finally {
      if (meu === pedido.current) setCarregando(false);
    }
  }

  useEffect(() => {
    buscarVagas().then(setTodas).catch(() => setTodas([]));
    aplicar(inicial);
    if (window.matchMedia("(min-width: 768px)").matches) campo.current?.focus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (rascunho.q === filtros.q) return;
    const espera = setTimeout(() => aplicar({ ...filtros, q: rascunho.q }), 300);
    return () => clearTimeout(espera);
  }, [rascunho.q]); // eslint-disable-line react-hooks/exhaustive-deps

  const TIPOS = opcoes(todas, "tipo");
  const AREAS = opcoes(todas, "area");
  const LOCAIS = opcoes(todas, "local");

  const alternar = (nome, valor) => {
    const novos = { ...rascunho, [nome]: rascunho[nome] === valor ? "" : valor };
    setRascunho(novos);
    if (nome === "turno" || nome === "salvas") {
      setFiltros(novos);
      setParams(paraUrl(novos), { replace: true });
    } else {
      aplicar(novos);
    }
  };

  function buscar(evento) {
    evento.preventDefault();
    aplicar(rascunho);
  }

  function limpar() {
    setRascunho(VAZIO);
    aplicar(VAZIO);
  }

  const visiveis = lista.filter((v) =>
    (!filtros.turno || TURNOS_LIVRES[filtros.turno]?.includes(turnoDa(v))) &&
    (!filtros.salvas || salvas.includes(String(v.id))));
  const ativos = Object.values(filtros).filter(Boolean).length;

  return (
    <main className="container-site pb-28 pt-6 sm:pb-20 sm:pt-10">
      <header className="flex flex-col gap-3 border-b border-linha pb-6 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-[clamp(2.75rem,7vw,5rem)]">
          {filtros.salvas ? "Vagas salvas" : "Vagas abertas"}
        </h1>
        <p className="max-w-[38ch] text-[17px] text-tinta-media sm:text-right">
          Explore sem fazer login. Toque num filtro para ligar, toque de novo para desligar.
        </p>
      </header>

      <form onSubmit={buscar} role="search" className="mt-6 grid gap-3 lg:grid-cols-12">
        <div className="cartao p-5 lg:col-span-7">
          <label htmlFor="busca-vagas" className="mb-2 block text-[15px] font-semibold text-floresta">Palavra-chave</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-acao" />
            <input
              id="busca-vagas"
              ref={campo}
              type="text"
              inputMode="search"
              enterKeyHint="search"
              placeholder="Cargo, área ou empresa"
              value={rascunho.q}
              maxLength={100}
              onChange={(e) => setRascunho({ ...rascunho, q: e.target.value })}
              className="entrada min-h-14 border-[1.5px] border-floresta pl-12 pr-12 text-lg"
            />
            {rascunho.q && (
              <button
                type="button"
                aria-label="Apagar a busca"
                onClick={() => { setRascunho({ ...rascunho, q: "" }); campo.current?.focus(); }}
                className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full text-tinta-media hover:bg-superficie-2 hover:text-floresta"
              >
                <X className="size-5" />
              </button>
            )}
          </div>
        </div>

        <GrupoPilulas titulo="Modalidade" className="cartao p-5 lg:col-span-5">
          {TIPOS.map(([tipo, n]) => (
            <Pilula key={tipo} ativa={rascunho.tipo === tipo} conta={doisDigitos(n)} onClick={() => alternar("tipo", tipo)}>
              {tipo}
            </Pilula>
          ))}
        </GrupoPilulas>

        <GrupoPilulas titulo="Cidade" className="cartao p-5 lg:col-span-5">
          {LOCAIS.map(([local, n]) => (
            <Pilula key={local} ativa={rascunho.local === local} conta={doisDigitos(n)} onClick={() => alternar("local", local)}>
              <span className="dado">{cidadeDe(local)}</span>
            </Pilula>
          ))}
        </GrupoPilulas>

        <GrupoPilulas titulo="Área do seu curso" className="cartao p-5 lg:col-span-4">
          {AREAS.map(([area, n]) => (
            <Pilula key={area} ativa={rascunho.area === area} conta={doisDigitos(n)} onClick={() => alternar("area", area)}>
              {area}
            </Pilula>
          ))}
        </GrupoPilulas>

        <GrupoPilulas titulo="Seu turno livre" className="cartao p-5 lg:col-span-3">
          {Object.keys(TURNOS_LIVRES).map((turno) => (
            <Pilula key={turno} ativa={rascunho.turno === turno} onClick={() => alternar("turno", turno)}>
              {turno}
            </Pilula>
          ))}
        </GrupoPilulas>
      </form>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[17px] font-semibold" aria-live="polite">
          {carregando ? "Carregando vagas..." : (
            <>
              <span className="mono mr-2 text-acao">{doisDigitos(visiveis.length)}</span>
              {visiveis.length === 1 ? "vaga encontrada" : "vagas encontradas"}
              {filtros.q && ` para “${filtros.q}”`}
            </>
          )}
        </p>
        <div className="flex items-center gap-2">
          <Pilula ativa={Boolean(rascunho.salvas)} conta={doisDigitos(salvas.length)} onClick={() => alternar("salvas", "1")}>
            <Bookmark className="size-4" fill={rascunho.salvas ? "currentColor" : "none"} aria-hidden="true" /> Salvas
          </Pilula>
          {ativos > 0 && !carregando && (
            <button type="button" onClick={limpar} className="link hidden min-h-11 px-2 text-[15px] sm:inline">Limpar filtros</button>
          )}
        </div>
      </div>

      <AvisoExemplo className="mt-2" />

      {erro ? (
        <p role="alert" className="aviso aviso--erro mt-4">{erro}</p>
      ) : carregando ? (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="cartao h-64 animate-pulse bg-superficie-2" />
          ))}
        </div>
      ) : visiveis.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visiveis.map((vaga, i) => (
            <CartaoVaga key={vaga.id} vaga={vaga} destaque={i === 0 && visiveis.length > 2} className={i === 0 && visiveis.length > 2 ? "md:col-span-2" : ""} />
          ))}
        </div>
      ) : (
        <div className="cartao mt-4 flex flex-col items-start gap-5 px-6 py-10 sm:flex-row sm:items-center sm:px-8">
          <span className="picto">{filtros.salvas ? <Bookmark className="size-5" /> : <SearchX className="size-5" />}</span>
          <div className="flex-1">
            <h2 className="text-2xl">
              {filtros.salvas
                ? "Nenhuma vaga salva ainda"
                : !todas.length
                  ? "Nenhuma vaga aberta no momento"
                  : filtros.local && ativos === 1
                    ? `Nenhuma vaga aberta em ${cidadeDe(filtros.local)} agora`
                    : "Nenhuma vaga com esses filtros"}
            </h2>
            <p className="mt-2 max-w-[60ch] text-[15px] text-tinta-media">
              {filtros.salvas
                ? "Toque no marcador de um cartão para guardar a vaga aqui. Elas ficam salvas neste navegador."
                : todas.length
                  ? "Desligue um filtro ou troque a palavra. Novas vagas entram assim que as empresas publicam."
                  : "Assim que uma empresa publicar uma vaga, ela aparece aqui."}
            </p>
          </div>
          {ativos > 0 && <Botao variante="contorno" onClick={limpar}>Limpar filtros</Botao>}
        </div>
      )}

      {ativos > 0 && !carregando && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-linha bg-fundo px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:hidden">
          <div className="flex items-center gap-3">
            <p className="flex-1 text-[15px] font-semibold">
              <span className="mono text-acao">{doisDigitos(visiveis.length)}</span> {visiveis.length === 1 ? "vaga" : "vagas"} · {ativos} {ativos === 1 ? "filtro" : "filtros"}
            </p>
            <Botao variante="contorno" compacto onClick={limpar}>Limpar</Botao>
            <Botao variante="lima" compacto onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Filtros</Botao>
          </div>
        </div>
      )}
    </main>
  );
}
