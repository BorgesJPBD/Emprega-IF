import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Building2, CircleCheck, Clock, Lock, MessagesSquare, Send } from "lucide-react";

import { get } from "../api";
import { lerSessao } from "../auth";

/* Candidaturas do estudante logado. A linha do tempo vem da tabela
   candidatura_historico, preenchida pelo trigger do banco a cada
   mudança de status (migration 005). */

const STATUS = {
  Pendente: { cor: "bg-neutral-100 text-neutral-700", Icone: Send, texto: "Candidatura enviada" },
  Entrevista: { cor: "bg-sky-50 text-sky-700", Icone: MessagesSquare, texto: "Chamado para entrevista" },
  Finalizado: { cor: "bg-emerald-50 text-emerald-700", Icone: CircleCheck, texto: "Processo finalizado" },
};

const quando = (iso) =>
  new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default function MinhasCandidaturas() {
  const { pathname } = useLocation();
  const sessao = lerSessao();
  const estudante = sessao?.usuario?.papel === "estudante" ? sessao.usuario : null;

  const [lista, setLista] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (estudante) get("/candidaturas/minhas").then(setLista).catch((e) => setErro(e.message));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!estudante) {
    return (
      <main className="mx-auto max-w-xl px-5 py-20 text-center">
        <div className="rounded-2xl border border-neutral-200 bg-white p-8">
          <Lock className="mx-auto size-9 text-neutral-400" />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-neutral-900">Minhas candidaturas</h1>
          <p className="mt-2 text-sm text-neutral-500">Entre com a sua conta de estudante para acompanhar as candidaturas.</p>
          <Link to="/login" state={{ de: pathname }} className="mt-6 block w-full rounded-xl bg-neutral-900 py-3.5 text-sm font-medium text-white transition hover:bg-black">
            Entrar
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <p className="text-xs uppercase tracking-widest text-neutral-400">Estudante</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-neutral-900">Minhas candidaturas</h1>
      <p className="mt-2 text-sm text-neutral-500">Acompanhe o andamento de cada vaga em que você se candidatou.</p>

      {erro && <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>}
      {lista === null && !erro && <p className="mt-10 text-sm text-neutral-500">Carregando...</p>}

      {lista?.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
          <h2 className="text-base font-medium text-neutral-900">Você ainda não se candidatou</h2>
          <p className="mt-1 text-sm text-neutral-500">Encontre uma oportunidade e envie a sua candidatura.</p>
          <Link to="/vagas" className="mt-6 inline-block rounded-xl bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-black">
            Ver vagas
          </Link>
        </div>
      )}

      <ul className="mt-8 space-y-4">
        {(lista || []).map((c) => {
          const s = STATUS[c.status] || STATUS.Pendente;
          return (
            <li key={c.id} className="rounded-2xl border border-neutral-200 bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link to={`/vagas/${c.vaga_id}`} className="text-lg font-medium text-neutral-900 hover:underline">{c.vaga_titulo}</Link>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-neutral-500">
                    <Building2 className="size-3.5" /> {c.empresa_nome}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${s.cor}`}>{c.status}</span>
              </div>

              <ol className="mt-5 space-y-3 border-l border-neutral-200 pl-5">
                {c.historico.map((h, i) => {
                  const passo = STATUS[h.status_novo] || STATUS.Pendente;
                  return (
                    <li key={i} className="relative">
                      <span className="absolute -left-[27px] top-0.5 grid size-3.5 place-items-center rounded-full border border-neutral-300 bg-white">
                        <span className={`size-1.5 rounded-full ${i === c.historico.length - 1 ? "bg-neutral-900" : "bg-neutral-300"}`} />
                      </span>
                      <p className="flex items-center gap-2 text-sm text-neutral-800">
                        <passo.Icone className="size-3.5 text-neutral-400" /> {passo.texto}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-neutral-400">
                        <Clock className="size-3" /> {quando(h.alterado_em)}
                      </p>
                    </li>
                  );
                })}
              </ol>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
