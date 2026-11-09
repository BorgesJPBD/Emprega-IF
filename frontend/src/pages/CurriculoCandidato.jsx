import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowRight, Lock } from "lucide-react";

import { get } from "../api";
import { lerSessao } from "../auth";
import CurriculoVisual from "../componentes/CurriculoVisual";
import PlacaTitulo from "../componentes/PlacaTitulo";

const data = (iso) => new Date(iso).toLocaleDateString("pt-BR");

export default function CurriculoCandidato() {
  const { id } = useParams();
  const { pathname } = useLocation();
  const sessao = lerSessao();
  const empresa = sessao?.usuario?.papel === "empresa";

  const [curriculo, setCurriculo] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!empresa) return;
    setCurriculo(null);
    setErro("");
    get(`/candidaturas/${id}/curriculo`)
      .then(setCurriculo)
      .catch((e) =>
        setErro(
          e.status === 404
            ? "Currículo não encontrado. O candidato pode ter apagado o currículo ou desistido da vaga."
            : e.message
        )
      );
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!empresa) {
    return (
      <main className="container-site py-16 sm:py-24">
        <div className="cartao mx-auto max-w-xl px-6 py-10 sm:px-10">
          <span className="picto"><Lock className="size-5" /></span>
          <h1 className="mt-5 text-3xl">Currículo do candidato</h1>
          <p className="mt-2 text-[17px] text-tinta-media">Entre com a conta da empresa que publicou a vaga para ver o currículo.</p>
          <Link to="/login" state={{ de: pathname }} className="botao botao--largo mt-7">
            Entrar como empresa <ArrowRight className="seta size-5" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container-site pb-20 pt-6 sm:pt-10">
      <div className="nao-imprimir">
        <PlacaTitulo
          titulo="Currículo do candidato"
          resumo="Currículo montado pelo próprio estudante no modelo da plataforma."
          voltar={{ para: "/painel", rotulo: "Painel da empresa" }}
        />
      </div>

      {erro && <p role="alert" className="aviso aviso--erro mt-6">{erro}</p>}
      {!curriculo && !erro && <p className="mt-8 text-[17px] font-bold">Carregando...</p>}

      {curriculo && (
        <div className="mx-auto mt-4 max-w-3xl">
          <div className="nao-imprimir mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[15px] text-tinta-media">Atualizado em {data(curriculo.atualizado_em)}</p>
            <button type="button" onClick={() => window.print()} className="botao botao--contorno botao--compacto">
              Baixar PDF
            </button>
          </div>

          <CurriculoVisual
            dados={curriculo.dados}
            contato={{
              nome: curriculo.nome,
              email_if: curriculo.email_if,
              telefone: curriculo.telefone,
              linkedin_url: curriculo.linkedin_url,
              instagram_usuario: curriculo.instagram_usuario,
            }}
          />

          <p className="nao-imprimir mt-4 text-sm text-tinta-fraca">
            Use estes dados apenas para o processo seletivo desta vaga, conforme os termos de uso. Em
            "Baixar PDF", escolha "Salvar como PDF" na janela de impressão.
          </p>
        </div>
      )}
    </main>
  );
}