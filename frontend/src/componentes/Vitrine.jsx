import { useState } from "react";
import { Bell, Check, Clock, MailCheck, MapPin, Search } from "lucide-react";

/* O quadro tem as próprias cores e fontes (as do visual anterior do site),
   então continua idêntico mesmo com o tema novo das outras páginas. */
const FONTE_TEXTO = "'Inter', ui-sans-serif, system-ui, sans-serif";
const FONTE_TITULO = "'Bricolage Grotesque', 'Inter', ui-sans-serif, system-ui, sans-serif";

/* Tipo da vaga: estágio em verde, jovem aprendiz em azul. */
const COR_TIPO = {
  "Estágio": "border-[#b3e6bd] bg-[#effaf1] text-[#1d632b]",
  "Jovem aprendiz": "border-sky-200 bg-sky-50 text-sky-800",
};

/* Um toque de cor por área, no ícone da vaga. */
const COR_AREA = {
  Tecnologia: "bg-sky-50 text-sky-700",
  Administrativo: "bg-amber-50 text-amber-700",
  Marketing: "bg-rose-50 text-rose-700",
  Design: "bg-violet-50 text-violet-700",
  Vendas: "bg-orange-50 text-orange-700",
  "Recursos Humanos": "bg-teal-50 text-teal-700",
  Engenharia: "bg-slate-100 text-slate-700",
  Logística: "bg-lime-50 text-lime-700",
};
const corDaArea = (v) => COR_AREA[v.area] ?? "bg-neutral-100 text-neutral-700";

/* Vitrine do topo da Home: um carrossel com as três etapas do produto.
   1. Encontre: vagas reais, vindas do banco.
   2. Candidate-se: a candidatura e a confirmação por e-mail.
   3. Seja chamado: a empresa muda o status e o estudante recebe o aviso.
   Troca sozinha a cada DURACAO; para quando o mouse está em cima ou quando
   algum botão tem foco; com "reduzir movimento" ativado no sistema, não
   troca sozinha (o usuário escolhe a etapa nos botões). */

const DURACAO = 5200;
const CENAS = ["Encontre", "Candidate-se", "Seja chamado"];

const ESTILO = `
@keyframes vt-barra{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes vt-entra{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes vt-sai{to{opacity:0;transform:translateY(-6px)}}
@keyframes vt-aviso{from{opacity:0;transform:translateY(16px) scale(.97)}to{opacity:1;transform:none}}
@keyframes vt-cursor{50%{opacity:0}}
.vt-barra{transform-origin:left;animation:vt-barra ${DURACAO}ms linear both}
.vt-entra{animation:vt-entra .55s cubic-bezier(.2,.7,.2,1) both}
.vt-sai{animation:vt-sai .3s ease both}
.vt-aviso{animation:vt-aviso .6s cubic-bezier(.2,.7,.2,1) both}
.vt-cursor{animation:vt-cursor 1s steps(1) infinite}
.vt-parado *{animation:none!important}
.vt-parado .vt-sai{opacity:0}
@media (prefers-reduced-motion:reduce){
  .vt-barra{animation:none;transform:none}
  .vt-entra,.vt-sai,.vt-aviso,.vt-cursor{animation:none}
  .vt-sai{opacity:0}
  .vt-trilho{transition:none!important}
}
`;

const REDUZ =
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const atraso = (ms) => ({ animationDelay: `${ms}ms` });
const dinheiro = (v) => (v ? `R$ ${v.toLocaleString("pt-BR")}` : "A combinar");

function SeloTipo({ tipo }) {
  return (
    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] ${COR_TIPO[tipo] ?? "border-neutral-200 text-neutral-600"}`}>
      {tipo}
    </span>
  );
}

/* ---------- 1. Encontre ---------- */
function CenaEncontre({ vagas, total }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2.5 text-sm text-neutral-300">
        <Search className="size-4 text-neutral-400" />
        <span>estágio</span>
        <span className="vt-cursor -ml-1.5 h-4 w-px bg-neutral-300" />
      </div>

      <div className="mt-4 flex-1 rounded-2xl bg-white p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-neutral-900">Vagas abertas agora</p>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-[#237d33]">
            <span className="size-1.5 rounded-full bg-[#effaf1]0 motion-safe:animate-pulse" /> ao vivo
          </span>
        </div>
        <ul className="mt-3 divide-y divide-neutral-100">
          {vagas.map((v, i) => (
            <li key={v.id} className="vt-entra flex items-center gap-3 py-2.5" style={atraso(150 + i * 180)}>
              <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${corDaArea(v)}`}>
                <v.Icone className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-neutral-900">{v.titulo}</span>
                <span className="block truncate text-xs text-neutral-500">{v.empresa} · {v.local}</span>
              </span>
              <SeloTipo tipo={v.tipo} />
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 text-sm text-neutral-400">
        {total ? <><span className="font-medium text-white">{total}</span> vagas com inscrições abertas agora.</> : "Novas vagas toda semana."}
      </p>
    </div>
  );
}

/* ---------- 2. Candidate-se ---------- */
function CenaCandidate({ vaga }) {
  return (
    <div className="flex h-full flex-col">
      <div className="rounded-2xl bg-white p-5">
        <div className="flex items-start justify-between gap-3">
          <span className={`grid size-10 place-items-center rounded-xl ${corDaArea(vaga)}`}>
            <vaga.Icone className="size-5" />
          </span>
          <SeloTipo tipo={vaga.tipo} />
        </div>
        <p className="mt-4 text-lg font-semibold leading-snug text-neutral-900" style={{ fontFamily: FONTE_TITULO }}>
          {vaga.titulo}
        </p>
        <p className="text-sm text-neutral-500">{vaga.empresa}</p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
          <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5" />{vaga.local}</span>
          <span className="inline-flex items-center gap-1.5"><Clock className="size-3.5" />{vaga.horario}</span>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4">
          <span className="text-sm font-medium text-neutral-900">{dinheiro(vaga.valor)}{vaga.valor ? " / mês" : ""}</span>
          {/* o botão "vira" de Candidatar-se para Candidatado */}
          <span className="grid text-xs font-medium">
            <span className="vt-sai rounded-lg bg-neutral-900 px-3 py-1.5 text-white [grid-area:1/1]" style={atraso(700)}>
              Candidatar-se
            </span>
            <span className="vt-entra inline-flex items-center gap-1.5 rounded-lg bg-[#2f9e41] px-3 py-1.5 text-white [grid-area:1/1]" style={atraso(800)}>
              <Check className="size-3.5" /> Candidatado
            </span>
          </span>
        </div>
      </div>

      <ol className="mt-5 space-y-3">
        {[
          [Check, "Candidatura enviada", "agora mesmo"],
          [MailCheck, "Confirmação no seu e-mail", "no mesmo minuto"],
        ].map(([Icone, texto, detalhe], i) => (
          <li key={texto} className="vt-entra flex items-start gap-3" style={atraso(1200 + i * 600)}>
            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#2f9e41] text-white">
              <Icone className="size-3" strokeWidth={3} />
            </span>
            <span>
              <span className="block text-sm text-neutral-100">{texto}</span>
              <span className="block text-xs text-neutral-500">{detalhe}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ---------- 3. Seja chamado ---------- */
function CenaChamado({ vaga }) {
  return (
    <div className="flex h-full flex-col">
      <div className="rounded-2xl bg-white p-5">
        <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">Painel da empresa</p>
        <p className="mt-1 truncate text-sm font-medium text-neutral-900">{vaga.titulo}</p>

        <div className="mt-4 flex items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-50 p-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#d8f3dd] text-xs font-semibold text-[#1d632b]">AS</span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-neutral-900">Ana Souza</span>
            <span className="block truncate text-xs text-neutral-500">Informática · 3º período</span>
          </span>
          {/* status muda de Pendente para Entrevista, como no painel real */}
          <span className="grid text-[11px] font-medium">
            <span className="vt-sai rounded-full bg-neutral-200 px-2.5 py-0.5 text-neutral-700 [grid-area:1/1]" style={atraso(1100)}>Pendente</span>
            <span className="vt-entra rounded-full bg-sky-100 px-2.5 py-0.5 text-sky-800 [grid-area:1/1]" style={atraso(1200)}>Entrevista</span>
          </span>
        </div>

        <div className="mt-3 flex gap-2 text-xs">
          <span className="rounded-lg bg-neutral-900 px-3 py-1.5 font-medium text-white">Chamar para entrevista</span>
          <span className="rounded-lg border border-neutral-200 px-3 py-1.5 text-neutral-600">Finalizar</span>
        </div>
      </div>

      {/* o aviso que chega para o estudante */}
      <div className="vt-aviso mt-5 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur" style={atraso(1900)}>
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#2f9e41] text-white">
          <Bell className="size-4" />
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-2 text-xs text-neutral-400">Emprega-IF · agora</span>
          <span className="block text-sm font-medium text-white">Você foi chamado para entrevista!</span>
          <span className="block truncate text-xs text-neutral-400">{vaga.empresa} quer conversar com você.</span>
        </span>
      </div>
    </div>
  );
}

export default function Vitrine({ vagas, total }) {
  const [atual, setAtual] = useState(0);
  const [pausado, setPausado] = useState(false);

  if (!vagas.length) {
    return <div className="aspect-[4/5] w-full max-w-lg rounded-[28px] bg-neutral-900 lg:ml-auto" aria-hidden="true" />;
  }

  const destaque = vagas.find((v) => v.tipo === "Estágio") ?? vagas[0];
  const proxima = () => setAtual((a) => (a + 1) % CENAS.length);

  return (
    <figure
      className="w-full max-w-lg overflow-hidden rounded-[28px] bg-neutral-900 p-5 sm:p-7 lg:ml-auto"
      style={{ fontFamily: FONTE_TEXTO, lineHeight: 1.5 }}
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
    >
      <style>{ESTILO}</style>
      <figcaption className="sr-only">Como funciona o Emprega-IF, em três etapas</figcaption>

      {/* abas com barra de progresso: quando a barra enche, passa para a próxima */}
      <div role="tablist" aria-label="Etapas" className="grid grid-cols-3 gap-2">
        {CENAS.map((nome, i) => (
          <button
            key={nome}
            type="button"
            role="tab"
            aria-selected={i === atual}
            onClick={() => setAtual(i)}
            className={`text-left text-xs font-medium transition ${i === atual ? "text-white" : "text-neutral-500 hover:text-neutral-300"}`}
          >
            <span className="block h-0.5 overflow-hidden rounded-full bg-white/15">
              {i < atual && <span className="block h-full bg-[#effaf1]0" />}
              {i === atual && (
                <span
                  key={atual}
                  className={`block h-full bg-[#effaf1]0 ${REDUZ ? "" : "vt-barra"}`}
                  style={{ animationPlayState: pausado ? "paused" : "running" }}
                  onAnimationEnd={proxima}
                />
              )}
            </span>
            <span className="mt-2 block">
              <span className="text-neutral-500">{i + 1}.</span> {nome}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-5 overflow-hidden">
        <div
          className="vt-trilho flex transition-transform duration-700 ease-[cubic-bezier(.65,0,.35,1)]"
          style={{ transform: `translateX(-${atual * 100}%)` }}
        >
          {CENAS.map((nome, i) => (
            <div key={nome} role="tabpanel" aria-hidden={i !== atual} className="w-full shrink-0">
              {/* a key faz as animações de dentro recomeçarem toda vez que a cena aparece; */}
              {/* fora de foco, a cena fica parada no estado final */}
              <div key={i === atual ? `ativa-${atual}` : "parada"} className={`h-full ${i === atual ? "" : "vt-parado"}`}>
                {i === 0 && <CenaEncontre vagas={vagas.slice(0, 3)} total={total} />}
                {i === 1 && <CenaCandidate vaga={destaque} />}
                {i === 2 && <CenaChamado vaga={destaque} />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </figure>
  );
}
