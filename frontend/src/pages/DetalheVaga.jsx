import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Building2, CalendarDays, Check, CheckCircle2, Clock, Copy,
  Hourglass, Laptop, MapPin, SearchX, Users,
} from "lucide-react";

import { get, post } from "../api";
import { lerSessao } from "../auth";
import AvisoExemplo from "../componentes/AvisoExemplo";
import BotaoSalvar from "../componentes/BotaoSalvar";
import CartaoVaga from "../componentes/CartaoVaga";
import { TARJA_TIPO, bolsaDe, buscarParecidas, buscarVaga, cidadeDe, jornada } from "../vagas";

const enviarCandidatura = (vagaId) => post("/candidaturas", { vaga_id: vagaId });

async function vagasCandidatadas() {
  const lista = await get("/candidaturas/minhas");
  return lista.map((c) => c.vaga_id);
}

const DIA = 86400000;
const paraData = (iso) => new Date(`${iso}T00:00:00`);

function Secao({ titulo, children }) {
  return (
    <section className="border-t border-linha pt-7 first:border-t-0 first:pt-0">
      <h2 className="text-2xl">{titulo}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Marcadores({ itens, destaque = false }) {
  return (
    <ul className="space-y-3">
      {itens.map((item) => (
        <li key={item} className="flex items-start gap-3 text-[17px] leading-relaxed text-tinta">
          <span className={`mt-1 grid size-5 shrink-0 place-items-center rounded-[3px] ${destaque ? "bg-lima-claro text-acao" : "bg-painel text-white"}`}>
            <Check className="size-3.5" strokeWidth={3} />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function Fato({ Icone, rotulo, valor }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span className="picto picto--pequeno"><Icone className="size-4" /></span>
      <div className="flex flex-1 items-baseline justify-between gap-3">
        <dt className="text-[15px] text-tinta-media">{rotulo}</dt>
        <dd className="mono text-right text-[15px] font-bold text-floresta">{valor}</dd>
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
    let ativo = true;
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
      <main className="container-site pb-20 pt-6 sm:pt-10" aria-busy="true">
        <div className="placa h-52 animate-pulse" />
        <div className="cartao mt-6 h-96 animate-pulse" />
      </main>
    );
  }

  if (!vaga) {
    return (
      <main className="container-site py-16 sm:py-24">
        <div className="cartao mx-auto max-w-xl px-6 py-10 sm:px-10">
          <span className="picto"><SearchX className="size-5" /></span>
          <h1 className="mt-5 text-3xl">Vaga não encontrada</h1>
          <p className="mt-2 text-[17px] text-tinta-media">Ela pode ter sido encerrada ou o link está incorreto.</p>
          <Link to="/vagas" className="botao mt-7">Ver todas as vagas</Link>
        </div>
      </main>
    );
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const prazo = paraData(vaga.prazo);
  const dias = Math.ceil((prazo - hoje) / DIA);
  const encerrada = dias < 0 || vaga.situacao !== "Ativa";
  const duracao = vaga.publicadaEm ? Math.max((prazo - paraData(vaga.publicadaEm)) / DIA, 1) : 30;
  const progresso = encerrada ? 100 : Math.min(Math.max(1 - dias / duracao, 0), 1) * 100;
  const textoPrazo = encerrada
    ? "Inscrições encerradas"
    : dias === 0
      ? "Último dia para se candidatar"
      : `${dias} ${dias === 1 ? "dia restante" : "dias restantes"}`;

  const { Icone } = vaga;
  const comVT = vaga.beneficios.some((b) => /transporte/i.test(b));
  const podeCandidatar = !encerrada && !candidatou && papel !== "empresa";

  async function candidatar() {
    setEnviando(true);
    setErroCandidatura("");
    try {
      await enviarCandidatura(vaga.id);
      setCandidatou(true);
    } catch (erro) {
      if (erro.status === 409 && erro.campos?.vaga_id) {
        setCandidatou(true);
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
    }
  }

  return (
    <main className="container-site pb-32 pt-6 sm:pt-10 lg:pb-20">
      <header className="placa px-5 py-7 sm:px-10 sm:py-10">
        <Link to="/vagas" className="inline-flex items-center gap-2 text-[15px] font-bold text-white/85 hover:text-white">
          <ArrowLeft className="size-4" /> Voltar para as vagas
        </Link>
        <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start">
          <span className="picto size-16"><Icone className="size-8" /></span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`tarja ${TARJA_TIPO[vaga.tipo] ?? "tarja--neutra"}`}>{vaga.tipo}</span>
            </div>
            <h1 className="mt-3 text-[clamp(2.25rem,6vw,4rem)]">{vaga.titulo}</h1>
            <p className="mt-4 flex items-start gap-2 text-lg font-medium text-white/90">
              <Building2 className="mt-1 size-5 shrink-0 text-lima" /><span className="min-w-0 break-words">{vaga.empresa}</span>
            </p>
            <ul className="dado mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-white/90">
              <li className="flex items-center gap-2">{vaga.area}</li>
              <li className="flex items-center gap-2"><MapPin className="size-4 text-lima" />{cidadeDe(vaga.local)}</li>
              <li className="flex items-center gap-2"><Laptop className="size-4 text-lima" />{vaga.modalidade}</li>
            </ul>
          </div>
        </div>
      </header>
      <AvisoExemplo className="mt-4" />

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
        <aside className="cartao p-5 sm:p-6 lg:sticky lg:top-24 lg:order-last">
          <div className="flex items-start justify-between gap-3">
            <p className="dado text-tinta-media">Bolsa-auxílio</p>
            <BotaoSalvar vaga={vaga} className="-mt-2 -mr-2" />
          </div>
          <p className="mono -mt-1 text-[2.5rem] font-bold leading-none tracking-tighter text-floresta">
            {bolsaDe(vaga) ?? "A combinar"}
            {vaga.valor > 0 && <span className="text-base font-medium tracking-normal text-tinta-media"> /mês{comVT && " + VT"}</span>}
          </p>
          {jornada(vaga).length > 0 && <p className="mono mt-3 text-sm font-semibold text-acao">{jornada(vaga).join(" • ")}</p>}

          <dl className="mt-5 divide-y divide-linha border-y border-linha">
            <Fato Icone={Clock} rotulo="Horário" valor={vaga.horario} />
            <Fato Icone={Hourglass} rotulo="Carga horária" valor={vaga.cargaHoraria} />
            <Fato Icone={Users} rotulo="Vagas abertas" valor={vaga.numeroVagas} />
            <Fato Icone={CalendarDays} rotulo="Inscrições até" valor={prazo.toLocaleDateString("pt-BR")} />
          </dl>

          <div className="mt-5">
            <div className="h-2 overflow-hidden rounded-[2px] bg-superficie-2" aria-hidden="true">
              <div
                className={`h-full ${!encerrada && dias <= 7 ? "bg-urgente" : "bg-painel"}`}
                style={{ width: `${progresso}%` }}
              />
            </div>
            <p className={`dado mt-2 ${!encerrada && dias <= 7 ? "font-bold text-urgente" : "text-tinta-media"}`}>{textoPrazo}</p>
          </div>

          <div className="mt-6">
            {encerrada ? (
              <button type="button" disabled className="botao botao--largo cursor-not-allowed border-linha bg-superficie-2 text-tinta-fraca">
                Inscrições encerradas
              </button>
            ) : candidatou ? (
              <div role="status" className="aviso aviso--ok">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 animate-[salvar-pulso_420ms_cubic-bezier(0.22,1,0.36,1)]" />
                <div>
                  <p className="font-bold">Candidatura enviada</p>
                  <p className="mt-0.5 text-sm font-normal text-tinta">Enviamos uma confirmação para o seu e-mail. A empresa vai analisar o seu perfil.</p>
                  <Link to="/minhas-candidaturas" className="link mt-2 inline-block text-sm">Acompanhar andamento</Link>
                </div>
              </div>
            ) : !sessao ? (
              <>
                <Link to="/login" state={{ de: pathname }} className="botao botao--lima botao--largo min-h-14 text-lg">
                  Entrar para se candidatar <ArrowRight className="seta size-5" />
                </Link>
                <p className="mt-3 text-center text-[15px] text-tinta-media">
                  Ainda não tem conta? <Link to="/cadastro/estudante" className="link">Cadastre-se</Link>
                </p>
              </>
            ) : papel === "empresa" ? (
              <p className="aviso aviso--info font-normal">
                Contas de empresa não podem se candidatar. Entre com uma conta de estudante.
              </p>
            ) : (
              <button type="button" onClick={candidatar} disabled={enviando} className="botao botao--lima botao--largo min-h-14 text-lg">
                {enviando ? "Enviando..." : <>Candidatar-se <ArrowRight className="seta size-5" /></>}
              </button>
            )}
            {erroCandidatura && (
              <p role="alert" className="erro-campo mt-3">
                {erroCandidatura}{" "}
                {!lerSessao() && <Link to="/login" state={{ de: pathname }} className="underline">Entrar</Link>}
              </p>
            )}
          </div>

          <button type="button" onClick={copiarLink} className="botao botao--contorno botao--compacto botao--largo mt-3">
            {copiado ? <Check className="size-4 text-acao" /> : <Copy className="size-4" />}
            {copiado ? "Link copiado" : "Copiar link da vaga"}
          </button>
        </aside>

        <div className="cartao space-y-7 p-5 sm:p-8">
          <Secao titulo="Sobre a vaga">
            <p className="max-w-prose whitespace-pre-line text-[17px] leading-relaxed text-tinta">{vaga.descricao}</p>
          </Secao>
          <Secao titulo="Requisitos">
            <Marcadores itens={vaga.requisitos} />
          </Secao>
          {vaga.diferenciais.length > 0 && (
            <Secao titulo="Diferenciais">
              <Marcadores itens={vaga.diferenciais} destaque />
            </Secao>
          )}
          {vaga.beneficios.length > 0 && (
            <Secao titulo="Benefícios">
              <ul className="flex flex-wrap gap-2">
                {vaga.beneficios.map((beneficio) => (
                  <li key={beneficio} className="rounded-full border border-linha-forte px-3.5 py-1.5 text-[15px] font-medium">{beneficio}</li>
                ))}
              </ul>
            </Secao>
          )}
        </div>
      </div>

      {podeCandidatar && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-linha bg-fundo px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 lg:hidden">
          <div className="flex items-center gap-3">
            <p className="min-w-0 flex-1">
              <span className="mono block text-lg font-bold leading-tight text-floresta">{bolsaDe(vaga) ?? "A combinar"}</span>
              <span className={`dado block ${dias <= 7 ? "text-urgente" : "text-tinta-media"}`}>{textoPrazo}</span>
            </p>
            {sessao ? (
              <button type="button" onClick={candidatar} disabled={enviando} className="botao botao--lima">
                {enviando ? "Enviando..." : "Candidatar-se"}
              </button>
            ) : (
              <Link to="/login" state={{ de: pathname }} className="botao botao--lima">Entrar para se candidatar</Link>
            )}
          </div>
        </div>
      )}

      {parecidas.length > 0 && (
        <section className="mt-16">
          <h2 className="text-[clamp(2rem,4vw,2.75rem)]">Outras vagas parecidas</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {parecidas.map((v, i) => (
              <CartaoVaga key={v.id} vaga={v} destaque={i === 0} className={i === 0 ? "md:col-span-2" : ""} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
