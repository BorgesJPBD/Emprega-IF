import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  ArrowLeft, Building2, CalendarDays, Check, CheckCircle2, Clock, Copy,
  Hourglass, Laptop, MapPin, SearchX, Users,
} from "lucide-react";

import { get, post } from "../api";
import { lerSessao } from "../auth";
import CartaoVaga from "../componentes/CartaoVaga";
import { buscarParecidas, buscarVaga } from "../vagas";

const ESTILO = `
@keyframes entra{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
.anima-entra{animation:entra .6s cubic-bezier(.2,.7,.2,1) both}
@media (prefers-reduced-motion:reduce){.anima-entra{animation:none}}
`;

/* ---------- candidatura ----------
   Grava na tabela `candidaturas`. O estudante é identificado pelo token
   que vai no cabeçalho (ver api.js), nunca por um id mandado daqui. */
const enviarCandidatura = (vagaId) => post("/candidaturas", { vaga_id: vagaId });

/** ids das vagas em que o estudante logado já se candidatou */
async function vagasCandidatadas() {
  const lista = await get("/candidaturas/minhas");
  return lista.map((c) => c.vaga_id);
}

const DIA = 86400000;
const paraData = (iso) => new Date(`${iso}T00:00:00`);

function Secao({ titulo, children }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-neutral-900">{titulo}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Marcadores({ itens, cor }) {
  return (
    <ul className="space-y-2.5">
      {itens.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-neutral-600">
          <Check className={`mt-0.5 size-4 shrink-0 ${cor}`} />
          {item}
        </li>
      ))}
    </ul>
  );
}

function Fato({ Icone, rotulo, valor }) {
  return (
    <div className="flex items-start gap-3">
      <Icone className="mt-0.5 size-4 shrink-0 text-neutral-400" />
      <div>
        <dt className="text-xs text-neutral-400">{rotulo}</dt>
        <dd className="text-sm text-neutral-800">{valor}</dd>
      </div>
    </div>
  );
}

export default function DetalheVaga() {
  const { id } = useParams();
  const { pathname } = useLocation();
  const sessao = lerSessao();
  const papel = sessao?.usuario?.papel;

  const [vaga, setVaga] = useState(null);
  const [parecidas, setParecidas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [candidatou, setCandidatou] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erroCandidatura, setErroCandidatura] = useState("");
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    let ativo = true; // evita atualizar a tela se a pessoa trocar de vaga no meio da carga
    window.scrollTo(0, 0);
    setCarregando(true);
    setCandidatou(false);
    setErroCandidatura("");
    setCopiado(false);

    buscarVaga(id)
      .then((v) => ativo && setVaga(v))
      .catch(() => ativo && setVaga(null))
      .finally(() => ativo && setCarregando(false));

    buscarParecidas(id)
      .then((lista) => ativo && setParecidas(lista))
      .catch(() => ativo && setParecidas([]));

    if (papel === "estudante") {
      vagasCandidatadas()
        .then((ids) => ativo && setCandidatou(ids.includes(id)))
        .catch(() => {});
    }
    return () => { ativo = false; };
  }, [id, papel]);

  if (carregando) {
    return (
      <main className="mx-auto max-w-screen-xl px-8 py-10" aria-busy="true">
        <div className="h-40 animate-pulse rounded-2xl border border-neutral-200 bg-white" />
        <div className="mt-6 h-96 animate-pulse rounded-2xl border border-neutral-200 bg-white" />
      </main>
    );
  }

  if (!vaga) {
    return (
      <main className="mx-auto max-w-xl px-5 py-24 text-center">
        <SearchX className="mx-auto size-9 text-neutral-400" />
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-neutral-900">Vaga não encontrada</h1>
        <p className="mt-2 text-sm text-neutral-500">Ela pode ter sido encerrada ou o link está incorreto.</p>
        <Link to="/vagas" className="mt-7 inline-block rounded-xl bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-black">
          Ver todas as vagas
        </Link>
      </main>
    );
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const prazo = paraData(vaga.prazo);
  const dias = Math.ceil((prazo - hoje) / DIA);
  const encerrada = dias < 0 || vaga.situacao !== "Ativa";
  const duracao = Math.max((prazo - paraData(vaga.publicadaEm)) / DIA, 1);
  const progresso = encerrada ? 100 : Math.min(Math.max(1 - dias / duracao, 0), 1) * 100;
  const textoPrazo = encerrada
    ? "Inscrições encerradas"
    : dias === 0
      ? "Último dia para se candidatar"
      : `${dias} ${dias === 1 ? "dia restante" : "dias restantes"}`;

  const { Icone } = vaga;

  async function candidatar() {
    setEnviando(true);
    setErroCandidatura("");
    try {
      await enviarCandidatura(vaga.id);
      setCandidatou(true);
    } catch (erro) {
      if (erro.status === 409 && erro.campos?.vaga_id) {
        setCandidatou(true); // já tinha se candidatado (outra aba, outro aparelho)
      } else if (erro.status === 401) {
        setErroCandidatura("Sua sessão expirou. Entre novamente para se candidatar.");
      } else {
        setErroCandidatura(erro.message);
      }
    } finally {
      setEnviando(false);
    }
  }

  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* navegador sem permissão para a área de transferência */
    }
  }

  const BOTAO = "block w-full rounded-xl py-3.5 text-center text-sm font-medium transition";

  return (
    <main className="mx-auto max-w-screen-xl px-8 py-10">
      <style>{ESTILO}</style>

      <Link to="/vagas" className="inline-flex items-center gap-2 text-sm text-neutral-500 transition hover:text-neutral-900">
        <ArrowLeft className="size-4" /> Voltar para as vagas
      </Link>

      <header className="anima-entra mt-6 rounded-2xl border border-neutral-200 bg-white p-7 md:p-8">
        <div className="flex items-start gap-5">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-neutral-100 text-neutral-600">
            <Icone className="size-7" />
          </span>
          <div>
            <span className="rounded-full border border-neutral-200 px-2.5 py-0.5 text-[11px] text-neutral-600">{vaga.tipo}</span>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">{vaga.titulo}</h1>
            <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-500">
              <li className="flex items-center gap-2"><Building2 className="size-4 text-neutral-400" />{vaga.empresa}</li>
              <li className="flex items-center gap-2"><MapPin className="size-4 text-neutral-400" />{vaga.local}</li>
              <li className="flex items-center gap-2"><Laptop className="size-4 text-neutral-400" />{vaga.modalidade}</li>
            </ul>
          </div>
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
        <aside
          className="anima-entra rounded-2xl border border-neutral-200 bg-white p-6 lg:sticky lg:top-28 lg:order-last"
          style={{ animationDelay: "120ms" }}
        >
          <p className="text-xs text-neutral-400">Remuneração</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-neutral-900">
            {vaga.valor ? (
              <>
                R$ {vaga.valor.toLocaleString("pt-BR")}
                <span className="text-sm font-normal text-neutral-400"> / mês</span>
              </>
            ) : "A combinar"}
          </p>

          <dl className="mt-5 space-y-4 border-t border-neutral-100 pt-5">
            <Fato Icone={Clock} rotulo="Horário" valor={vaga.horario} />
            <Fato Icone={Hourglass} rotulo="Carga horária" valor={vaga.cargaHoraria} />
            <Fato Icone={Users} rotulo="Vagas abertas" valor={vaga.numeroVagas} />
            <Fato Icone={CalendarDays} rotulo="Inscrições até" valor={prazo.toLocaleDateString("pt-BR")} />
          </dl>

          <div className="mt-5">
            <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100" aria-hidden="true">
              <div
                className={`h-full rounded-full ${dias <= 7 ? "bg-amber-500" : "bg-neutral-900"}`}
                style={{ width: `${progresso}%` }}
              />
            </div>
            <p className={`mt-2 text-xs ${!encerrada && dias <= 7 ? "text-amber-700" : "text-neutral-500"}`}>{textoPrazo}</p>
          </div>

          <div className="mt-6">
            {encerrada ? (
              <button type="button" disabled className={`${BOTAO} cursor-not-allowed bg-neutral-100 text-neutral-400`}>
                Inscrições encerradas
              </button>
            ) : candidatou ? (
              <div role="status" className="anima-entra flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-sm font-medium text-emerald-800">Candidatura enviada</p>
                  <p className="mt-0.5 text-xs text-emerald-700">A empresa vai analisar o seu perfil e retornar por e-mail.</p>
                </div>
              </div>
            ) : !sessao ? (
              <>
                <Link to="/login" state={{ de: pathname }} className={`${BOTAO} bg-neutral-900 text-white hover:bg-black`}>
                  Entrar para se candidatar
                </Link>
                <p className="mt-3 text-center text-xs text-neutral-500">
                  Ainda não tem conta?{" "}
                  <Link to="/cadastro/estudante" className="font-medium text-neutral-900">Cadastre-se</Link>
                </p>
              </>
            ) : papel === "empresa" ? (
              <p className="rounded-xl bg-neutral-100 px-4 py-3 text-xs text-neutral-600">
                Contas de empresa não podem se candidatar. Entre com uma conta de estudante.
              </p>
            ) : (
              <button
                type="button" onClick={candidatar} disabled={enviando}
                className={`${BOTAO} bg-neutral-900 text-white hover:bg-black disabled:cursor-progress disabled:opacity-60`}
              >
                {enviando ? "Enviando..." : "Candidatar-se"}
              </button>
            )}
            {erroCandidatura && (
              <p role="alert" className="mt-3 text-xs text-red-600">
                {erroCandidatura}{" "}
                {!lerSessao() && <Link to="/login" state={{ de: pathname }} className="font-medium underline">Entrar</Link>}
              </p>
            )}
          </div>

          <button
            type="button" onClick={copiarLink}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 py-2.5 text-xs text-neutral-600 transition hover:border-neutral-400 hover:text-neutral-900"
          >
            {copiado ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
            {copiado ? "Link copiado" : "Copiar link da vaga"}
          </button>
        </aside>

        <div className="space-y-9 rounded-2xl border border-neutral-200 bg-white p-7 md:p-8">
          <Secao titulo="Sobre a vaga">
            <p className="max-w-prose text-sm leading-relaxed text-neutral-600">{vaga.descricao}</p>
          </Secao>
          <Secao titulo="Requisitos">
            <Marcadores itens={vaga.requisitos} cor="text-neutral-400" />
          </Secao>
          {vaga.diferenciais.length > 0 && (
            <Secao titulo="Diferenciais">
              <Marcadores itens={vaga.diferenciais} cor="text-emerald-600" />
            </Secao>
          )}
          {vaga.beneficios.length > 0 && (
          <Secao titulo="Benefícios">
            <div className="flex flex-wrap gap-2">
              {vaga.beneficios.map((beneficio) => (
                <span key={beneficio} className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-700">
                  {beneficio}
                </span>
              ))}
            </div>
          </Secao>
          )}
        </div>
      </div>

      {parecidas.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">Outras vagas parecidas</h2>
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
            {parecidas.map((v, i) => (
              <CartaoVaga key={v.id} vaga={v} indice={i} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}