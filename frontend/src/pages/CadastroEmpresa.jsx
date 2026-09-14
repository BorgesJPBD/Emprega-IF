import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ErroApi, post } from "../api";

const SETORES = [
  "Tecnologia da Informação",
  "Educação",
  "Saúde",
  "Indústria",
  "Comércio",
  "Serviços",
  "Agronegócio",
  "Financeiro",
  "Logística",
  "Construção Civil",
  "Outro",
];

const INICIAL = {
  razao_social: "",
  nome_fantasia: "",
  cnpj: "",
  setor: "",
  email_contato: "",
  telefone: "",
  endereco: "",
  senha: "",
  confirmar_senha: "",
  aceite_termos: false,
};

const CLASSE_ROTULO = "block text-sm text-neutral-600 mb-1.5";
const CLASSE_CONTROLE =
  "w-full rounded-xl border bg-neutral-50 px-4 py-3 text-sm text-neutral-900 " +
  "placeholder:text-neutral-400 focus:bg-white focus:outline-none " +
  "focus:ring-2 focus:ring-neutral-900/10";

function classeCampo(temErro) {
  return `${CLASSE_CONTROLE} ${
    temErro ? "border-red-400" : "border-neutral-200 focus:border-neutral-400"
  }`;
}

function mascaraCnpj(valor) {
  const d = valor.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12)
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(
    8,
    12
  )}-${d.slice(12)}`;
}

function mascaraTelefone(valor) {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (!d) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function Erro({ mensagem }) {
  if (!mensagem) return null;
  return <span className="mt-1 block text-xs text-red-600">{mensagem}</span>;
}

export default function CadastroEmpresa() {
  const navegar = useNavigate();
  const [form, setForm] = useState(INICIAL);
  const [erros, setErros] = useState({});
  const [avisoErro, setAvisoErro] = useState("");
  const [criada, setCriada] = useState(null);
  const [enviando, setEnviando] = useState(false);

  function alterar(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    setErros(({ [campo]: _, ...resto }) => resto);
  }

  async function enviar(evento) {
    evento.preventDefault();
    setEnviando(true);
    setErros({});
    setAvisoErro("");

    try {
      const empresa = await post("/empresas", form);
      setCriada(empresa);
      setForm(INICIAL);
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

  if (criada) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-14">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
          Conta criada
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          {criada.razao_social} já pode publicar vagas para os estudantes do IF.
        </p>

        <div className="mt-7 rounded-2xl border border-neutral-200 bg-white p-7">
          <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            Cadastro concluído com o e-mail {criada.email_contato}.
          </p>

          <button
            type="button"
            onClick={() => navegar("/login")}
            className="mt-5 w-full rounded-xl bg-neutral-900 py-3.5 text-sm font-medium text-white transition hover:bg-black"
          >
            Ir para o login
          </button>

          <button
            type="button"
            onClick={() => setCriada(null)}
            className="mt-4 w-full text-center text-sm text-neutral-500 hover:text-neutral-900"
          >
            Cadastrar outra empresa
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-neutral-500 transition hover:text-neutral-900"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Voltar
      </Link>

      <span className="mt-8 inline-block rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-600">
        Para empresas
      </span>

      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-neutral-900">
        Criar conta empresarial
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        Acesse os melhores talentos do Instituto Federal
      </p>

      <form
        onSubmit={enviar}
        noValidate
        className="mt-7 rounded-2xl border border-neutral-200 bg-white p-7"
      >
        {avisoErro && (
          <p className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {avisoErro}
          </p>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className={CLASSE_ROTULO} htmlFor="razao_social">
              Razão social
            </label>
            <input
              id="razao_social"
              className={classeCampo(erros.razao_social)}
              placeholder="Empresa Ltda"
              value={form.razao_social}
              onChange={(e) => alterar("razao_social", e.target.value)}
            />
            <Erro mensagem={erros.razao_social} />
          </div>

          <div>
            <label className={CLASSE_ROTULO} htmlFor="nome_fantasia">
              Nome fantasia
            </label>
            <input
              id="nome_fantasia"
              className={classeCampo(erros.nome_fantasia)}
              placeholder="Empresa"
              value={form.nome_fantasia}
              onChange={(e) => alterar("nome_fantasia", e.target.value)}
            />
            <Erro mensagem={erros.nome_fantasia} />
          </div>

          <div>
            <label className={CLASSE_ROTULO} htmlFor="cnpj">
              CNPJ
            </label>
            <input
              id="cnpj"
              inputMode="numeric"
              className={classeCampo(erros.cnpj)}
              placeholder="00.000.000/0000-00"
              value={form.cnpj}
              onChange={(e) => alterar("cnpj", mascaraCnpj(e.target.value))}
            />
            <Erro mensagem={erros.cnpj} />
          </div>

          <div>
            <label className={CLASSE_ROTULO} htmlFor="setor">
              Setor de atuação
            </label>
            <select
              id="setor"
              className={classeCampo(erros.setor)}
              value={form.setor}
              onChange={(e) => alterar("setor", e.target.value)}
            >
              <option value="">Selecione</option>
              {SETORES.map((setor) => (
                <option key={setor} value={setor}>
                  {setor}
                </option>
              ))}
            </select>
            <Erro mensagem={erros.setor} />
          </div>

          <div>
            <label className={CLASSE_ROTULO} htmlFor="email_contato">
              E-mail corporativo
            </label>
            <input
              id="email_contato"
              type="email"
              autoComplete="email"
              className={classeCampo(erros.email_contato)}
              placeholder="contato@empresa.com"
              value={form.email_contato}
              onChange={(e) => alterar("email_contato", e.target.value)}
            />
            <Erro mensagem={erros.email_contato} />
          </div>

          <div>
            <label className={CLASSE_ROTULO} htmlFor="telefone">
              Telefone
            </label>
            <input
              id="telefone"
              inputMode="tel"
              className={classeCampo(erros.telefone)}
              placeholder="(00) 00000-0000"
              value={form.telefone}
              onChange={(e) =>
                alterar("telefone", mascaraTelefone(e.target.value))
              }
            />
            <Erro mensagem={erros.telefone} />
          </div>

          <div className="sm:col-span-2">
            <label className={CLASSE_ROTULO} htmlFor="endereco">
              Endereço completo
            </label>
            <input
              id="endereco"
              className={classeCampo(erros.endereco)}
              placeholder="Rua, número, bairro, cidade - UF"
              value={form.endereco}
              onChange={(e) => alterar("endereco", e.target.value)}
            />
            <Erro mensagem={erros.endereco} />
          </div>

          <div>
            <label className={CLASSE_ROTULO} htmlFor="senha">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              autoComplete="new-password"
              className={classeCampo(erros.senha)}
              placeholder="Mínimo de 8 caracteres"
              value={form.senha}
              onChange={(e) => alterar("senha", e.target.value)}
            />
            <Erro mensagem={erros.senha} />
          </div>

          <div>
            <label className={CLASSE_ROTULO} htmlFor="confirmar_senha">
              Confirmar senha
            </label>
            <input
              id="confirmar_senha"
              type="password"
              autoComplete="new-password"
              className={classeCampo(erros.confirmar_senha)}
              placeholder="Repita a senha"
              value={form.confirmar_senha}
              onChange={(e) => alterar("confirmar_senha", e.target.value)}
            />
            <Erro mensagem={erros.confirmar_senha} />
          </div>
        </div>

        <label
          className="mt-7 flex items-start gap-3 text-sm text-neutral-600"
          htmlFor="aceite_termos"
        >
          <input
            id="aceite_termos"
            type="checkbox"
            className="mt-0.5 h-4 w-4 accent-neutral-900"
            checked={form.aceite_termos}
            onChange={(e) => alterar("aceite_termos", e.target.checked)}
          />
          <span>
            Aceito os{" "}
            <Link className="font-medium text-neutral-900 underline" to="/termos">
              termos de uso
            </Link>{" "}
            e{" "}
            <Link
              className="font-medium text-neutral-900 underline"
              to="/privacidade"
            >
              política de privacidade
            </Link>
            {erros.aceite_termos && (
              <span className="text-red-600"> — {erros.aceite_termos}</span>
            )}
          </span>
        </label>

        <button
          type="submit"
          disabled={enviando}
          className="mt-6 w-full rounded-xl bg-neutral-900 py-3.5 text-sm font-medium text-white transition hover:bg-black disabled:cursor-progress disabled:opacity-60"
        >
          {enviando ? "Criando conta..." : "Criar conta empresarial"}
        </button>

        <div className="mt-6 space-y-1.5 border-t border-neutral-200 pt-5 text-center text-sm text-neutral-500">
          <p>
            Já tem uma conta?{" "}
            <Link className="font-medium text-neutral-900" to="/login">
              Entrar
            </Link>
          </p>
          <p>
            É estudante?{" "}
            <Link
              className="font-medium text-neutral-900"
              to="/cadastro/estudante"
            >
              Cadastre-se aqui
            </Link>
          </p>
        </div>
      </form>
    </main>
  );
}