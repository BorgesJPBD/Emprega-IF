import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, ChevronDown, Lock, Mail, Phone, Plus, Users } from "lucide-react";

import { get, patch } from "../api";
import { lerSessao } from "../auth";
import PlacaTitulo from "../componentes/PlacaTitulo";

const SITUACAO = {
  Rascunho: { rotulo: "Rascunho", cor: "tarja--neutra" },
  Ativa: { rotulo: "Inscrições abertas", cor: "tarja--estagio" },
  EmSelecao: { rotulo: "Em seleção", cor: "tarja--aprendiz" },
  Finalizada: { rotulo: "Finalizada", cor: "tarja--neutra" },
  Cancelada: { rotulo: "Cancelada", cor: "tarja--neutra" },
};

const ACOES_VAGA = {
  Ativa: [["EmSelecao", "Encerrar inscrições"], ["Cancelada", "Cancelar vaga"]],
  EmSelecao: [["Finalizada", "Finalizar vaga"], ["Cancelada", "Cancelar vaga"]],
};

const STATUS = {
  Pendente: "tarja--neutra",
  Entrevista: "tarja--aprendiz",
  Finalizado: "tarja--estagio",
};

const ACOES_CANDIDATURA = {
  Pendente: [["Entrevista", "Chamar para entrevista"], ["Finalizado", "Finalizar"]],
  Entrevista: [["Finalizado", "Finalizar"]],
};

const data = (iso) => (iso ? new Date(iso.length === 10 ? `${iso}T00:00:00` : iso).toLocaleDateString("pt-BR") : "—");

const telefone = (t) => `(${t.slice(0, 2)}) ${t.slice(2, -4)}-${t.slice(-4)}`;

const classeAcao = (destino) => `botao botao--compacto ${destino === "Cancelada" ? "botao--perigo" : "botao--contorno"}`;

function Selo({ classe, children }) {
  return <span className={`tarja ${classe}`}>{children}</span>;
}

function Resumo({ rotulo, valor }) {
  return (
    <div className="px-5 py-4">
      <dt className="text-[15px] font-semibold text-tinta-media">{rotulo}</dt>
      <dd className="mt-1 text-4xl font-extrabold tabular-nums text-acao">{valor}</dd>
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

  if (erro && !lista) return <p className="erro-campo border-t border-linha px-5 py-5 sm:px-7">{erro}</p>;
  if (!lista) return <p className="border-t border-linha px-5 py-5 text-[15px] font-bold sm:px-7">Carregando candidatos...</p>;
  if (!lista.length) return <p className="border-t border-linha bg-superficie-2 px-5 py-5 text-[15px] sm:px-7">Ninguém se candidatou ainda.</p>;

  return (
    <div className="border-t border-linha bg-superficie-2 px-5 sm:px-7">
      {erro && <p role="alert" className="aviso aviso--erro mt-4">{erro}</p>}
      <ul className="divide-y divide-linha">
        {lista.map((c) => (
          <li key={c.candidatura_id} className="flex flex-wrap items-start justify-between gap-4 py-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-lg font-extrabold">{c.nome}</p>
                <Selo classe={STATUS[c.status]}>{c.status}</Selo>
              </div>
              <p className="mt-0.5 text-[15px] text-tinta-media">
                {c.curso} · {c.periodo}º período · {c.instituicao}
              </p>
              <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[15px] text-tinta">
                <a href={`mailto:${c.email_if}`} className="link inline-flex items-center gap-1.5">
                  <Mail className="size-4" /> {c.email_if}
                </a>
                {c.telefone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="size-4 text-acao" /> {telefone(c.telefone)}
                  </span>
                )}
                <span>Inscrito em {data(c.data_inscricao)}</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(ACOES_CANDIDATURA[c.status] || []).map(([status, rotulo]) => (
                <button key={status} type="button" disabled={ocupado === c.candidatura_id}
                  onClick={() => mudar(c.candidatura_id, status)} className="botao botao--contorno botao--compacto">
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
    if (situacao === "Cancelada" && !window.confirm("Cancelar esta vaga? Ela sai da lista e não pode ser reaberta.")) return;
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
      <main className="container-site py-16 sm:py-24">
        <div className="cartao mx-auto max-w-xl px-6 py-10 sm:px-10">
          <span className="picto"><Lock className="size-5" /></span>
          <h1 className="mt-5 text-3xl">Painel da empresa</h1>
          <p className="mt-2 text-[17px] text-tinta-media">Entre com a conta da sua empresa para ver as vagas e os candidatos.</p>
          <Link to="/login" state={{ de: pathname }} className="botao botao--largo mt-7">
            Entrar como empresa <ArrowRight className="seta size-5" />
          </Link>
        </div>
      </main>
    );
  }

  const total = (campo) => (vagas || []).reduce((soma, v) => soma + v[campo], 0);

  return (
    <main className="container-site pb-20 pt-6 sm:pt-10">
      <PlacaTitulo titulo="Painel da empresa" resumo={empresa.nome}>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/vagas/nova" className="botao botao--claro">
            <Plus className="size-5" /> Publicar vaga
          </Link>
        </div>
      </PlacaTitulo>

      <dl className="cartao mt-4 grid grid-cols-2 divide-linha lg:grid-cols-4 lg:divide-x [&>*:nth-child(-n+2)]:border-b [&>*:nth-child(-n+2)]:border-linha lg:[&>*:nth-child(-n+2)]:border-b-0 [&>*:nth-child(odd)]:border-r [&>*:nth-child(odd)]:border-linha lg:[&>*:nth-child(odd)]:border-r-0">
        <Resumo rotulo="Vagas publicadas" valor={vagas ? vagas.length : "—"} />
        <Resumo rotulo="Com inscrições abertas" valor={vagas ? vagas.filter((v) => v.situacao === "Ativa").length : "—"} />
        <Resumo rotulo="Candidaturas recebidas" valor={vagas ? total("total_candidaturas") : "—"} />
        <Resumo rotulo="Aguardando resposta" valor={vagas ? total("pendentes") : "—"} />
      </dl>

      {erro && <p role="alert" className="aviso aviso--erro mt-6">{erro}</p>}

      {vagas === null && !erro && <p className="mt-8 text-[17px] font-bold">Carregando suas vagas...</p>}

      {vagas?.length === 0 && (
        <div className="cartao mt-6 flex flex-col items-start gap-4 px-6 py-10 sm:flex-row sm:items-center sm:px-8">
          <div className="flex-1">
            <h2 className="text-xl">Você ainda não publicou vagas</h2>
            <p className="mt-1 text-[15px] text-tinta-media">Publique a primeira para começar a receber candidaturas.</p>
          </div>
          <Link to="/vagas/nova" className="botao">Publicar a primeira vaga <ArrowRight className="seta size-5" /></Link>
        </div>
      )}

      <h2 className="mt-12 text-3xl">Suas vagas</h2>
      <ul className="mt-5 space-y-4">
        {(vagas || []).map((v) => {
          const s = SITUACAO[v.situacao] || SITUACAO.Rascunho;
          return (
            <li key={v.id} className="cartao overflow-hidden">
              <div className="flex flex-wrap items-start justify-between gap-4 px-5 py-5 sm:px-7">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link to={`/vagas/${v.id}`} className="text-xl font-extrabold hover:underline">{v.titulo}</Link>
                    <Selo classe={s.cor}>{s.rotulo}</Selo>
                  </div>
                  <p className="mt-1 text-[15px] text-tinta-media">
                    {v.tipo} · publicada em {data(v.data_publicacao)} · inscrições até {data(v.prazo_inscricao)}
                  </p>
                  <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[15px]">
                    <span className="inline-flex items-center gap-1.5 font-bold"><Users className="size-4 text-acao" /> {v.total_candidaturas} candidatura(s)</span>
                    <span>{v.pendentes} pendente(s)</span>
                    <span>{v.em_entrevista} em entrevista</span>
                    <span>{v.finalizadas} finalizada(s)</span>
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {(ACOES_VAGA[v.situacao] || []).map(([situacao, rotulo]) => (
                    <button key={situacao} type="button" disabled={ocupado === v.id}
                      onClick={() => mudarSituacao(v.id, situacao)} className={classeAcao(situacao)}>
                      {rotulo}
                    </button>
                  ))}
                  <button
                    type="button"
                    aria-expanded={aberta === v.id}
                    onClick={() => setAberta(aberta === v.id ? null : v.id)}
                    className="botao botao--compacto"
                  >
                    Candidatos
                    <ChevronDown className={`size-4 transition-transform ${aberta === v.id ? "rotate-180" : ""}`} />
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
