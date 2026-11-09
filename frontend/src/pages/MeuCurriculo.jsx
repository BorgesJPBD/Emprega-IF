import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Lock } from "lucide-react";

import { ErroApi, del, get, put } from "../api";
import { lerSessao } from "../auth";
import Campo from "../componentes/Campo";
import Confirmacao from "../componentes/Confirmacao";
import CurriculoVisual from "../componentes/CurriculoVisual";
import PlacaTitulo from "../componentes/PlacaTitulo";

const NIVEIS = ["Básico", "Intermediário", "Avançado", "Fluente"];

const MODELOS = {
  formacao: { instituicao: "", curso: "", periodo: "" },
  experiencias: { titulo: "", organizacao: "", periodo: "", descricao: "" },
  cursos: { nome: "", instituicao: "", ano: "" },
  idiomas: { idioma: "", nivel: "" },
};

const LIMITES = { formacao: 5, experiencias: 6, cursos: 8, idiomas: 5 };

const paraForm = (d = {}) => ({
  cidade: d.cidade ?? "",
  objetivo: d.objetivo ?? "",
  formacao: d.formacao ?? [],
  experiencias: d.experiencias ?? [],
  cursos: d.cursos ?? [],
  idiomas: d.idiomas ?? [],
  habilidades: (d.habilidades ?? []).join(", "),
});

// Quem ainda não tem currículo começa com a formação do cadastro já preenchida.
const formInicial = (perfil) => ({
  ...paraForm(),
  formacao: [{
    instituicao: perfil.instituicao,
    curso: perfil.curso,
    periodo: `${perfil.periodo}º período (cursando)`,
  }],
});

function habilidadesDe(texto) {
  const vistos = new Set();
  const lista = [];
  for (const h of texto.split(/[,\n;]/).map((s) => s.trim()).filter(Boolean)) {
    if (!vistos.has(h.toLowerCase())) {
      vistos.add(h.toLowerCase());
      lista.push(h);
    }
  }
  return lista;
}

const vazia = (item) => Object.values(item).every((v) => !String(v).trim());

// Linhas em branco são descartadas antes de enviar e de mostrar a prévia.
function montarPayload(form) {
  const limpar = (lista) => lista.filter((i) => !vazia(i));
  return {
    cidade: form.cidade.trim(),
    objetivo: form.objetivo.trim(),
    formacao: limpar(form.formacao),
    experiencias: limpar(form.experiencias),
    cursos: limpar(form.cursos),
    idiomas: limpar(form.idiomas),
    habilidades: habilidadesDe(form.habilidades),
  };
}

function validar(form) {
  const e = {};
  const checar = (chave, campos) =>
    form[chave].forEach((item, i) => {
      if (vazia(item)) return;
      campos.forEach((c) => {
        if (item[c].trim().length < 2) {
          e[`${chave}-${i}-${c}`] = c === "nivel" ? "Escolha o nível." : "Preencha este campo.";
        }
      });
    });
  checar("formacao", ["instituicao", "curso"]);
  checar("experiencias", ["titulo"]);
  checar("cursos", ["nome"]);
  checar("idiomas", ["idioma"]);
  form.idiomas.forEach((item, i) => {
    if (!vazia(item) && !item.nivel) e[`idiomas-${i}-nivel`] = "Escolha o nível.";
  });

  const habilidades = habilidadesDe(form.habilidades);
  if (habilidades.length > 15) e.habilidades = "Use no máximo 15 habilidades.";
  else if (habilidades.some((h) => h.length > 40)) e.habilidades = "Cada habilidade pode ter até 40 caracteres.";

  const p = montarPayload(form);
  if (!(p.objetivo || p.formacao.length || p.experiencias.length || p.cursos.length || p.habilidades.length || p.idiomas.length)) {
    e.geral = "Preencha ao menos uma seção do currículo.";
  }
  return e;
}

function Bloco({ titulo, dica, itens, limite, rotuloAdicionar, aoAdicionar, aoRemover, children }) {
  return (
    <section className="cartao p-5 sm:p-7">
      <h2 className="text-2xl">{titulo}</h2>
      {dica && <p className="mt-1 text-[15px] leading-relaxed text-tinta-media">{dica}</p>}

      <div className="mt-5 space-y-4">
        {itens.map((item, i) => (
          <div key={i} className="rounded-[4px] border border-linha p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children(item, i)}</div>
            <button type="button" onClick={() => aoRemover(i)} className="link mt-3 text-[15px]">
              Remover
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={aoAdicionar}
        disabled={itens.length >= limite}
        className="botao botao--contorno botao--compacto mt-5"
      >
        + {rotuloAdicionar}
      </button>
      {itens.length >= limite && <p className="mt-2 text-sm text-tinta-fraca">Limite de {limite} itens.</p>}
    </section>
  );
}

export default function MeuCurriculo() {
  const { pathname } = useLocation();
  const sessao = lerSessao();
  const estudante = sessao?.usuario?.papel === "estudante" ? sessao.usuario : null;

  const [perfil, setPerfil] = useState(null);
  const [existe, setExiste] = useState(false);
  const [form, setForm] = useState(null);
  const [erros, setErros] = useState({});
  const [avisoErro, setAvisoErro] = useState("");
  const [salvo, setSalvo] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [apagando, setApagando] = useState(false);

  useEffect(() => {
    if (!estudante) return;
    Promise.all([get("/estudantes/me"), get("/estudantes/me/curriculo")])
      .then(([p, c]) => {
        setPerfil(p);
        setExiste(Boolean(c));
        setForm(c ? paraForm(c.dados) : formInicial(p));
      })
      .catch((e) => setAvisoErro(e.message));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const editou = () => setSalvo(false);

  const alterar = (campo, valor) => {
    setForm((a) => ({ ...a, [campo]: valor }));
    setErros(({ [campo]: _, geral: __, ...resto }) => resto);
    editou();
  };
  const alterarItem = (chave, i, campo, valor) => {
    setForm((a) => ({
      ...a,
      [chave]: a[chave].map((item, j) => (j === i ? { ...item, [campo]: valor } : item)),
    }));
    setErros(({ [`${chave}-${i}-${campo}`]: _, geral: __, ...resto }) => resto);
    editou();
  };
  const adicionar = (chave) => {
    setForm((a) => ({ ...a, [chave]: [...a[chave], { ...MODELOS[chave] }] }));
    editou();
  };
  const remover = (chave, i) => {
    setForm((a) => ({ ...a, [chave]: a[chave].filter((_, j) => j !== i) }));
    setErros({});
    editou();
  };

  // Campo de texto de um item de lista
  const item = (chave, i, campo, rotulo, props = {}) => {
    const nome = `${chave}-${i}-${campo}`;
    return (
      <Campo
        key={nome}
        nome={nome}
        rotulo={rotulo}
        value={form[chave][i][campo]}
        erro={erros[nome]}
        onChange={(e) => alterarItem(chave, i, campo, e.target.value)}
        {...props}
      />
    );
  };

  async function salvar(evento) {
    evento.preventDefault();
    setAvisoErro("");
    setSalvo(false);

    const encontrados = validar(form);
    setErros(encontrados);
    if (Object.keys(encontrados).length) {
      setAvisoErro(encontrados.geral || "Revise os campos destacados.");
      return;
    }

    setEnviando(true);
    try {
      const resposta = await put("/estudantes/me/curriculo", montarPayload(form));
      setForm(paraForm(resposta.dados));
      setExiste(true);
      setSalvo(true);
    } catch (erro) {
      if (erro instanceof ErroApi) setAvisoErro(erro.campos?.body || erro.message);
      else setAvisoErro("Erro inesperado. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  async function apagar() {
    setApagando(true);
    try {
      await del("/estudantes/me/curriculo");
      setExiste(false);
      setForm(formInicial(perfil));
      setSalvo(false);
      setErros({});
      setAvisoErro("");
    } catch (e) {
      setAvisoErro(e.message);
    } finally {
      setApagando(false);
      setConfirmando(false);
    }
  }

  if (!estudante) {
    return (
      <main className="container-site py-16 sm:py-24">
        <div className="cartao mx-auto max-w-xl px-6 py-10 sm:px-10">
          <span className="picto"><Lock className="size-5" /></span>
          <h1 className="mt-5 text-3xl">Meu currículo</h1>
          <p className="mt-2 text-[17px] text-tinta-media">Entre com a sua conta de estudante para montar o seu currículo.</p>
          <Link to="/login" state={{ de: pathname }} className="botao botao--largo mt-7">
            Entrar <ArrowRight className="seta size-5" />
          </Link>
        </div>
      </main>
    );
  }

  const previa = form ? montarPayload(form) : {};
  const contato = perfil
    ? {
        nome: perfil.nome,
        email_if: perfil.email_if,
        telefone: perfil.telefone,
        linkedin_url: perfil.linkedin_url,
        instagram_usuario: perfil.instagram_usuario,
      }
    : null;

  return (
    <main className="container-site pb-20 pt-6 sm:pt-10">
      <div className="nao-imprimir">
        <PlacaTitulo
          titulo="Meu currículo"
          resumo="Preencha uma vez, no modelo da plataforma. É opcional: as empresas das vagas em que você se candidatar poderão ver."
          voltar={{ para: "/meu-perfil", rotulo: "Meu perfil" }}
        />
      </div>

      {!form && !avisoErro && <p className="mt-8 text-[17px] font-bold">Carregando...</p>}
      {!form && avisoErro && <p role="alert" className="aviso aviso--erro mt-6">{avisoErro}</p>}

      {form && contato && (
        <div className="curriculo-layout mt-4 grid gap-4 xl:grid-cols-2 xl:items-start">
          <form onSubmit={salvar} noValidate className="nao-imprimir space-y-4">
            <p className="aviso aviso--info font-normal">
              Seu nome, e-mail, telefone, LinkedIn e Instagram vêm do seu perfil. Não coloque CPF, RG, endereço
              completo nem foto: as empresas não precisam disso.
            </p>

            {avisoErro && <p role="alert" className="aviso aviso--erro">{avisoErro}</p>}
            {salvo && <p role="status" className="aviso aviso--ok">Currículo salvo.</p>}

            <section className="cartao space-y-5 p-5 sm:p-7">
              <h2 className="text-2xl">Sobre você</h2>
              <Campo
                nome="cidade"
                rotulo="Cidade e estado"
                placeholder="Três Lagoas - MS"
                maxLength={80}
                value={form.cidade}
                erro={erros.cidade}
                onChange={(e) => alterar("cidade", e.target.value)}
              />
              <div>
                <Campo nome="objetivo" rotulo="Objetivo" erro={erros.objetivo}>
                  <textarea
                    id="objetivo"
                    name="objetivo"
                    rows={3}
                    maxLength={300}
                    className="entrada"
                    placeholder="Ex: Conseguir um estágio em desenvolvimento de software para aplicar o que aprendi no curso e continuar aprendendo."
                    value={form.objetivo}
                    onChange={(e) => alterar("objetivo", e.target.value)}
                  />
                </Campo>
                <p className="mt-1 text-sm tabular-nums text-tinta-fraca">{form.objetivo.length}/300</p>
              </div>
            </section>

            <Bloco
              titulo="Formação"
              dica="Já preenchemos com o seu curso. Pode editar ou acrescentar, por exemplo o ensino médio."
              itens={form.formacao}
              limite={LIMITES.formacao}
              rotuloAdicionar="Adicionar formação"
              aoAdicionar={() => adicionar("formacao")}
              aoRemover={(i) => remover("formacao", i)}
            >
              {(_, i) => (
                <>
                  {item("formacao", i, "curso", "Curso", { placeholder: "Análise e Desenvolvimento de Sistemas", maxLength: 100 })}
                  {item("formacao", i, "instituicao", "Instituição", { placeholder: "IFMS", maxLength: 100 })}
                  {item("formacao", i, "periodo", "Período", { placeholder: "2024 - 2027 ou 8º período (cursando)", maxLength: 40 })}
                </>
              )}
            </Bloco>

            <Bloco
              titulo="Experiências e projetos"
              dica="Ainda não trabalhou? Tudo bem. Coloque projetos do curso, atividades de extensão, voluntariado ou trabalhos em grupo."
              itens={form.experiencias}
              limite={LIMITES.experiencias}
              rotuloAdicionar="Adicionar experiência ou projeto"
              aoAdicionar={() => adicionar("experiencias")}
              aoRemover={(i) => remover("experiencias", i)}
            >
              {(_, i) => (
                <>
                  {item("experiencias", i, "titulo", "Cargo ou nome do projeto", { placeholder: "Sistema de biblioteca em Flask", maxLength: 100 })}
                  {item("experiencias", i, "organizacao", "Empresa ou onde foi", { placeholder: "IFMS", maxLength: 100 })}
                  {item("experiencias", i, "periodo", "Período", { placeholder: "2025", maxLength: 40 })}
                  <Campo nome={`experiencias-${i}-descricao`} rotulo="O que você fez" inteiro>
                    <textarea
                      id={`experiencias-${i}-descricao`}
                      rows={3}
                      maxLength={300}
                      className="entrada"
                      placeholder="Em uma ou duas frases, o que você fez e aprendeu."
                      value={form.experiencias[i].descricao}
                      onChange={(e) => alterarItem("experiencias", i, "descricao", e.target.value)}
                    />
                  </Campo>
                </>
              )}
            </Bloco>

            <Bloco
              titulo="Cursos e certificados"
              itens={form.cursos}
              limite={LIMITES.cursos}
              rotuloAdicionar="Adicionar curso"
              aoAdicionar={() => adicionar("cursos")}
              aoRemover={(i) => remover("cursos", i)}
            >
              {(_, i) => (
                <>
                  {item("cursos", i, "nome", "Curso ou certificado", { placeholder: "Python para iniciantes", maxLength: 100 })}
                  {item("cursos", i, "instituicao", "Instituição", { placeholder: "Alura", maxLength: 100 })}
                  {item("cursos", i, "ano", "Ano", { placeholder: "2025", maxLength: 20 })}
                </>
              )}
            </Bloco>

            <section className="cartao space-y-5 p-5 sm:p-7">
              <h2 className="text-2xl">Habilidades</h2>
              <Campo
                nome="habilidades"
                rotulo="Separe por vírgula (até 15)"
                placeholder="Python, JavaScript, Git, trabalho em equipe"
                value={form.habilidades}
                erro={erros.habilidades}
                onChange={(e) => alterar("habilidades", e.target.value)}
              />
            </section>

            <Bloco
              titulo="Idiomas"
              itens={form.idiomas}
              limite={LIMITES.idiomas}
              rotuloAdicionar="Adicionar idioma"
              aoAdicionar={() => adicionar("idiomas")}
              aoRemover={(i) => remover("idiomas", i)}
            >
              {(_, i) => (
                <>
                  {item("idiomas", i, "idioma", "Idioma", { placeholder: "Inglês", maxLength: 30 })}
                  <Campo nome={`idiomas-${i}-nivel`} rotulo="Nível" erro={erros[`idiomas-${i}-nivel`]}>
                    <select
                      id={`idiomas-${i}-nivel`}
                      className="entrada"
                      aria-invalid={erros[`idiomas-${i}-nivel`] ? "true" : undefined}
                      value={form.idiomas[i].nivel}
                      onChange={(e) => alterarItem("idiomas", i, "nivel", e.target.value)}
                    >
                      <option value="">Selecione</option>
                      {NIVEIS.map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </Campo>
                </>
              )}
            </Bloco>

            <div className="cartao p-5 sm:p-7">
              <button type="submit" disabled={enviando} className="botao botao--largo min-h-14 text-lg">
                {enviando ? "Salvando..." : existe ? "Salvar alterações" : "Salvar currículo"}
              </button>
              {existe && (
                <button
                  type="button"
                  onClick={() => setConfirmando(true)}
                  className="botao botao--perigo botao--largo mt-3"
                >
                  Apagar meu currículo
                </button>
              )}
            </div>
          </form>

          <aside aria-label="Prévia do currículo">
            <div className="nao-imprimir mb-3 flex items-center justify-between gap-3">
              <p className="text-[15px] font-bold">Prévia</p>
              <button type="button" onClick={() => window.print()} className="botao botao--contorno botao--compacto">
                Baixar PDF
              </button>
            </div>
            <CurriculoVisual dados={previa} contato={contato} />
            <p className="nao-imprimir mt-3 text-sm text-tinta-fraca">
              Em "Baixar PDF", escolha "Salvar como PDF" na janela de impressão. O arquivo é gerado no seu
              navegador e não fica guardado na plataforma.
            </p>
          </aside>
        </div>
      )}

      <Confirmacao
        aberto={confirmando}
        titulo="Apagar o currículo?"
        texto="Seu currículo será apagado e as empresas deixam de vê-lo. Você pode criar outro quando quiser."
        confirmar="Sim, apagar"
        cancelar="Voltar"
        perigo
        ocupado={apagando}
        aoConfirmar={apagar}
        aoCancelar={() => setConfirmando(false)}
      />
    </main>
  );
}