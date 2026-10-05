import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Briefcase, CheckCircle2 } from "lucide-react";

import { ErroApi } from "../api";
import CartaoVaga from "../componentes/CartaoVaga";
import {
  apenasDigitos, cnpjValido, mascaraCnpj, mascaraMoeda, mascaraTelefone, valorEmNumero,
} from "../utils/formulario";

const SETORES = ["Tecnologia da Informação", "Educação", "Saúde", "Indústria", "Comércio", "Serviços", "Agronegócio", "Financeiro", "Logística", "Construção Civil", "Outro"];
const TIPOS = ["Estágio", "Jovem aprendiz"];
const AREAS = ["Tecnologia", "Administrativo", "Marketing", "Design", "Vendas", "Recursos Humanos", "Engenharia", "Logística", "Outra"];
const MODALIDADES = ["Presencial", "Híbrido", "Remoto"];

const INICIAL = {
  razao_social: "", nome_fantasia: "", cnpj: "", setor: "", email_contato: "", telefone: "",
  titulo: "", tipo: "", area: "", cidade: "", modalidade: "",
  horario_entrada: "", horario_saida: "", carga_horaria: "", remuneracao: "", beneficios: "",
  descricao: "", requisitos: "", diferenciais: "",
  data_limite: "", numero_vagas: "1", aceite: false,
};

/* ordem em que os campos aparecem: o primeiro com erro recebe o foco */
const ORDEM = ["razao_social", "cnpj", "setor", "email_contato", "telefone", "titulo", "tipo", "area", "cidade", "modalidade", "horario_saida", "descricao", "requisitos", "data_limite", "numero_vagas", "aceite"];

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

  ["razao_social", "cnpj", "setor", "email_contato", "titulo", "tipo", "area", "cidade", "modalidade", "descricao", "requisitos", "data_limite"]
    .forEach((c) => { if (!f[c].trim()) e[c] = "Campo obrigatório."; });

  if (!e.cnpj && !cnpjValido(f.cnpj)) e.cnpj = "CNPJ inválido.";
  if (!e.email_contato && !/^\S+@\S+\.\S+$/.test(f.email_contato)) e.email_contato = "E-mail inválido.";
  if (f.telefone && ![10, 11].includes(apenasDigitos(f.telefone).length)) e.telefone = "Telefone deve ter DDD e 8 ou 9 dígitos.";
  if (f.horario_entrada && f.horario_saida && f.horario_saida <= f.horario_entrada) e.horario_saida = "A saída deve ser depois da entrada.";
  if (!e.descricao && f.descricao.trim().length < 30) e.descricao = "Descreva a vaga com pelo menos 30 caracteres.";
  if (!e.data_limite && f.data_limite < hoje) e.data_limite = "A data limite não pode estar no passado.";
  if (!Number.isInteger(Number(f.numero_vagas)) || Number(f.numero_vagas) < 1) e.numero_vagas = "Informe ao menos 1 vaga.";
  if (!f.aceite) e.aceite = "Confirme para publicar.";
  return e;
}

/** Hoje só simula o envio. Quando existir o endpoint, troque por:
 *   import { post } from "../api";   return post("/vagas", dados);
 *  (o schema.sql ainda não tem colunas para área, modalidade, horários etc.) */
async function publicarVaga(dados) {
  await new Promise((resolver) => setTimeout(resolver, 800));
  return dados;
}

function montarPayload(f) {
  return {
    ...f,
    cnpj: apenasDigitos(f.cnpj),
    telefone: apenasDigitos(f.telefone) || null,
    remuneracao: f.remuneracao ? valorEmNumero(f.remuneracao) : null,
    numero_vagas: Number(f.numero_vagas),
  };
}

export default function PublicarVaga() {
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
      await publicarVaga(montarPayload(form));
      setPublicada({ titulo: form.titulo });
      setForm(INICIAL);
    } catch (erro) {
      if (erro instanceof ErroApi) setErros(erro.campos);
      setAvisoErro(erro.message || "Não foi possível publicar a vaga. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

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
          <Link to="/vagas" className="mt-6 block w-full rounded-xl bg-neutral-900 py-3.5 text-sm font-medium text-white transition hover:bg-black">
            Ver vagas
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
    empresa: form.nome_fantasia || form.razao_social || "Sua empresa",
    tipo: form.tipo || "Tipo",
    local: form.cidade || "Cidade - UF",
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

            <Secao titulo="Dados da empresa">
              <Campo className={MEIO} nome="razao_social" rotulo="Razão social" placeholder="Empresa Ltda" {...ligar("razao_social")} />
              <Campo className={MEIO} nome="nome_fantasia" rotulo="Nome fantasia" placeholder="Empresa" {...ligar("nome_fantasia")} />
              <Campo className={MEIO} nome="cnpj" rotulo="CNPJ" placeholder="00.000.000/0000-00" inputMode="numeric" {...ligar("cnpj", mascaraCnpj)} />
              <Campo className={MEIO} nome="setor" rotulo="Setor de atuação" como="select" lista={SETORES} {...ligar("setor")} />
              <Campo className={MEIO} nome="email_contato" rotulo="E-mail de contato" type="email" placeholder="rh@empresa.com" {...ligar("email_contato")} />
              <Campo className={MEIO} nome="telefone" rotulo="Telefone" placeholder="(00) 00000-0000" inputMode="tel" {...ligar("telefone", mascaraTelefone)} />
            </Secao>

            <Secao titulo="Detalhes da vaga">
              <Campo className={TODO} nome="titulo" rotulo="Título da vaga" placeholder="Ex: Estágio em Desenvolvimento Web" maxLength={100} {...ligar("titulo")} />
              <Campo className={MEIO} nome="tipo" rotulo="Tipo de vaga" como="select" lista={TIPOS} {...ligar("tipo")} />
              <Campo className={MEIO} nome="area" rotulo="Área de atuação" como="select" lista={AREAS} {...ligar("area")} />
              <Campo className={MEIO} nome="cidade" rotulo="Cidade / Estado" placeholder="São Paulo - SP" {...ligar("cidade")} />
              <Campo className={MEIO} nome="modalidade" rotulo="Modalidade" como="select" lista={MODALIDADES} {...ligar("modalidade")} />
              <Campo className={TERCO} nome="horario_entrada" rotulo="Horário de entrada" type="time" {...ligar("horario_entrada")} />
              <Campo className={TERCO} nome="horario_saida" rotulo="Horário de saída" type="time" {...ligar("horario_saida")} />
              <Campo className={TERCO} nome="carga_horaria" rotulo="Carga horária semanal" placeholder="Ex: 20h/semana" {...ligar("carga_horaria")} />
              <Campo className={MEIO} nome="remuneracao" rotulo="Remuneração mensal (R$)" placeholder="Ex: 1.200,00" inputMode="numeric" {...ligar("remuneracao", mascaraMoeda)} />
              <Campo className={MEIO} nome="beneficios" rotulo="Benefícios" placeholder="Ex: Vale-transporte, vale-refeição" {...ligar("beneficios")} />
            </Secao>

            <Secao titulo="Descrição e requisitos">
              <Campo className={TODO} como="textarea" nome="descricao" rotulo="Descrição da vaga" maxLength={1500} placeholder="Descreva as responsabilidades, o dia a dia e o que o candidato irá aprender..." {...ligar("descricao")} />
              <Campo className={TODO} como="textarea" nome="requisitos" rotulo="Requisitos" maxLength={1000} placeholder="Liste os requisitos desejados: curso, semestre mínimo, habilidades técnicas..." {...ligar("requisitos")} />
              <Campo className={TODO} como="textarea" rows={3} nome="diferenciais" rotulo="Diferenciais (opcional)" maxLength={800} placeholder="Conhecimentos ou experiências que serão um diferencial..." {...ligar("diferenciais")} />
            </Secao>

            <Secao titulo="Prazo e contato">
              <Campo className={MEIO} nome="data_limite" rotulo="Data limite para candidatura" type="date" min={new Date().toISOString().slice(0, 10)} {...ligar("data_limite")} />
              <Campo className={MEIO} nome="numero_vagas" rotulo="Número de vagas" type="number" min="1" inputMode="numeric" {...ligar("numero_vagas")} />
            </Secao>

            <div>
              <label className="flex items-start gap-3 text-sm text-neutral-600" htmlFor="aceite">
                <input
                  id="aceite" type="checkbox" className="mt-0.5 size-4 accent-neutral-900"
                  checked={form.aceite} onChange={(ev) => alterar("aceite", ev.target.checked)}
                  aria-invalid={erros.aceite ? "true" : undefined}
                />
                <span>
                  Confirmo que as informações fornecidas são verdadeiras e que esta empresa está legalmente
                  habilitada a contratar estagiários e aprendizes, conforme a legislação brasileira
                  (Lei 11.788/2008 e CLT art. 428).
                </span>
              </label>
              {erros.aceite && <p className="mt-1.5 text-xs text-red-600">{erros.aceite}</p>}
            </div>

            <button
              type="submit" disabled={enviando}
              className="w-full rounded-xl bg-neutral-900 py-3.5 text-sm font-medium text-white transition hover:bg-black disabled:cursor-progress disabled:opacity-60"
            >
              {enviando ? "Publicando..." : "Publicar vaga"}
            </button>

            <p className="text-center text-sm text-neutral-500">
              Já tem uma conta? <Link className="font-medium text-neutral-900" to="/login">Entrar</Link>
              {" · "}
              <Link className="font-medium text-neutral-900" to="/cadastro/empresa">Criar conta empresarial</Link>
            </p>
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