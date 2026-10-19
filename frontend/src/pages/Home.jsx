import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Clock, MailCheck, MapPin, Search, UserPlus, CalendarCheck } from "lucide-react";

import CartaoVaga from "../componentes/CartaoVaga";
import { get } from "../api";
import { COR_TIPO, buscarVagas } from "../vagas";

const FILTROS = ["Todas", "Estágio", "Jovem aprendiz"];

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

/* Etapas da prévia do topo: a mesma sequência que o estudante vê em
   "Minhas candidaturas". Elas aparecem uma depois da outra ao abrir a página
   (é a única animação automática da Home). */
const ETAPAS = [
  { Icone: Check, texto: "Candidatura enviada", detalhe: "agora mesmo" },
  { Icone: MailCheck, texto: "Confirmação enviada para o seu e-mail", detalhe: "no mesmo minuto" },
  { Icone: null, texto: "Aguardando a resposta da empresa", detalhe: "você é avisado por e-mail" },
];

const ESTILO = `
@keyframes entra{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes etapa{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}
.anima-entra{animation:entra .7s cubic-bezier(.2,.7,.2,1) both}
.anima-etapa{animation:etapa .5s cubic-bezier(.2,.7,.2,1) both}
@media (prefers-reduced-motion:reduce){.anima-entra,.anima-etapa{animation:none}}
`;

const REDUZ =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const atraso = (ms) => ({ animationDelay: `${ms}ms` });

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

/** Prévia do produto: uma vaga real do banco e a candidatura andando. */
function Previa({ vaga }) {
  if (!vaga) {
    return <div className="aspect-[4/5] w-full max-w-md rounded-[28px] bg-neutral-900 lg:ml-auto" aria-hidden="true" />;
  }
  const { Icone } = vaga;
  return (
    <figure className="anima-entra w-full max-w-md rounded-[28px] bg-neutral-900 p-5 sm:p-7 lg:ml-auto" style={atraso(250)}>
      <figcaption className="sr-only">Exemplo de candidatura a uma vaga da plataforma</figcaption>

      <div className="rounded-2xl bg-white p-5">
        <div className="flex items-start justify-between gap-3">
          <span className={`grid size-10 place-items-center rounded-xl ${vaga.cor}`}>
            <Icone className="size-5" />
          </span>
          <span className={`rounded-full border px-2.5 py-0.5 text-[11px] ${COR_TIPO[vaga.tipo] ?? "border-neutral-200 text-neutral-600"}`}>
            {vaga.tipo}
          </span>
        </div>
        <p className="mt-4 text-lg font-semibold leading-snug text-neutral-900" style={{ fontFamily: "var(--font-titulo)" }}>
          {vaga.titulo}
        </p>
        <p className="text-sm text-neutral-500">{vaga.empresa}</p>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
          <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5" />{vaga.local}</span>
          <span className="inline-flex items-center gap-1.5"><Clock className="size-3.5" />{vaga.horario}</span>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4">
          <span className="text-sm font-medium text-neutral-900">
            {vaga.valor ? `R$ ${vaga.valor.toLocaleString("pt-BR")} / mês` : "A combinar"}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-marca-600 px-3 py-1.5 text-xs font-medium text-white">
            <Check className="size-3.5" /> Candidatado
          </span>
        </div>
      </div>

      <p className="mt-6 text-sm font-medium text-white">Sua candidatura</p>
      <ol className="mt-3 space-y-3">
        {ETAPAS.map(({ Icone: IconeEtapa, texto, detalhe }, i) => (
          <li key={texto} className="anima-etapa flex items-start gap-3" style={atraso(900 + i * 700)}>
            {IconeEtapa ? (
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-marca-600 text-white">
                <IconeEtapa className="size-3" strokeWidth={3} />
              </span>
            ) : (
              <span className="relative mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-marca-500/60">
                <span className="size-1.5 rounded-full bg-marca-500 motion-safe:animate-pulse" />
              </span>
            )}
            <span>
              <span className="block text-sm text-neutral-100">{texto}</span>
              <span className="block text-xs text-neutral-500">{detalhe}</span>
            </span>
          </li>
        ))}
      </ol>
    </figure>
  );
}

export default function Home() {
  const [refNumeros, numerosVisiveis] = useVisivel();
  const [filtro, setFiltro] = useState("Todas");
  const [todasVagas, setTodasVagas] = useState([]);
  const [numeros, setNumeros] = useState(null);

  // vagas e números reais do banco; se a API estiver fora do ar, as seções ficam vazias
  useEffect(() => {
    buscarVagas({ limite: 30 }).then(setTodasVagas).catch(() => setTodasVagas([]));
    get("/estatisticas").then(setNumeros).catch(() => setNumeros(null));
  }, []);

  const vagas = todasVagas.filter((v) => filtro === "Todas" || v.tipo === filtro).slice(0, 3);
  const destaque = todasVagas.find((v) => v.tipo === "Estágio") ?? todasVagas[0];

  return (
    <main>
      <style>{ESTILO}</style>

      {/* ---------- topo: o que é + prévia do produto ---------- */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-screen-xl items-center gap-12 px-6 py-16 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:py-24">
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

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/vagas"
                className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-black"
              >
                Ver vagas abertas
              </Link>
              <Link
                to="/para-empresas"
                className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 px-6 py-3.5 text-sm font-medium text-neutral-800 transition hover:border-neutral-900"
              >
                Sou empresa
              </Link>
            </div>
          </div>

          <Previa vaga={destaque} />
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
