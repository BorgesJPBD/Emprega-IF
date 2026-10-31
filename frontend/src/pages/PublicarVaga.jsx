import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Briefcase, Building2, CheckCircle2, Lock } from "lucide-react";

import { ErroApi, get, post } from "../api";
import { lerSessao } from "../auth";
import CartaoVaga from "../componentes/CartaoVaga";
import PlacaTitulo from "../componentes/PlacaTitulo";
import { mascaraMoeda, valorEmNumero } from "../utils/formulario";

const TIPOS = ["Estágio", "Jovem aprendiz"];
const AREAS_PADRAO = ["Tecnologia", "Administrativo", "Marketing", "Design", "Vendas", "Recursos Humanos", "Engenharia", "Logística", "Outra"];
const MODALIDADES = ["Presencial", "Híbrido", "Remoto"];

const INICIAL = {
  titulo: "", tipo: "", area: "", localizacao: "", modalidade: "",
  horario_entrada: "", horario_saida: "", carga_horaria: "", remuneracao: "", beneficios: "",
  descricao: "", requisitos: "", diferenciais: "",
  prazo_inscricao: "", numero_vagas: "1", aceite_termos: false,
};

const ORDEM = ["titulo", "tipo", "area", "localizacao", "modalidade", "horario_entrada", "horario_saida", "carga_horaria", "remuneracao", "beneficios", "descricao", "requisitos", "diferenciais", "prazo_inscricao", "numero_vagas", "aceite_termos"];

const MEIO = "col-span-6 sm:col-span-3";
const TERCO = "col-span-6 sm:col-span-2";
const TODO = "col-span-6";

function Campo({ nome, rotulo, erro, como = "input", lista = [], className = "", ...props }) {
  const comum = {
    id: nome,
    name: nome,
    "aria-invalid": erro ? "true" : undefined,
    "aria-describedby": erro ? `${nome}-erro` : undefined,
    className: "entrada",
    ...props,
  };

  return (
    <div className={className}>
      <label htmlFor={nome} className="rotulo">{rotulo}</label>

      {como === "select" ? (
        <select {...comum}>
          <option value="">Selecione</option>
          {lista.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      ) : como === "textarea" ? (
        <textarea rows={4} {...comum} />
      ) : (
        <input {...comum} />
      )}

      <div className="mt-1.5 flex min-h-5 justify-between gap-3 text-sm">
        <span id={`${nome}-erro`} className="font-semibold text-urgente">{erro}</span>
        {como === "textarea" && props.maxLength && (
          <span className="ml-auto tabular-nums text-tinta-fraca">{props.value.length}/{props.maxLength}</span>
        )}
      </div>
    </div>
  );
}

function Secao({ titulo, children }) {
  return (
    <section className="cartao p-5 sm:p-7">
      <h2 className="text-2xl">{titulo}</h2>
      <div className="mt-5 grid grid-cols-6 gap-x-5 gap-y-2">{children}</div>
    </section>
  );
}

function validar(f) {
  const e = {};
  const hoje = new Date().toISOString().slice(0, 10);

  ["titulo", "tipo", "area", "localizacao", "modalidade", "descricao", "requisitos", "prazo_inscricao"]
    .forEach((c) => { if (!f[c].trim()) e[c] = "Campo obrigatório."; });

  if (f.horario_entrada && f.horario_saida && f.horario_saida <= f.horario_entrada) e.horario_saida = "A saída deve ser depois da entrada.";
  if (!e.descricao && f.descricao.trim().length < 30) e.descricao = "Descreva a vaga com pelo menos 30 caracteres.";
  if (!e.prazo_inscricao && f.prazo_inscricao < hoje) e.prazo_inscricao = "A data limite não pode estar no passado.";
  if (!Number.isInteger(Number(f.numero_vagas)) || Number(f.numero_vagas) < 1) e.numero_vagas = "Informe ao menos 1 vaga.";
  if (!f.aceite_termos) e.aceite_termos = "Confirme para publicar.";
  return e;
}

const publicarVaga = (dados) => post("/vagas", dados);

function montarPayload(f) {
  const ouNulo = (v) => (v.trim() ? v.trim() : null);
  return {
    ...f,
    horario_entrada: f.horario_entrada || null,
    horario_saida: f.horario_saida || null,
    carga_horaria: ouNulo(f.carga_horaria),
    beneficios: ouNulo(f.beneficios),
    diferenciais: ouNulo(f.diferenciais),
    remuneracao: f.remuneracao ? valorEmNumero(f.remuneracao) : null,
    numero_vagas: Number(f.numero_vagas),
  };
}

function SomenteEmpresa({ papel }) {
  const { pathname } = useLocation();
  return (
    <main className="container-site py-16 sm:py-24">
      <div className="cartao mx-auto max-w-xl px-6 py-10 sm:px-10">
        <span className="picto"><Lock className="size-5" /></span>
        <h1 className="mt-5 text-3xl">Publicar vaga</h1>
        <p className="mt-2 text-[17px] text-tinta-media">
          {papel === "estudante"
            ? "Você está conectado com uma conta de estudante. Para publicar vagas, entre com a conta da empresa."
            : "Para publicar uma vaga, entre com a conta da sua empresa."}
        </p>
        <Link to="/login" state={{ de: pathname }} className="botao botao--largo mt-7">
          Entrar como empresa <ArrowRight className="seta size-5" />
        </Link>
        <p className="mt-4 text-[15px]">
          Ainda não tem conta? <Link className="link" to="/cadastro/empresa">Criar conta empresarial</Link>
        </p>
      </div>
    </main>
  );
}

export default function PublicarVaga() {
  const sessao = lerSessao();
  const empresa = sessao?.usuario?.papel === "empresa" ? sessao.usuario : null;

  const [form, setForm] = useState(INICIAL);
  const [AREAS, setAreas] = useState(AREAS_PADRAO);

  useEffect(() => {
    get("/vagas/opcoes").then((o) => setAreas(o.areas)).catch(() => {});
  }, []);
  const [erros, setErros] = useState({});
  const [avisoErro, setAvisoErro] = useState("");
  const [publicada, setPublicada] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const alterar = (campo, valor) => {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    setErros(({ [campo]: _, ...resto }) => resto);
  };
  const ligar = (campo, tratar = (v) => v) => ({
    value: form[campo],
    erro: erros[campo],
    onChange: (ev) => alterar(campo, tratar(ev.target.value)),
  });

  async function enviar(ev) {
    ev.preventDefault();
    setAvisoErro("");
    const encontrados = validar(form);
    setErros(encontrados);

    const primeiro = ORDEM.find((c) => encontrados[c]);
    if (primeiro) return document.getElementById(primeiro)?.focus();

    setEnviando(true);
    try {
      const vaga = await publicarVaga(montarPayload(form));
      setPublicada(vaga);
      setForm(INICIAL);
    } catch (erro) {
      if (erro instanceof ErroApi) setErros(erro.campos);
      setAvisoErro(
        erro.status === 401
          ? "Sua sessão expirou. Entre novamente para publicar (o que você digitou continua aqui)."
          : erro.message || "Não foi possível publicar a vaga. Tente novamente."
      );
    } finally {
      setEnviando(false);
    }
  }

  if (!empresa) return <SomenteEmpresa papel={sessao?.usuario?.papel} />;

  if (publicada) {
    return (
      <main className="container-site py-16 sm:py-24">
        <div className="cartao mx-auto max-w-xl px-6 py-10 sm:px-10">
          <span className="picto"><CheckCircle2 className="size-5" /></span>
          <h1 className="mt-5 text-3xl">Vaga publicada</h1>
          <p className="mt-2 text-[17px] text-tinta-media">
            “{publicada.titulo}” já aparece para os estudantes do IF.
          </p>
          <Link to={`/vagas/${publicada.id}`} className="botao botao--largo mt-7">Ver a vaga publicada</Link>
          <Link to="/painel" className="botao botao--contorno botao--largo mt-3">Ir para o painel</Link>
          <p className="mt-4 text-center">
            <button type="button" onClick={() => setPublicada(null)} className="link text-[15px]">Publicar outra vaga</button>
          </p>
        </div>
      </main>
    );
  }

  const hora = (h) => h.replace(/^0/, "");
  const previa = {
    id: 0,
    Icone: Briefcase,
    titulo: form.titulo || "Título da vaga",
    area: form.area || "Área",
    empresa: empresa.nome,
    tipo: form.tipo || "Tipo",
    local: form.localizacao || "Cidade - UF",
    horario: form.horario_entrada && form.horario_saida
      ? `${hora(form.horario_entrada)} às ${hora(form.horario_saida)}`
      : "Horário a definir",
    valor: form.remuneracao ? valorEmNumero(form.remuneracao) : 0,
  };

  return (
    <main className="container-site pb-20 pt-6 sm:pt-10">
      <PlacaTitulo
        titulo="Publicar vaga"
        resumo="Preencha as informações da vaga para os estudantes do IF encontrarem."
        voltar={{ para: "/painel", rotulo: "Painel da empresa" }}
      >
        <div className="mt-6 inline-flex items-center gap-3 rounded-[4px] bg-painel-2 px-4 py-3">
          <Building2 className="size-5" />
          <div className="min-w-0">
            <p className="text-sm text-white/80">Publicando como</p>
            <p className="truncate font-bold">{empresa.nome} <span className="font-normal text-white/80">· {empresa.email}</span></p>
          </div>
        </div>
      </PlacaTitulo>

      <div className="mt-4 flex items-start gap-6">
        <div className="min-w-0 flex-1">
          <form onSubmit={enviar} noValidate className="space-y-4">
            {avisoErro && <p role="alert" className="aviso aviso--erro">{avisoErro}</p>}

            <Secao titulo="Detalhes da vaga">
              <Campo className={TODO} nome="titulo" rotulo="Título da vaga" placeholder="Ex: Estágio em Desenvolvimento Web" maxLength={100} {...ligar("titulo")} />
              <Campo className={MEIO} nome="tipo" rotulo="Tipo de vaga" como="select" lista={TIPOS} {...ligar("tipo")} />
              <Campo className={MEIO} nome="area" rotulo="Área de atuação" como="select" lista={AREAS} {...ligar("area")} />
              <Campo className={MEIO} nome="localizacao" rotulo="Cidade / Estado" placeholder="São Paulo - SP" maxLength={100} {...ligar("localizacao")} />
              <Campo className={MEIO} nome="modalidade" rotulo="Modalidade" como="select" lista={MODALIDADES} {...ligar("modalidade")} />
              <Campo className={TERCO} nome="horario_entrada" rotulo="Horário de entrada" type="time" {...ligar("horario_entrada")} />
              <Campo className={TERCO} nome="horario_saida" rotulo="Horário de saída" type="time" {...ligar("horario_saida")} />
              <Campo className={TERCO} nome="carga_horaria" rotulo="Carga horária semanal" placeholder="Ex: 20h/semana" {...ligar("carga_horaria")} />
              <Campo className={MEIO} nome="remuneracao" rotulo="Remuneração mensal (R$)" placeholder="Ex: 1.200,00" inputMode="numeric" {...ligar("remuneracao", mascaraMoeda)} />
              <Campo className={MEIO} nome="beneficios" rotulo="Benefícios" placeholder="Ex: Vale-transporte, vale-refeição" {...ligar("beneficios")} />
            </Secao>

            <Secao titulo="Descrição e requisitos">
              <Campo className={TODO} como="textarea" nome="descricao" rotulo="Descrição da vaga" maxLength={1500} placeholder="Descreva as responsabilidades, o dia a dia e o que o candidato irá aprender..." {...ligar("descricao")} />
              <Campo className={TODO} como="textarea" nome="requisitos" rotulo="Requisitos (um por linha)" maxLength={1000} placeholder="Liste os requisitos desejados, um por linha: curso, semestre mínimo, habilidades técnicas..." {...ligar("requisitos")} />
              <Campo className={TODO} como="textarea" rows={3} nome="diferenciais" rotulo="Diferenciais (opcional, um por linha)" maxLength={800} placeholder="Conhecimentos ou experiências que serão um diferencial..." {...ligar("diferenciais")} />
            </Secao>

            <Secao titulo="Prazo">
              <Campo className={MEIO} nome="prazo_inscricao" rotulo="Data limite para candidatura" type="date" min={new Date().toISOString().slice(0, 10)} {...ligar("prazo_inscricao")} />
              <Campo className={MEIO} nome="numero_vagas" rotulo="Número de vagas" type="number" min="1" inputMode="numeric" {...ligar("numero_vagas")} />
            </Secao>

            <div className="cartao p-5 sm:p-7">
              <label className="flex items-start gap-3 text-[15px]" htmlFor="aceite_termos">
                <input
                  id="aceite_termos" type="checkbox" className="caixa"
                  checked={form.aceite_termos} onChange={(ev) => alterar("aceite_termos", ev.target.checked)}
                  aria-invalid={erros.aceite_termos ? "true" : undefined}
                />
                <span>
                  Confirmo que as informações fornecidas são verdadeiras e que esta empresa está legalmente
                  habilitada a contratar estagiários e aprendizes, conforme a legislação brasileira
                  (Lei 11.788/2008 e CLT art. 428).
                </span>
              </label>
              {erros.aceite_termos && <p className="erro-campo">{erros.aceite_termos}</p>}

              <button type="submit" disabled={enviando} className="botao botao--largo mt-6 min-h-14 text-lg">
                {enviando ? "Publicando..." : <>Publicar vaga <ArrowRight className="seta size-5" /></>}
              </button>
            </div>
          </form>
        </div>

        <aside aria-label="Prévia da vaga" className="sticky top-24 hidden w-80 shrink-0 xl:block">
          <p className="mb-3 text-[15px] font-bold">Prévia na lista de vagas</p>
          <div className="pointer-events-none select-none" aria-hidden="true">
            <CartaoVaga vaga={previa} />
          </div>
          <p className="mt-3 text-sm text-tinta-fraca">Atualiza enquanto você preenche o formulário.</p>
        </aside>
      </div>
    </main>
  );
}