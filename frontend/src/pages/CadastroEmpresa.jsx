import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ErroApi, get, post } from "../api";
import PaginaFormulario from "../componentes/PaginaFormulario";

const SETORES_PADRAO = [
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

const CLASSE_ROTULO = "rotulo";

function classeCampo(temErro) {
  return temErro ? "entrada border-urgente bg-urgente-claro" : "entrada";
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
  return <span className="erro-campo">{mensagem}</span>;
}

export default function CadastroEmpresa() {
  const navegar = useNavigate();
  const [form, setForm] = useState(INICIAL);
  const [SETORES, setSetores] = useState(SETORES_PADRAO);

  useEffect(() => {
    get("/empresas/setores").then(setSetores).catch(() => {});
  }, []);
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
      <PaginaFormulario
        titulo="Conta criada"
        resumo={`${criada.razao_social} já pode publicar vagas para os estudantes do IF.`}
      >
        <p className="aviso aviso--ok">
          Cadastro concluído com o e-mail {criada.email_contato}.
        </p>
        <button type="button" onClick={() => navegar("/login")} className="botao botao--largo mt-5">
          Ir para o login
        </button>
        <p className="mt-4 text-center">
          <button type="button" onClick={() => setCriada(null)} className="link text-[15px]">
            Cadastrar outra empresa
          </button>
        </p>
      </PaginaFormulario>
    );
  }

  return (
    <PaginaFormulario
      titulo="Criar conta empresarial"
      resumo="Publique vagas e encontre estudantes do Instituto Federal."
      voltar={{ para: "/cadastro", rotulo: "Tipos de conta" }}
    >
      <form onSubmit={enviar} noValidate>
        {avisoErro && <p role="alert" className="aviso aviso--erro mb-6">{avisoErro}</p>}

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

        <label className="mt-7 flex items-start gap-3 text-[15px]" htmlFor="aceite_termos">
          <input
            id="aceite_termos"
            type="checkbox"
            className="caixa"
            checked={form.aceite_termos}
            onChange={(e) => alterar("aceite_termos", e.target.checked)}
          />
          <span>
            Aceito os{" "}
            <Link className="link" to="/termos" target="_blank" rel="noopener">termos de uso</Link>{" "}
            e{" "}
            <Link className="link" to="/privacidade" target="_blank" rel="noopener">política de privacidade</Link>
            {erros.aceite_termos && <span className="erro-campo inline"> — {erros.aceite_termos}</span>}
          </span>
        </label>

        <button type="submit" disabled={enviando} className="botao botao--largo mt-6 min-h-14 text-lg">
          {enviando ? "Criando conta..." : "Criar conta empresarial"}
        </button>

        <div className="mt-6 space-y-1.5 border-t border-linha pt-5 text-[15px]">
          <p>Já tem uma conta? <Link className="link" to="/login">Entrar</Link></p>
          <p>É estudante? <Link className="link" to="/cadastro/estudante">Cadastre-se aqui</Link></p>
        </div>
      </form>
    </PaginaFormulario>
  );
}