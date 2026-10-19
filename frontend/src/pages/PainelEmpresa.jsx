import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Building2, ChevronDown, Lock, Mail, Phone, Plus, Users } from "lucide-react";

import { get, patch } from "../api";
import { lerSessao } from "../auth";

/* Painel da empresa: as vagas dela (view vw_painel_vagas) e os candidatos
   de cada uma. As mudanças de situação e de andamento passam pelos
   triggers do banco, que recusam transições inválidas. */

const SITUACAO = {
  Rascunho: { rotulo: "Rascunho", cor: "bg-neutral-100 text-neutral-600" },
  Ativa: { rotulo: "Inscrições abertas", cor: "bg-emerald-50 text-emerald-700" },
  EmSelecao: { rotulo: "Em seleção", cor: "bg-amber-50 text-amber-700" },
  Finalizada: { rotulo: "Finalizada", cor: "bg-neutral-100 text-neutral-600" },
  Cancelada: { rotulo: "Cancelada", cor: "bg-red-50 text-red-700" },
};

/* próximos passos permitidos (os mesmos do trigger tg_vagas_ciclo_de_vida) */
const ACOES_VAGA = {
  Ativa: [["EmSelecao", "Encerrar inscrições"], ["Cancelada", "Cancelar vaga"]],
  EmSelecao: [["Finalizada", "Finalizar vaga"], ["Cancelada", "Cancelar vaga"]],
};

const STATUS = {
  Pendente: "bg-neutral-100 text-neutral-700",
  Entrevista: "bg-sky-50 text-sky-700",
  Finalizado: "bg-emerald-50 text-emerald-700",
};

/* próximos passos permitidos (os mesmos do trigger tg_candidaturas_andamento) */
const ACOES_CANDIDATURA = {
  Pendente: [["Entrevista", "Chamar para entrevista"], ["Finalizado", "Finalizar"]],
  Entrevista: [["Finalizado", "Finalizar"]],
};

const data = (iso) => (iso ? new Date(iso.length === 10 ? `${iso}T00:00:00` : iso).toLocaleDateString("pt-BR") : "—");

/* "67999990000" -> "(67) 99999-0000" */
const telefone = (t) => `(${t.slice(0, 2)}) ${t.slice(2, -4)}-${t.slice(-4)}`;

const BOTAO_SECUNDARIO =
  "rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900 disabled:opacity-50";

function Selo({ classe, children }) {
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${classe}`}>{children}</span>;
}

function Resumo({ rotulo, valor }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <p className="text-xs text-neutral-500">{rotulo}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-neutral-900">{valor}</p>
    </div>
  );
}

function Candidatos({ vagaId, aoMudar }) {
  const [lista, setLista] = useState(null);
  const [erro, setErro] = useState("");
  const [ocupado, setOcupado] = useState(null);

  useEffect(() => {
    get(`/vagas/${vagaId}/candidatos`).then(setLista).catch((e) => setErro(e.message));
  }, [vagaId]);

  async function mudar(candidaturaId, status) {
    setOcupado(candidaturaId);
    setErro("");
    try {
      const atualizada = await patch(`/candidaturas/${candidaturaId}/status`, { status });
      setLista((atual) => atual.map((c) => (c.candidatura_id === candidaturaId ? { ...c, status: atualizada.status } : c)));
      aoMudar();
    } catch (e) {
      setErro(e.message);
    } finally {
      setOcupado(null);
    }
  }

  if (erro && !lista) return <p className="px-6 pb-6 text-sm text-red-600">{erro}</p>;
  if (!lista) return <p className="px-6 pb-6 text-sm text-neutral-500">Carregando candidatos...</p>;
  if (!lista.length) return <p className="px-6 pb-6 text-sm text-neutral-500">Ninguém se candidatou ainda.</p>;

  return (
    <div className="border-t border-neutral-100 px-6 pb-6">
      {erro && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{erro}</p>}
      <ul className="divide-y divide-neutral-100">
        {lista.map((c) => (
          <li key={c.candidatura_id} className="flex flex-wrap items-start justify-between gap-4 py-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-neutral-900">{c.nome}</p>
                <Selo classe={STATUS[c.status]}>{c.status}</Selo>
              </div>
              <p className="mt-0.5 text-sm text-neutral-500">
                {c.curso} · {c.periodo}º período · {c.instituicao}
              </p>
              <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
                <a href={`mailto:${c.email_if}`} className="inline-flex items-center gap-1 hover:text-neutral-900">
                  <Mail className="size-3.5" /> {c.email_if}
                </a>
                {c.telefone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="size-3.5" /> {telefone(c.telefone)}
                  </span>
                )}
                <span>Inscrito em {data(c.data_inscricao)}</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(ACOES_CANDIDATURA[c.status] || []).map(([status, rotulo]) => (
                <button key={status} type="button" disabled={ocupado === c.candidatura_id}
                  onClick={() => mudar(c.candidatura_id, status)} className={BOTAO_SECUNDARIO}>
                  {rotulo}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PainelEmpresa() {
  const { pathname } = useLocation();
  const sessao = lerSessao();
  const empresa = sessao?.usuario?.papel === "empresa" ? sessao.usuario : null;

  const [vagas, setVagas] = useState(null);
  const [erro, setErro] = useState("");
  const [aberta, setAberta] = useState(null);
  const [ocupado, setOcupado] = useState(null);

  const carregar = () =>
    get("/empresas/me/vagas")
      .then(setVagas)
      .catch((e) => setErro(e.message));

  useEffect(() => {
    if (empresa) carregar();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function mudarSituacao(vagaId, situacao) {
    setOcupado(vagaId);
    setErro("");
    try {
      await patch(`/vagas/${vagaId}/situacao`, { situacao });
      await carregar();
    } catch (e) {
      setErro(e.message);
    } finally {
      setOcupado(null);
    }
  }

  if (!empresa) {
    return (
      <main className="mx-auto max-w-xl px-5 py-20 text-center">
        <div className="rounded-2xl border border-neutral-200 bg-white p-8">
          <Lock className="mx-auto size-9 text-neutral-400" />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-neutral-900">Painel da empresa</h1>
          <p className="mt-2 text-sm text-neutral-500">Entre com a conta da sua empresa para ver as vagas e os candidatos.</p>
          <Link to="/login" state={{ de: pathname }} className="mt-6 block w-full rounded-xl bg-neutral-900 py-3.5 text-sm font-medium text-white transition hover:bg-black">
            Entrar como empresa
          </Link>
        </div>
      </main>
    );
  }

  const total = (campo) => (vagas || []).reduce((soma, v) => soma + v[campo], 0);

  return (
    <main className="mx-auto max-w-screen-xl px-8 py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-400">
            <Building2 className="size-3.5" /> {empresa.nome}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-neutral-900">Painel da empresa</h1>
        </div>
        <Link to="/vagas/nova" className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-black">
          <Plus className="size-4" /> Publicar vaga
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Resumo rotulo="Vagas publicadas" valor={vagas ? vagas.length : "—"} />
        <Resumo rotulo="Com inscrições abertas" valor={vagas ? vagas.filter((v) => v.situacao === "Ativa").length : "—"} />
        <Resumo rotulo="Candidaturas recebidas" valor={vagas ? total("total_candidaturas") : "—"} />
        <Resumo rotulo="Aguardando resposta" valor={vagas ? total("pendentes") : "—"} />
      </div>

      {erro && <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>}

      {vagas === null && !erro && <p className="mt-10 text-sm text-neutral-500">Carregando suas vagas...</p>}

      {vagas?.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
          <h2 className="text-base font-medium text-neutral-900">Você ainda não publicou vagas</h2>
          <p className="mt-1 text-sm text-neutral-500">Publique a primeira para começar a receber candidaturas.</p>
        </div>
      )}

      <ul className="mt-8 space-y-4">
        {(vagas || []).map((v) => {
          const s = SITUACAO[v.situacao] || SITUACAO.Rascunho;
          return (
            <li key={v.id} className="rounded-2xl border border-neutral-200 bg-white">
              <div className="flex flex-wrap items-start justify-between gap-4 p-6">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link to={`/vagas/${v.id}`} className="text-lg font-medium text-neutral-900 hover:underline">{v.titulo}</Link>
                    <Selo classe={s.cor}>{s.rotulo}</Selo>
                  </div>
                  <p className="mt-1 text-sm text-neutral-500">
                    {v.tipo} · publicada em {data(v.data_publicacao)} · inscrições até {data(v.prazo_inscricao)}
                  </p>
                  <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-neutral-600">
                    <span className="inline-flex items-center gap-1.5"><Users className="size-3.5" /> {v.total_candidaturas} candidatura(s)</span>
                    <span>{v.pendentes} pendente(s)</span>
                    <span>{v.em_entrevista} em entrevista</span>
                    <span>{v.finalizadas} finalizada(s)</span>
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {(ACOES_VAGA[v.situacao] || []).map(([situacao, rotulo]) => (
                    <button key={situacao} type="button" disabled={ocupado === v.id}
                      onClick={() => mudarSituacao(v.id, situacao)} className={BOTAO_SECUNDARIO}>
                      {rotulo}
                    </button>
                  ))}
                  <button
                    type="button"
                    aria-expanded={aberta === v.id}
                    onClick={() => setAberta(aberta === v.id ? null : v.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-black"
                  >
                    Candidatos
                    <ChevronDown className={`size-3.5 transition-transform ${aberta === v.id ? "rotate-180" : ""}`} />
                  </button>
                </div>
              </div>
              {aberta === v.id && <Candidatos vagaId={v.id} aoMudar={carregar} />}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
