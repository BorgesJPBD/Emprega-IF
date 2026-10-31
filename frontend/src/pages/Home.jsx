import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowUpRight, RotateCw, Search } from "lucide-react";

import AvisoExemplo, { VAGAS_DE_EXEMPLO } from "../componentes/AvisoExemplo";
import Botao from "../componentes/Botao";
import CartaoVaga from "../componentes/CartaoVaga";
import Pilula from "../componentes/Pilula";
import Trajeto from "../componentes/Trajeto";
import Vitrine from "../componentes/Vitrine";
import { EQUIPE, ORIENTADOR } from "../contato";
import { buscarVagas, cidadeDe, diasAte, ehNova } from "../vagas";

const FILTROS = ["Todas", "Estágio", "Jovem aprendiz"];
const NO_MURAL = 5;

const PARADAS = [
  { titulo: "Enviada", texto: "A confirmação chega no seu e-mail." },
  { titulo: "Entrevista", texto: "Se a empresa chamar, você recebe o aviso." },
  { titulo: "Resultado", texto: "A resposta aparece no seu painel." },
];

const COMPARACAO = [
  { rotulo: "Quem pode", estagio: "Quem está matriculado e frequentando o curso", aprendiz: "Quem tem de 14 a 24 anos, estudando ou com o ensino médio concluído" },
  { rotulo: "Contrato", estagio: "Termo de compromisso com a escola, sem carteira assinada", aprendiz: "Carteira assinada, por até 2 anos" },
  { rotulo: "Jornada", estagio: "Até 6 horas por dia, sem atrapalhar as aulas", aprendiz: "Até 6 horas por dia, com parte do tempo em curso de aprendizagem" },
  { rotulo: "Pagamento", estagio: "Bolsa e auxílio-transporte combinados com a empresa", aprendiz: "Pelo menos o salário mínimo por hora, com os direitos da CLT" },
];

const doisDigitos = (n) => String(n).padStart(2, "0");

function porCidade(vagas) {
  const contagem = new Map();
  vagas.forEach((v) => contagem.set(v.local, (contagem.get(v.local) ?? 0) + 1));
  return [...contagem].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt-BR"));
}

function ordenarMural(vagas) {
  const peso = (v) => (ehNova(v) ? 1000 : 0) + (v.numeroVagas ?? 1);
  const [primeira] = [...vagas].sort((a, b) => peso(b) - peso(a));
  return primeira ? [primeira, ...vagas.filter((v) => v !== primeira)] : [];
}

function Esqueleto() {
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className={`cartao p-5 ${i === 0 ? "md:col-span-2" : ""}`}>
          <div className="h-5 w-24 animate-pulse rounded-[3px] bg-superficie-2" />
          <div className="mt-4 h-7 w-3/4 animate-pulse rounded-[3px] bg-superficie-2" />
          <div className="mt-2 h-4 w-1/3 animate-pulse rounded-[3px] bg-superficie-2" />
          <div className="mt-10 h-6 w-28 animate-pulse rounded-[3px] bg-superficie-2" />
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [filtro, setFiltro] = useState("Todas");
  const [vagas, setVagas] = useState([]);
  const [estado, setEstado] = useState("carregando");
  const [demorando, setDemorando] = useState(false);
  const [termo, setTermo] = useState("");
  const navegar = useNavigate();
  const tentativa = useRef(0);

  function buscarNoTopo(evento) {
    evento.preventDefault();
    const q = termo.trim();
    navegar(q ? `/vagas?q=${encodeURIComponent(q)}` : "/vagas");
  }

  function carregar() {
    const minha = ++tentativa.current;
    setEstado("carregando");
    setDemorando(false);
    const aviso = setTimeout(() => minha === tentativa.current && setDemorando(true), 3000);
    buscarVagas({ limite: 100 })
      .then((lista) => { if (minha === tentativa.current) { setVagas(lista); setEstado("ok"); } })
      .catch(() => { if (minha === tentativa.current) setEstado("erro"); })
      .finally(() => clearTimeout(aviso));
  }

  useEffect(carregar, []);

  const visiveis = ordenarMural(vagas.filter((v) => filtro === "Todas" || v.tipo === filtro));
  const cidades = porCidade(vagas);
  const contar = (tipo) => vagas.filter((v) => v.tipo === tipo).length;
  const novas = vagas.filter(ehNova).length;
  const encerrando = vagas.filter((v) => { const d = diasAte(v.prazo); return d !== null && d >= 0 && d <= 7; }).length;
  const pronto = estado === "ok";

  return (
    <main>
      <section className="container-site pb-14 pt-4 sm:pt-8">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-12">
          <div className="cartao flex flex-col justify-between gap-8 p-6 sm:p-10 col-span-2 lg:col-span-8 lg:row-span-2">
            <div>
              <h1 className="max-w-[13ch] text-[clamp(2.75rem,8vw,5.75rem)] leading-[0.98]">
                Sua primeira vaga começa no IF.
              </h1>
              <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-tinta-media">
                Estágio e jovem aprendiz para estudantes do IFMS, do técnico integrado ao superior.
                Sem exigir experiência e sem pagar nada.
              </p>
            </div>

            <form onSubmit={buscarNoTopo} role="search" className="flex flex-col gap-2 sm:flex-row">
              <label className="relative flex-1">
                <span className="sr-only">Qual vaga você procura?</span>
                <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-acao" />
                <input
                  type="text"
                  inputMode="search"
                  enterKeyHint="search"
                  value={termo}
                  maxLength={100}
                  onChange={(e) => setTermo(e.target.value)}
                  placeholder="Cargo, área ou empresa"
                  className="entrada min-h-14 border-[1.5px] border-floresta pl-12 text-lg"
                />
              </label>
              <button type="submit" className="botao botao--lima min-h-14 px-8 text-lg">Buscar</button>
            </form>
          </div>

          <div className="placa col-span-2 flex flex-col p-6 sm:p-7 lg:col-span-4">
            <p className="dado text-white/75">Vagas abertas agora</p>
            <p className="mono mt-2 text-[5rem] font-bold leading-none tracking-tighter text-lima sm:text-[6rem]" aria-live="polite">
              {pronto ? doisDigitos(vagas.length) : "--"}
            </p>
            <ul className="mt-6 border-t border-white/20">
              {["Estágio", "Jovem aprendiz"].map((tipo) => (
                <li key={tipo}>
                  <Link
                    to={`/vagas?tipo=${encodeURIComponent(tipo)}`}
                    className="group flex min-h-12 items-center justify-between gap-3 border-b border-white/20 text-[15px] font-semibold"
                  >
                    {tipo}
                    <span className="mono flex items-center gap-2 text-white/85">
                      {pronto ? doisDigitos(contar(tipo)) : "--"}
                      <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <Link to="/vagas" className="cartao cartao--vivo flex flex-col justify-between gap-4 p-5 lg:col-span-2">
            <p className="dado text-tinta-media">Novas na semana</p>
            <p className="mono text-[2.75rem] font-bold leading-none tracking-tighter text-floresta">
              {pronto ? doisDigitos(novas) : "--"}
              {pronto && novas > 0 && <span aria-hidden="true" className="ml-1 inline-block size-3 rounded-full border border-[#0a3622] bg-lima align-top" />}
            </p>
          </Link>
          <Link to="/vagas" className="cartao cartao--vivo flex flex-col justify-between gap-4 p-5 lg:col-span-2">
            <p className="dado text-tinta-media">Encerram em 7 dias</p>
            <p className={`mono text-[2.75rem] font-bold leading-none tracking-tighter ${encerrando ? "text-urgente" : "text-floresta"}`}>
              {pronto ? doisDigitos(encerrando) : "--"}
            </p>
          </Link>

          <nav aria-labelledby="titulo-cidades" className="cartao col-span-2 p-5 sm:p-6 lg:col-span-8">
            <h2 id="titulo-cidades" className="text-xl">Vagas por cidade</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {pronto && cidades.map(([cidade, n]) => (
                <li key={cidade}>
                  <Link to={`/vagas?local=${encodeURIComponent(cidade)}`} className="pilula">
                    <span className="dado text-[0.75rem]">{cidadeDe(cidade)}</span>
                    <span className="pilula__conta">{doisDigitos(n)}</span>
                  </Link>
                </li>
              ))}
              {pronto && cidades.length === 0 && (
                <li className="text-[15px] text-tinta-media">Assim que uma empresa publicar, a cidade aparece aqui.</li>
              )}
              {!pronto && [0, 1, 2].map((i) => (
                <li key={i} aria-hidden="true" className="h-11 w-36 animate-pulse rounded-full bg-superficie-2" />
              ))}
            </ul>
          </nav>

          <Link
            to="/cadastro/estudante"
            className="group flex flex-col justify-between gap-6 rounded-cartao border-[1.5px] border-[#0a3622] bg-lima p-6 text-[#0a3622] shadow-[3px_3px_0_var(--sombra)] transition-[transform,box-shadow] duration-150 ease-tatil hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--sombra)] col-span-2 lg:col-span-4"
          >
            <span className="flex items-start justify-between gap-4">
              <span className="font-display text-[1.75rem] font-extrabold leading-[1.05] tracking-[-0.03em]">Criar meu perfil</span>
              <ArrowUpRight className="size-7 shrink-0 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
            <span className="text-[15px] font-medium">Curso, período e contato. Leva dois minutos, e a candidatura vira um toque.</span>
          </Link>
        </div>
      </section>

      <section className="border-t border-linha py-14 sm:py-20">
        <div className="container-site">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <h2 className="text-[clamp(2.25rem,5vw,3.5rem)]">
              Mural de vagas
              {pronto && <span className="mono ml-3 align-top text-base font-bold tracking-normal text-acao">{doisDigitos(visiveis.length)}</span>}
            </h2>
            <div className="trilho" role="group" aria-label="Filtrar por tipo">
              {FILTROS.map((nome) => (
                <Pilula
                  key={nome}
                  ativa={filtro === nome}
                  conta={pronto ? doisDigitos(nome === "Todas" ? vagas.length : contar(nome)) : undefined}
                  onClick={() => setFiltro(nome)}
                >
                  {nome}
                </Pilula>
              ))}
            </div>
          </div>

          <p className="sr-only" aria-live="polite">
            {pronto ? `${visiveis.length} vagas` : estado === "carregando" ? "Carregando vagas" : ""}
          </p>

          {estado === "carregando" && (
            <>
              {demorando && (
                <p className="aviso aviso--info mt-6">
                  Acordando o servidor. Na primeira visita do dia isso pode levar até 1 minuto.
                </p>
              )}
              <Esqueleto />
            </>
          )}

          {estado === "erro" && (
            <div className="aviso aviso--erro mt-6 flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>Não conseguimos falar com o servidor agora.</span>
              <button type="button" onClick={carregar} className="botao botao--contorno botao--compacto">
                <RotateCw className="size-4" /> Tentar de novo
              </button>
            </div>
          )}

          {pronto && (
            visiveis.length > 0 ? (
              <>
                <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {visiveis.slice(0, NO_MURAL).map((vaga, i) => (
                    <CartaoVaga key={vaga.id} vaga={vaga} destaque={i === 0} className={i === 0 ? "md:col-span-2" : ""} />
                  ))}
                </div>
                <div className="mt-6 flex flex-col-reverse items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <AvisoExemplo />
                  <Botao
                    para={filtro === "Todas" ? "/vagas" : `/vagas?tipo=${encodeURIComponent(filtro)}`}
                    variante="contorno"
                    seta
                    className="w-full sm:w-auto"
                  >
                    {visiveis.length > NO_MURAL ? `Ver as ${visiveis.length} vagas` : "Buscar com filtros"}
                  </Botao>
                </div>
              </>
            ) : (
              <div className="cartao mt-6 flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                <p className="max-w-[52ch] text-[17px] text-tinta-media">
                  {vagas.length
                    ? `Nenhuma vaga de ${filtro.toLowerCase()} aberta agora. Novas vagas entram no mural assim que as empresas publicam.`
                    : "Ainda não há vagas abertas. Assim que uma empresa publicar, ela aparece aqui."}
                </p>
                {vagas.length > 0 && (
                  <Botao variante="contorno" onClick={() => setFiltro("Todas")}>Ver todas</Botao>
                )}
              </div>
            )
          )}
        </div>
      </section>

      <section className="border-y border-linha bg-superficie py-14 sm:py-20">
        <div className="container-site grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-6">
            <h2 className="text-[clamp(2rem,4vw,2.75rem)]">Depois que você se candidata</h2>
            <p className="mt-4 max-w-[40ch] text-[17px] leading-relaxed text-tinta-media">
              Cada candidatura mostra em que etapa está, e você recebe um e-mail quando ela muda.
            </p>
            <div className="mt-10">
              <Trajeto paradas={PARADAS} desenhar />
            </div>
            <p className="mt-8 text-sm text-tinta-fraca">
              No computador do laboratório? Ao entrar, deixe “Lembrar-me” desmarcado.
            </p>
          </div>
          {/* o quadro animado: vagas reais, candidatura e aviso de entrevista */}
          <div className="flex min-w-0 justify-center lg:col-span-6 lg:justify-end">
            <Vitrine vagas={vagas} total={vagas.length} />
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="container-site">
          <h2 className="text-[clamp(2rem,4vw,2.75rem)]">Estágio ou jovem aprendiz?</h2>
          <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-tinta-media">
            São dois jeitos diferentes de começar. O resumo abaixo segue as regras gerais da lei; cada vaga traz os detalhes.
          </p>

          <div className="cartao mt-8 overflow-hidden">
            <div className="hidden grid-cols-[11rem_1fr_1fr] bg-painel text-white md:grid">
              <span />
              <span className="px-6 py-4 font-display text-xl font-bold tracking-tight">Estágio</span>
              <span className="border-l border-white/15 px-6 py-4 font-display text-xl font-bold tracking-tight">Jovem aprendiz</span>
            </div>
            <dl className="divide-y divide-linha">
              {COMPARACAO.map((l) => (
                <div key={l.rotulo} className="grid md:grid-cols-[11rem_1fr_1fr]">
                  <dt className="bg-superficie-2 px-6 py-3 font-display text-lg font-bold tracking-tight text-floresta md:bg-transparent md:py-5">{l.rotulo}</dt>
                  <dd className="px-6 py-3 text-[17px] md:py-5"><span className="font-semibold text-acao md:hidden">Estágio: </span>{l.estagio}</dd>
                  <dd className="border-t border-linha px-6 py-3 text-[17px] md:border-l md:border-t-0 md:py-5"><span className="font-semibold text-acao md:hidden">Jovem aprendiz: </span>{l.aprendiz}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="border-t border-linha py-14 sm:py-20">
        <div className="container-site grid gap-3 lg:grid-cols-12">
          <div className="cartao p-6 sm:p-10 lg:col-span-7">
            <h2 className="text-[clamp(2rem,4vw,2.75rem)]">Feito por estudantes do IFMS</h2>
            <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-tinta-media">
              O Emprega IF é um projeto de extensão. Não é um serviço oficial do Instituto Federal:
              é a nossa tentativa de juntar num lugar só as vagas que hoje se perdem em murais e grupos.
            </p>
            <ul className="mt-6 grid gap-x-8 text-[16px] sm:grid-cols-2">
              {EQUIPE.map((nome) => <li key={nome} className="border-b border-linha py-2">{nome}</li>)}
            </ul>
            <p className="mt-4 text-[15px] text-tinta-media">Orientação: {ORIENTADOR}.</p>
          </div>

          <div className="placa flex flex-col justify-between gap-8 p-6 sm:p-10 lg:col-span-5">
            <div>
              <h2 className="text-[clamp(1.75rem,3vw,2.25rem)]">Sua empresa contrata estagiários?</h2>
              <p className="mt-4 text-[17px] leading-relaxed text-white/85">
                {VAGAS_DE_EXEMPLO
                  ? "Estamos começando, e as vagas de hoje são exemplos. A primeira vaga de verdade pode ser a sua: publicar não custa nada e os candidatos chegam com curso e período."
                  : "Publicar não custa nada, e os candidatos chegam com curso e período."}
              </p>
            </div>
            <Botao para="/para-empresas" variante="claro" seta className="self-start">Publicar uma vaga</Botao>
          </div>
        </div>
      </section>
    </main>
  );
}
