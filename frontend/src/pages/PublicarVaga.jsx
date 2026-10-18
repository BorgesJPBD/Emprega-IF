import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Briefcase, Building2, CheckCircle2, Lock } from "lucide-react";

import { ErroApi, post } from "../api";
import { lerSessao } from "../auth";
import CartaoVaga from "../componentes/CartaoVaga";
import { mascaraMoeda, valorEmNumero } from "../utils/formulario";

/* mesmas listas do backend (app/schemas.py) */
const TIPOS = ["Estágio", "Jovem aprendiz"];
const AREAS = ["Tecnologia", "Administrativo", "Marketing", "Design", "Vendas", "Recursos Humanos", "Engenharia", "Logística", "Outra"];
const MODALIDADES = ["Presencial", "Híbrido", "Remoto"];

/* os nomes dos campos são os mesmos da API (POST /vagas), para os erros
   que voltam do backend caírem embaixo do input certo */
const INICIAL = {
  titulo: "", tipo: "", area: "", localizacao: "", modalidade: "",
  horario_entrada: "", horario_saida: "", carga_horaria: "", remuneracao: "", beneficios: "",
  descricao: "", requisitos: "", diferenciais: "",
  prazo_inscricao: "", numero_vagas: "1", aceite_termos: false,
};

/* ordem em que os campos aparecem: o primeiro com erro recebe o foco */
const ORDEM = ["titulo", "tipo", "area", "localizacao", "modalidade", "horario_entrada", "horario_saida", "carga_horaria", "remuneracao", "beneficios", "descricao", "requisitos", "diferenciais", "prazo_inscricao", "numero_vagas", "aceite_termos"];

const ESTILO = `
@keyframes entra{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
.anima-entra{animation:entra .6s cubic-bezier(.2,.7,.2,1) both}
@media (prefers-reduced-motion:reduce){.anima-entra{animation:none}}
`;

const MEIO = "col-span-6 sm:col-span-3";
const TERCO = "col-span-6 sm:col-span-2";
const TODO = "col-span-6";

const BASE =
  "w-full rounded-xl border bg-neutral-50 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 " +
  "focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10";

/** Rótulo + controle (input, select ou textarea) + erro. */
function Campo({ nome, rotulo, erro, como = "input", lista = [], className = "", ...props }) {
  const comum = {
    id: nome,
    name: nome,
    "aria-invalid": erro ? "true" : undefined,
    "aria-describedby": erro ? `${nome}-erro` : undefined,
    className: `${BASE} ${erro ? "border-red-400" : "border-neutral-200 focus:border-neutral-400"}`,
    ...props,
  };

  return (
    <div className={className}>
      <label htmlFor={nome} className="mb-1.5 block text-xs font-medium text-neutral-600">{rotulo}</label>

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

      <div className="mt-1 flex justify-between gap-3 text-xs">
        <span id={`${nome}-erro`} className="text-red-600">{erro}</span>
        {como === "textarea" && props.maxLength && (
          <span className="ml-auto text-neutral-400">{props.value.length}/{props.maxLength}</span>
        )}
      </div>
    </div>
  );
}

function Secao({ titulo, children }) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-7">
      <h2 className="text-sm font-semibold text-neutral-900">{titulo}</h2>
      <div className="mt-5 grid grid-cols-6 gap-x-5">{children}</div>
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

/** Grava na tabela `vagas`. A empresa vem do token de login, não do formulário. */
const publicarVaga = (dados) => post("/vagas", dados);

/** Campo opcional vazio vai como null, não como "" (o banco espera nulo). */
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

/** Quem não está logado como empresa vê este aviso no lugar do formulário. */
function SomenteEmpresa({ papel }) {
  const { pathname } = useLocation();
  return (
    <main className="mx-auto max-w-xl px-5 py-20 text-center">
      <style>{ESTILO}</style>
      <div className="anima-entra rounded-2xl border border-neutral-200 bg-white p-8">
        <Lock className="mx-auto size-9 text-neutral-400" />
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-neutral-900">Publicar vaga</h1>
        <p className="mt-2 text-sm text-neutral-500">
          {papel === "estudante"
            ? "Você está conectado com uma conta de estudante. Para publicar vagas, entre com a conta da empresa."
            : "Para publicar uma vaga, entre com a conta da sua empresa."}
        </p>
        <Link to="/login" state={{ de: pathname }} className="mt-6 block w-full rounded-xl bg-neutral-900 py-3.5 text-sm font-medium text-white transition hover:bg-black">
          Entrar como empresa
        </Link>
        <p className="mt-4 text-sm text-neutral-500">
          Ainda não tem conta? <Link className="font-medium text-neutral-900" to="/cadastro/empresa">Criar conta empresarial</Link>
        </p>
      </div>
    </main>
  );
}

export default function PublicarVaga() {
  const sessao = lerSessao();
  const empresa = sessao?.usuario?.papel === "empresa" ? sessao.usuario : null;

  const [form, setForm] = useState(INICIAL);
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
      <main className="mx-auto max-w-3xl px-5 py-14">
        <style>{ESTILO}</style>
        <div className="anima-entra rounded-2xl border border-neutral-200 bg-white p-8 text-center">
          <CheckCircle2 className="mx-auto size-10 text-emerald-600" />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-neutral-900">Vaga publicada</h1>
          <p className="mt-2 text-sm text-neutral-500">
            “{publicada.titulo}” já aparece para os estudantes do IF.
          </p>
          <Link to={`/vagas/${publicada.id}`} className="mt-6 block w-full rounded-xl bg-neutral-900 py-3.5 text-sm font-medium text-white transition hover:bg-black">
            Ver a vaga publicada
          </Link>
          <button type="button" onClick={() => setPublicada(null)} className="mt-4 text-sm text-neutral-500 hover:text-neutral-900">
            Publicar outra vaga
          </button>
        </div>
      </main>
    );
  }

  /* prévia: o mesmo cartão que aparece em /vagas, atualizado enquanto a pessoa digita */
  const hora = (h) => h.replace(/^0/, "");
  const previa = {
    id: 0,
    Icone: Briefcase,
    titulo: form.titulo || "Título da vaga",
    empresa: empresa.nome,
    tipo: form.tipo || "Tipo",
    local: form.localizacao || "Cidade - UF",
    horario: form.horario_entrada && form.horario_saida
      ? `${hora(form.horario_entrada)} às ${hora(form.horario_saida)}`
      : "Horário a definir",
    valor: form.remuneracao ? valorEmNumero(form.remuneracao) : 0,
  };

  return (
    <main className="px-5 py-10">
      <style>{ESTILO}</style>
      <div className="mx-auto flex max-w-[1120px] items-start justify-center gap-8">
        <div className="w-full max-w-3xl">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-neutral-500 transition hover:text-neutral-900">
            <ArrowLeft className="size-4" /> Voltar
          </Link>

          <span className="mt-8 inline-block rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-600">
            Para empresas
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-neutral-900">Publicar vaga</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Preencha as informações da vaga para conectar sua empresa aos melhores talentos do IF.
          </p>

          <form onSubmit={enviar} noValidate className="mt-8 space-y-6">
            {avisoErro && (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{avisoErro}</p>
            )}

            <div className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-neutral-100 text-neutral-600">
                <Building2 className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs text-neutral-500">Publicando como</p>
                <p className="truncate text-sm font-medium text-neutral-900">{empresa.nome}</p>
                <p className="truncate text-xs text-neutral-400">{empresa.email}</p>
              </div>
            </div>

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

            <div>
              <label className="flex items-start gap-3 text-sm text-neutral-600" htmlFor="aceite_termos">
                <input
                  id="aceite_termos" type="checkbox" className="mt-0.5 size-4 accent-neutral-900"
                  checked={form.aceite_termos} onChange={(ev) => alterar("aceite_termos", ev.target.checked)}
                  aria-invalid={erros.aceite_termos ? "true" : undefined}
                />
                <span>
                  Confirmo que as informações fornecidas são verdadeiras e que esta empresa está legalmente
                  habilitada a contratar estagiários e aprendizes, conforme a legislação brasileira
                  (Lei 11.788/2008 e CLT art. 428).
                </span>
              </label>
              {erros.aceite_termos && <p className="mt-1.5 text-xs text-red-600">{erros.aceite_termos}</p>}
            </div>

            <button
              type="submit" disabled={enviando}
              className="w-full rounded-xl bg-neutral-900 py-3.5 text-sm font-medium text-white transition hover:bg-black disabled:cursor-progress disabled:opacity-60"
            >
              {enviando ? "Publicando..." : "Publicar vaga"}
            </button>

          </form>
        </div>

        <aside aria-label="Prévia da vaga" className="sticky top-28 hidden w-80 shrink-0 xl:block">
          <p className="mb-3 text-xs font-medium text-neutral-600">Prévia no mural de vagas</p>
          <div className="pointer-events-none select-none" aria-hidden="true">
            <CartaoVaga vaga={previa} />
          </div>
          <p className="mt-3 text-xs text-neutral-400">Atualiza enquanto você preenche o formulário.</p>
        </aside>
      </div>
    </main>
  );
}