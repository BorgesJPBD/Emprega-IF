import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, ArrowUpRight, Briefcase, Building2, CalendarCheck, Clock,
  FileText, MapPin, Monitor, Search, TrendingUp, Truck, UserPlus,
  UserRound, Wrench,
} from "lucide-react";
import CartaoVaga from "../componentes/CartaoVaga";
import { get } from "../api";
import { buscarVagas } from "../vagas";

/* ---------- dados mockados ---------- */

const FILTROS = ["Todas", "Estágio", "Jovem aprendiz"];

/* Números reais, contados no banco (GET /estatisticas -> view vw_estatisticas). */
const NUMEROS = [
  { chave: "estudantes", rotulo: "Estudantes cadastrados", apoio: "com perfil ativo" },
  { chave: "empresas", rotulo: "Empresas parceiras", apoio: "de diversos setores" },
  { chave: "vagas_abertas", rotulo: "Vagas abertas", apoio: "com inscrições em andamento" },
  { chave: "candidaturas", rotulo: "Candidaturas enviadas", apoio: "pela plataforma" },
];

const PASSOS = [
  { Icone: UserPlus, titulo: "Faça seu cadastro", texto: "Crie seu perfil com suas informações acadêmicas, currículo e áreas de interesse em poucos minutos." },
  { Icone: Search, titulo: "Explore as vagas", texto: "Filtre oportunidades por área, localização, carga horária e remuneração alinhadas ao seu perfil." },
  { Icone: CalendarCheck, titulo: "Candidate-se", texto: "Envie sua candidatura e agende entrevistas diretamente com as empresas pela plataforma." },
];

const EVENTOS = [
  "Tech Solutions publicou Estágio em Desenvolvimento Web",
  "Nova candidatura em Jovem Aprendiz — Administrativo",
  "Agência Criativa abriu vaga de Marketing Digital",
  "Rede Conecta publicou Estágio em Suporte de TI",
];

/* nós do diagrama do hero: posição em % do quadro (450 x 300) */
const NOS = [
  { rotulo: "Vagas", x: 50, y: 17, Icone: FileText },
  { rotulo: "Estudante", x: 14, y: 50, Icone: UserRound },
  { rotulo: "Empresa", x: 86, y: 50, Icone: Building2 },
  { rotulo: "Oportunidades", x: 50, y: 83, Icone: Briefcase },
];
const FLUXOS = ["M63 150 L225 150", "M387 150 L225 150", "M225 150 L225 51", "M225 150 L225 249"];

const ESTILO = `
@keyframes entra{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
@keyframes flutua{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes troca{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.anima-entra{animation:entra .7s cubic-bezier(.2,.7,.2,1) both}
.anima-flutua{animation:flutua 5s ease-in-out infinite}
.anima-troca{animation:troca .45s ease both}
@media (prefers-reduced-motion:reduce){.anima-entra,.anima-flutua,.anima-troca{animation:none}}
`;

const REDUZ =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const atraso = (ms) => ({ animationDelay: `${ms}ms` });

/** Fica true na primeira vez que o elemento aparece na tela. */
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

function Contador({ alvo, sufixo, ativo }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!ativo) return;
    if (REDUZ) return setN(alvo);
    let quadro;
    const inicio = performance.now();
    const passo = (agora) => {
      const p = Math.min((agora - inicio) / 1400, 1);
      setN(Math.round(alvo * (1 - Math.pow(1 - p, 3))));
      if (p < 1) quadro = requestAnimationFrame(passo);
    };
    quadro = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(quadro);
  }, [ativo, alvo]);
  return <>{n.toLocaleString("pt-BR")}{sufixo}</>;
}

function PontoAoVivo() {
  return (
    <span className="relative flex size-2">
      <span className="absolute inline-flex h-full w-full rounded-full bg-marca-500 opacity-60 motion-safe:animate-ping" />
      <span className="relative inline-flex size-2 rounded-full bg-marca-500" />
    </span>
  );
}

/** Diagrama do hero: estudante e empresa alimentam a plataforma, que devolve vagas e oportunidades. */
function Conexao() {
  const [evento, setEvento] = useState(0);
  useEffect(() => {
    if (REDUZ) return;
    const t = setInterval(() => setEvento((i) => (i + 1) % EVENTOS.length), 3800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="anima-entra" style={atraso(350)}>
      <div className="relative mx-auto aspect-[3/2] w-full max-w-[450px]" role="img"
           aria-label="Estudantes e empresas conectados pela plataforma por vagas e oportunidades">
        <svg viewBox="0 0 450 300" className="absolute inset-0 size-full" aria-hidden="true">
          {FLUXOS.map((d) => (
            <path key={d} d={d} stroke="#d4d4d8" strokeWidth="1.5" strokeDasharray="3 5" fill="none" />
          ))}
          {!REDUZ && FLUXOS.map((d, i) => (
            <circle key={d} r="3.5" fill="#18181b">
              <animateMotion dur="2.6s" begin={`${i * 0.65}s`} repeatCount="indefinite" path={d} />
            </circle>
          ))}
        </svg>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="absolute inset-0 rounded-full border border-neutral-900/30 motion-safe:animate-ping" />
          <span className="relative grid size-16 place-items-center rounded-full border border-neutral-200 bg-white shadow-sm">
            <span className="size-8 rounded-full bg-neutral-900" />
          </span>
        </div>

        {NOS.map(({ rotulo, x, y, Icone }, i) => (
          <div key={rotulo} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%` }}>
            <div className="anima-flutua flex flex-col items-center gap-1.5" style={atraso(i * 700)}>
              <span className="grid size-12 place-items-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-sm">
                <Icone className="size-5" />
              </span>
              <span className="text-[11px] text-neutral-500">{rotulo}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-7 flex w-fit max-w-full items-center gap-2.5 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs text-neutral-600">
        <PontoAoVivo />
        <span key={evento} className="anima-troca truncate">{EVENTOS[evento]}</span>
      </div>
    </div>
  );
}

export default function Home() {
  const [refNumeros, numerosVisiveis] = useVisivel();
  const [refPassos, passosVisiveis] = useVisivel(0.3);
  const [filtro, setFiltro] = useState("Todas");

  const [todasVagas, setTodasVagas] = useState([]);
  const [numeros, setNumeros] = useState(null);

  useEffect(() => {
    get("/estatisticas").then(setNumeros).catch(() => setNumeros(null));
  }, []);

  // vagas reais do banco; se a API estiver fora do ar a seção só fica vazia
  useEffect(() => {
    buscarVagas({ limite: 30 }).then(setTodasVagas).catch(() => setTodasVagas([]));
  }, []);

  const vagas = todasVagas.filter((v) => filtro === "Todas" || v.tipo === filtro).slice(0, 3);

  return (
    <main>
      <style>{ESTILO}</style>

      {/* ---------- hero ---------- */}
      <section className="relative overflow-hidden bg-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_72%_45%,#e4e4e7_0%,transparent_62%),radial-gradient(ellipse_at_8%_10%,#d8f3dd_0%,transparent_45%)] opacity-70"
        />
        <div className="relative mx-auto grid max-w-screen-xl items-center gap-14 px-8 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <span className="anima-entra inline-flex items-center gap-2 rounded-full border border-marca-200 bg-marca-50 px-3 py-1 text-xs font-medium text-marca-800">
              <PontoAoVivo /> Projeto de extensão · IFMS
            </span>

            <h1 className="mt-7 text-5xl font-semibold leading-[1.05] tracking-tight text-neutral-900 lg:text-6xl">
              <span className="anima-entra block" style={atraso(80)}>Conectamos</span>
              <span className="anima-entra block" style={atraso(170)}>
                <span className="text-marca-600">talentos</span> às
              </span>
              <span className="anima-entra block" style={atraso(260)}>melhores vagas</span>
            </h1>

            <p className="anima-entra mt-6 max-w-md text-base leading-relaxed text-neutral-500" style={atraso(340)}>
              Estágios e programas de jovem aprendiz para estudantes do Instituto Federal.
              Direto, simples e sem burocracia.
            </p>

            <div className="anima-entra mt-9 flex flex-wrap gap-3" style={atraso(420)}>
              <Link
                to="/cadastro/estudante"
                className="group inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-black"
              >
                Sou estudante
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/vagas/nova"
                className="group inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-100 px-6 py-3.5 text-sm font-medium text-neutral-800 transition hover:border-neutral-400 hover:bg-neutral-200"
              >
                Publicar uma vaga
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <dl className="anima-entra mt-12 flex max-w-md items-center gap-6 border-t border-neutral-200 pt-6" style={atraso(500)}>
              {[["estudantes", "Estudantes"], ["empresas", "Empresas"], ["vagas_abertas", "Vagas abertas"]].map(([chave, rotulo], i) => (
                <div key={rotulo} className={i ? "border-l border-neutral-200 pl-6" : ""}>
                  <dt className="text-xl font-semibold tabular-nums text-neutral-900">
                    {numeros ? numeros[chave].toLocaleString("pt-BR") : "—"}
                  </dt>
                  <dd className="text-xs text-neutral-500">{rotulo}</dd>
                </div>
              ))}
            </dl>
          </div>

          <Conexao />
        </div>
      </section>

      {/* ---------- números ---------- */}
      <section ref={refNumeros} className="border-y border-neutral-200 bg-neutral-100">
        <dl className="mx-auto grid max-w-screen-xl grid-cols-2 gap-10 px-8 py-14 lg:grid-cols-4">
          {NUMEROS.map((n) => (
            <div key={n.rotulo}>
              <span className="mb-4 block h-1 w-8 rounded-full bg-marca-500" aria-hidden="true" />
              <dt className="sr-only">{n.rotulo}</dt>
              <dd className="text-4xl font-semibold tabular-nums tracking-tight text-neutral-900">
                {numeros ? (
                  <Contador alvo={numeros[n.chave]} sufixo="" ativo={numerosVisiveis} />
                ) : "—"}
              </dd>
              <p className="mt-1 text-sm text-neutral-700">{n.rotulo}</p>
              <p className="text-xs text-neutral-400">{n.apoio}</p>
            </div>
          ))}
        </dl>
      </section>

      {/* ---------- como funciona ---------- */}
      <section ref={refPassos} className="bg-white">
        <div className="mx-auto max-w-screen-xl px-8 py-24">
          <p className="text-xs uppercase tracking-widest text-neutral-400">Como funciona</p>
          <h2 className="mt-4 max-w-sm text-4xl font-semibold leading-tight tracking-tight text-neutral-900 lg:text-5xl">
            Do cadastro à <span className="text-neutral-400">contratação</span>
          </h2>

          <div className="mt-14 h-px bg-neutral-200" aria-hidden="true">
            <div
              className={`h-px origin-left bg-marca-600 transition-transform duration-[1800ms] ease-out motion-reduce:transition-none ${
                passosVisiveis ? "scale-x-100" : "scale-x-0"
              }`}
            />
          </div>

          <ol className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {PASSOS.map(({ Icone, titulo, texto }, i) => (
              <li key={titulo} className="rounded-2xl border border-neutral-200 bg-neutral-100 p-8">
                <div className="flex items-start justify-between">
                  <span className="grid size-14 place-items-center rounded-2xl bg-marca-50 text-marca-600">
                    <Icone className="size-7 stroke-[1.5]" />
                  </span>
                  <span
                    className={`text-3xl font-semibold tabular-nums transition-colors duration-500 ${
                      passosVisiveis ? "text-neutral-900" : "text-neutral-300"
                    }`}
                    style={{ transitionDelay: passosVisiveis ? `${i * 600}ms` : "0ms" }}
                  >
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-10 text-lg font-medium text-neutral-900">{titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500">{texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- vagas em destaque ---------- */}
      <section className="border-t border-neutral-200 bg-neutral-100">
        <div className="mx-auto max-w-screen-xl px-8 py-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-neutral-400">Oportunidades</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-neutral-900 lg:text-5xl">
                Vagas em destaque
              </h2>
            </div>
            <Link to="/vagas" className="group inline-flex items-center gap-2 text-sm text-neutral-500 transition hover:text-neutral-900">
              Ver todas as vagas
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
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