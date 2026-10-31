import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Building2, Lock, SearchX } from "lucide-react";

import { get } from "../api";
import { lerSessao } from "../auth";
import PlacaTitulo from "../componentes/PlacaTitulo";
import Trajeto from "../componentes/Trajeto";

const ETAPAS = [
  { status: "Pendente", titulo: "Candidatura enviada" },
  { status: "Entrevista", titulo: "Entrevista" },
  { status: "Finalizado", titulo: "Processo finalizado" },
];

const quando = (iso) =>
  new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

function paradasDe(c) {
  return ETAPAS.map((e) => {
    const passo = [...c.historico].reverse().find((h) => h.status_novo === e.status);
    return { titulo: e.titulo, texto: passo ? quando(passo.alterado_em) : "Ainda não", aqui: "Agora" };
  });
}

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
      <main className="container-site py-16 sm:py-24">
        <div className="cartao mx-auto max-w-xl px-6 py-10 sm:px-10">
          <span className="picto"><Lock className="size-5" /></span>
          <h1 className="mt-5 text-3xl">Minhas candidaturas</h1>
          <p className="mt-2 text-[17px] text-tinta-media">Entre com a sua conta de estudante para acompanhar as candidaturas.</p>
          <Link to="/login" state={{ de: pathname }} className="botao botao--largo mt-7">
            Entrar <ArrowRight className="seta size-5" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container-site pb-20 pt-6 sm:pt-10">
      <PlacaTitulo titulo="Minhas candidaturas" resumo="Acompanhe em que parada está cada vaga em que você se candidatou." />

      {erro && <p role="alert" className="aviso aviso--erro mt-6">{erro}</p>}
      {lista === null && !erro && <p className="mt-8 text-[17px] font-bold">Carregando...</p>}

      {lista?.length === 0 && (
        <div className="cartao mt-6 flex flex-col items-start gap-4 px-6 py-10 sm:flex-row sm:items-center sm:px-8">
          <span className="picto"><SearchX className="size-5" /></span>
          <div className="flex-1">
            <h2 className="text-xl">Você ainda não se candidatou</h2>
            <p className="mt-1 text-[15px] text-tinta-media">Encontre uma oportunidade e envie a sua candidatura.</p>
          </div>
          <Link to="/vagas" className="botao">Ver vagas <ArrowRight className="seta size-5" /></Link>
        </div>
      )}

      <ul className="mt-6 space-y-5">
        {(lista || []).map((c) => {
          const atual = Math.max(ETAPAS.findIndex((e) => e.status === c.status), 0);
          return (
            <li key={c.id} className="cartao overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-linha px-5 py-4 sm:px-7">
                <div className="min-w-0">
                  <Link to={`/vagas/${c.vaga_id}`} className="text-xl font-extrabold hover:underline">{c.vaga_titulo}</Link>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[15px] text-tinta-media">
                    <Building2 className="size-4" /> {c.empresa_nome}
                  </p>
                </div>
                <span className={`tarja ${c.status === "Finalizado" ? "tarja--estagio" : c.status === "Entrevista" ? "tarja--vivo" : "tarja--neutra"}`}>
                  {c.status}
                </span>
              </div>
              <div className="px-5 py-6 sm:px-7">
                <Trajeto paradas={paradasDe(c)} atual={atual} compacto />
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
