import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BadgeCheck, CalendarCheck, Search, Sparkles, UserPlus } from "lucide-react";

import CartaoVaga from "../componentes/CartaoVaga";
import Vitrine from "../componentes/Vitrine";
import { get } from "../api";
import { CORES, ICONES, buscarVagas } from "../vagas";

const FILTROS = ["Todas", "Estágio", "Jovem aprendiz"];

/* Logo abaixo dos botões do topo: o que o estudante ganha, em poucas palavras. */
const VANTAGENS = [
  { Icone: BadgeCheck, texto: "Gratuito para estudantes" },
  { Icone: Sparkles, texto: "Sem exigir experiência" },
];

/* Faixa que desliza no fim do topo: as áreas que têm vagas na plataforma. */
const AREAS = Object.keys(ICONES);

/* Números reais, contados no banco (GET /estatisticas -> view vw_estatisticas). */
const NUMEROS = [
  { chave: "vagas_abertas", rotulo: "vagas com inscrições abertas" },
  { chave: "empresas", rotulo: "empresas parceiras" },
  { chave: "estudantes", rotulo: "estudantes cadastrados" },
  { chave: "candidaturas", rotulo: "candidaturas enviadas" },
];

const PASSOS = [
  { Icone: UserPlus, titulo: "Crie seu perfil", texto: "Curso, período e contato. Leva poucos minutos e vale para todas as vagas." },
  { Icone: Search, titulo: "Encontre a vaga", texto: "Busque por palavra ou filtre por tipo, área e cidade. Sem precisar de login para olhar." },
  { Icone: CalendarCheck, titulo: "Candidate-se e acompanhe", texto: "Um clique para se candidatar. A confirmação chega por e-mail e cada etapa aparece no seu painel." },
];

const ESTILO = `
@keyframes entra{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.anima-entra{animation:entra .7s cubic-bezier(.2,.7,.2,1) both}
@keyframes faixa{to{transform:translateX(-50%)}}
.anima-faixa{animation:faixa 38s linear infinite}
.faixa:hover .anima-faixa{animation-play-state:paused}
@media (prefers-reduced-motion:reduce){.anima-entra,.anima-faixa{animation:none}}
`;

const REDUZ =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function useVisivel(limiar = 0.35) {
  const ref = useRef(null);
  const [visivel, setVisivel] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setVisivel(true);
        obs.disconnect();
      }
    }, { threshold: limiar });
    obs.observe(el);
    return () => obs.disconnect();
  }, [limiar]);
  return [ref, visivel];
}

function Contador({ alvo, ativo }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!ativo) return;
    if (REDUZ) return setN(alvo);
    let quadro;
    const inicio = performance.now();
    const passo = (agora) => {
      const p = Math.min((agora - inicio) / 1200, 1);
      setN(Math.round(alvo * (1 - Math.pow(1 - p, 3))));
      if (p < 1) quadro = requestAnimationFrame(passo);
    };
    quadro = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(quadro);
  }, [ativo, alvo]);
  return <>{n.toLocaleString("pt-BR")}</>;
}

export default function Home() {
  const [refNumeros, numerosVisiveis] = useVisivel();
  const [filtro, setFiltro] = useState("Todas");
  const [todasVagas, setTodasVagas] = useState([]);
  const [numeros, setNumeros] = useState(null);
  const [termo, setTermo] = useState("");
  const navegar = useNavigate();

  // a busca do topo abre a página de vagas já filtrada (/vagas?q=...)
  function buscarNoTopo(evento) {
    evento.preventDefault();
    const q = termo.trim();
    navegar(q ? `/vagas?q=${encodeURIComponent(q)}` : "/vagas");
  }

  // vagas e números reais do banco; se a API estiver fora do ar, as seções ficam vazias
  useEffect(() => {
    buscarVagas({ limite: 30 }).then(setTodasVagas).catch(() => setTodasVagas([]));
    get("/estatisticas").then(setNumeros).catch(() => setNumeros(null));
  }, []);

  const vagas = todasVagas.filter((v) => filtro === "Todas" || v.tipo === filtro).slice(0, 3);

  return (
    <main>
      <style>{ESTILO}</style>

      {/* ---------- topo: o que é + prévia do produto ---------- */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-screen-xl items-center gap-12 px-6 py-14 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:py-20">
          <div className="anima-entra">
            <span className="inline-flex items-center gap-2 rounded-full border border-marca-200 bg-marca-50 px-3 py-1 text-xs font-medium text-marca-800">
              <span className="size-1.5 rounded-full bg-marca-600" aria-hidden="true" />
              Projeto de extensão do IFMS
            </span>

            <h1 className="mt-6 max-w-xl text-5xl font-semibold leading-[1.02] tracking-tight text-neutral-900 sm:text-6xl lg:text-7xl">
              Conectamos talentos às melhores vagas
            </h1>

            <p className="mt-6 max-w-md text-base leading-relaxed text-neutral-600 sm:text-lg">
              Estágios e vagas de jovem aprendiz para estudantes do Instituto Federal.
              Você se candidata com um clique e acompanha cada etapa.
            </p>

            <form onSubmit={buscarNoTopo} role="search" className="mt-9 flex max-w-xl flex-col gap-2 rounded-2xl border border-neutral-200 bg-white p-2 shadow-sm focus-within:border-neutral-400 sm:flex-row">
              <label className="relative flex-1">
                <span className="sr-only">Qual vaga você procura?</span>
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  inputMode="search"
                  enterKeyHint="search"
                  value={termo}
                  maxLength={100}
                  onChange={(e) => setTermo(e.target.value)}
                  placeholder="Qual vaga você procura?"
                  className="w-full rounded-xl bg-transparent py-3 pl-10 pr-3 text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                />
              </label>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-black"
              >
                Buscar vagas
              </button>
            </form>

            <p className="mt-4 text-sm text-neutral-500">
              Ou{" "}
              <Link to="/vagas" className="font-medium text-neutral-900 underline-offset-4 hover:underline">veja todas as vagas</Link>
              {" "}· É empresa?{" "}
              <Link to="/para-empresas" className="font-medium text-neutral-900 underline-offset-4 hover:underline">Publique uma vaga</Link>
            </p>

            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-neutral-600">
              {VANTAGENS.map(({ Icone, texto }) => (
                <li key={texto} className="inline-flex items-center gap-2">
                  <Icone className="size-4 text-marca-600" /> {texto}
                </li>
              ))}
            </ul>
          </div>

          <Vitrine vagas={todasVagas} total={numeros?.vagas_abertas} />
        </div>

        {/* faixa de áreas: a lista aparece duas vezes para o deslize não ter emenda */}
        <div className="faixa border-t border-neutral-200 py-5">
          <div className="mx-auto flex max-w-screen-xl items-center gap-6 px-6 sm:px-8">
            <p className="hidden shrink-0 text-xs font-medium uppercase tracking-wider text-neutral-400 sm:block">
              Vagas em áreas como
            </p>
            <div className="relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
              <ul className="anima-faixa flex w-max gap-3">
                {[...AREAS, ...AREAS].map((area, i) => {
                  const Icone = ICONES[area];
                  return (
                    <li key={i} aria-hidden={i >= AREAS.length}
                      className="inline-flex shrink-0 items-center gap-2 rounded-full border border-neutral-200 bg-white py-1.5 pl-1.5 pr-4 text-sm text-neutral-700">
                      <span className={`grid size-7 place-items-center rounded-full ${CORES[area]}`}>
                        <Icone className="size-3.5" />
                      </span>
                      {area}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- como funciona (é uma sequência, por isso numerada) ---------- */}
      <section className="border-y border-neutral-200 bg-neutral-100">
        <div className="mx-auto max-w-screen-xl px-6 py-20 sm:px-8 lg:py-24">
          <h2 className="max-w-md text-4xl font-semibold leading-tight tracking-tight text-neutral-900 lg:text-5xl">
            Do cadastro à contratação
          </h2>

          <ol className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
            {PASSOS.map(({ Icone, titulo, texto }, i) => (
              <li key={titulo} className="rounded-2xl border border-neutral-200 bg-white p-7">
                <div className="flex items-center justify-between">
                  <span className="grid size-12 place-items-center rounded-xl bg-marca-50 text-marca-700">
                    <Icone className="size-6 stroke-[1.6]" />
                  </span>
                  <span className="text-sm font-medium tabular-nums text-neutral-400">Passo {i + 1}</span>
                </div>
                <h3 className="mt-8 text-lg font-semibold text-neutral-900" style={{ fontFamily: "var(--font-titulo)" }}>
                  {titulo}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500">{texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- números (contados no banco) ---------- */}
      <section ref={refNumeros} className="bg-neutral-900 text-white">
        <div className="mx-auto grid max-w-screen-xl gap-12 px-6 py-20 sm:px-8 lg:grid-cols-[1fr_2fr] lg:py-24">
          <div>
            <h2 className="text-4xl font-semibold leading-tight tracking-tight lg:text-5xl">A plataforma hoje</h2>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-400">
              Contados direto no banco de dados a cada visita. Nada de número inventado.
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-10">
            {NUMEROS.map((n) => (
              <div key={n.chave} className="flex flex-col-reverse border-l border-white/15 pl-5">
                <dt className="mt-2 text-sm text-neutral-400">{n.rotulo}</dt>
                <dd className="text-5xl font-semibold tabular-nums tracking-tight lg:text-6xl" style={{ fontFamily: "var(--font-titulo)" }}>
                  {numeros ? <Contador alvo={numeros[n.chave]} ativo={numerosVisiveis} /> : "—"}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------- vagas em destaque ---------- */}
      <section className="bg-white">
        <div className="mx-auto max-w-screen-xl px-6 py-20 sm:px-8 lg:py-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-4xl font-semibold tracking-tight text-neutral-900 lg:text-5xl">Vagas recentes</h2>
            <Link to="/vagas" className="group inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition hover:text-marca-700">
              Ver todas as vagas
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filtrar por tipo">
            {FILTROS.map((nome) => (
              <button
                key={nome}
                type="button"
                aria-pressed={filtro === nome}
                onClick={() => setFiltro(nome)}
                className={`rounded-full border px-4 py-1.5 text-xs transition ${
                  filtro === nome
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 bg-white text-neutral-600 hover:border-neutral-500"
                }`}
              >
                {nome}
              </button>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {vagas.map((vaga, i) => (
              <CartaoVaga key={`${filtro}-${vaga.id}`} vaga={vaga} indice={i} />
            ))}
          </div>
          {vagas.length === 0 && (
            <p className="mt-2 text-sm text-neutral-500">Nenhuma vaga aberta deste tipo no momento.</p>
          )}
        </div>
      </section>
    </main>
  );
}
