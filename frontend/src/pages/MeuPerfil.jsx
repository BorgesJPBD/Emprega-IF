import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Lock } from "lucide-react";

import { ErroApi, get, patch } from "../api";
import { lerSessao } from "../auth";
import Campo from "../componentes/Campo";
import PlacaTitulo from "../componentes/PlacaTitulo";

const VAZIO = { linkedin_url: "", instagram_usuario: "" };

// O que a API guarda -> o que aparece nos campos (o Instagram com @).
const paraForm = (p) => ({
  linkedin_url: p.linkedin_url ?? "",
  instagram_usuario: p.instagram_usuario ? `@${p.instagram_usuario}` : "",
});

function Dado({ rotulo, valor }) {
  return (
    <div className="py-3">
      <dt className="text-[15px] text-tinta-media">{rotulo}</dt>
      <dd className="mt-0.5 text-[17px] font-semibold break-words">{valor || "—"}</dd>
    </div>
  );
}

export default function MeuPerfil() {
  const { pathname } = useLocation();
  const sessao = lerSessao();
  const estudante = sessao?.usuario?.papel === "estudante" ? sessao.usuario : null;

  const [perfil, setPerfil] = useState(null);
  const [form, setForm] = useState(VAZIO);
  const [erros, setErros] = useState({});
  const [avisoErro, setAvisoErro] = useState("");
  const [salvo, setSalvo] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!estudante) return;
    get("/estudantes/me")
      .then((p) => {
        setPerfil(p);
        setForm(paraForm(p));
      })
      .catch((e) => setAvisoErro(e.message));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function alterar(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    setErros(({ [campo]: _, ...resto }) => resto);
    setSalvo(false);
  }

  async function salvar(evento) {
    evento.preventDefault();
    setEnviando(true);
    setErros({});
    setAvisoErro("");
    setSalvo(false);
    try {
      const atualizado = await patch("/estudantes/me", form);
      setPerfil(atualizado);
      setForm(paraForm(atualizado)); // já padronizado pela API
      setSalvo(true);
    } catch (erro) {
      if (erro instanceof ErroApi) {
        setErros(erro.campos);
        setAvisoErro(erro.message);
      } else {
        setAvisoErro("Erro inesperado. Tente novamente.");
      }
    } finally {
      setEnviando(false);
    }
  }

  if (!estudante) {
    return (
      <main className="container-site py-16 sm:py-24">
        <div className="cartao mx-auto max-w-xl px-6 py-10 sm:px-10">
          <span className="picto"><Lock className="size-5" /></span>
          <h1 className="mt-5 text-3xl">Meu perfil</h1>
          <p className="mt-2 text-[17px] text-tinta-media">Entre com a sua conta de estudante para ver e editar o seu perfil.</p>
          <Link to="/login" state={{ de: pathname }} className="botao botao--largo mt-7">
            Entrar <ArrowRight className="seta size-5" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container-site pb-20 pt-6 sm:pt-10">
      <PlacaTitulo
        titulo="Meu perfil"
        resumo="Seus dados e as redes que as empresas poderão ver ao analisar a sua candidatura."
      />

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.2fr] lg:items-start">
        <section className="cartao p-5 sm:p-7">
          <h2 className="text-2xl">Dados do cadastro</h2>
          {perfil ? (
            <dl className="mt-3 divide-y divide-linha">
              <Dado rotulo="Nome" valor={perfil.nome} />
              <Dado rotulo="E-mail" valor={perfil.email_if} />
              <Dado rotulo="Instituição" valor={perfil.instituicao} />
              <Dado rotulo="Curso" valor={`${perfil.curso} · ${perfil.periodo}º período`} />
            </dl>
          ) : (
            !avisoErro && <p className="mt-4 text-[17px] font-bold">Carregando...</p>
          )}
        </section>

        <form onSubmit={salvar} noValidate className="cartao p-5 sm:p-7">
          <h2 className="text-2xl">Redes sociais</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-tinta-media">
            Opcional. Quando você se candidata a uma vaga, a empresa vê estes links para conhecer melhor o
            seu perfil. Deixe em branco o que não quiser mostrar.
          </p>

          {avisoErro && <p role="alert" className="aviso aviso--erro mt-5">{avisoErro}</p>}
          {salvo && <p role="status" className="aviso aviso--ok mt-5">Perfil atualizado.</p>}

          <div className="mt-5 space-y-5">
            <Campo
              nome="linkedin_url"
              rotulo="LinkedIn"
              placeholder="linkedin.com/in/seu-nome"
              inputMode="url"
              autoComplete="off"
              maxLength={200}
              value={form.linkedin_url}
              erro={erros.linkedin_url}
              onChange={(e) => alterar("linkedin_url", e.target.value)}
            />
            <Campo
              nome="instagram_usuario"
              rotulo="Instagram"
              placeholder="@seu.usuario"
              autoComplete="off"
              autoCapitalize="none"
              maxLength={200}
              value={form.instagram_usuario}
              erro={erros.instagram_usuario}
              onChange={(e) => alterar("instagram_usuario", e.target.value)}
            />
          </div>

          <button type="submit" disabled={enviando || !perfil} className="botao botao--largo mt-6 min-h-14 text-lg">
            {enviando ? "Salvando..." : "Salvar perfil"}
          </button>
        </form>
      </div>

      <section className="cartao mt-4 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-7">
        <div className="flex-1">
          <h2 className="text-2xl">Meu currículo</h2>
          <p className="mt-2 max-w-[60ch] text-[15px] leading-relaxed text-tinta-media">
            Opcional. Monte um currículo no modelo da plataforma, rapidinho: as empresas das vagas em que
            você se candidatar poderão ver. Você pode editar ou apagar quando quiser.
          </p>
        </div>
        <Link to="/meu-curriculo" className="botao">
          Criar ou editar currículo <ArrowRight className="seta size-5" />
        </Link>
      </section>
    </main>
  );
}