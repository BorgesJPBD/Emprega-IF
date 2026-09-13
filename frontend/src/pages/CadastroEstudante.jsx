import { useState } from "react";
import { Link } from "react-router-dom";

import Campo from "../componentes/Campo";
import { ErroApi, post } from "../api";

const INICIAL = {
  nome: "",
  cpf: "",
  email_if: "",
  telefone: "",
  instituicao: "IF - Instituto Federal",
  curso: "",
  periodo: "",
  senha: "",
  confirmar_senha: "",
  aceite_termos: false,
};

function mascaraCpf(valor) {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function mascaraTelefone(valor) {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (!d) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export default function CadastroEstudante() {
  const [form, setForm] = useState(INICIAL);
  const [erros, setErros] = useState({});
  const [avisoErro, setAvisoErro] = useState("");
  const [criado, setCriado] = useState(null);
  const [enviando, setEnviando] = useState(false);

  function alterar(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    // Limpa o erro do campo assim que a pessoa começa a corrigi-lo.
    setErros(({ [campo]: _, ...resto }) => resto);
  }

  async function enviar(evento) {
    evento.preventDefault();
    setEnviando(true);
    setErros({});
    setAvisoErro("");

    try {
      const estudante = await post("/estudantes", {
        ...form,
        periodo: Number(form.periodo),
      });
      setCriado(estudante);
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

  if (criado) {
    return (
      <main className="pagina">
        <span className="etiqueta">Para estudantes</span>
        <h1>Cadastro criado</h1>
        <p className="pagina__apoio">
          Tudo pronto, {criado.nome.split(" ")[0]}. Entre na plataforma para ver
          as vagas recomendadas para {criado.curso}.
        </p>
        <div className="cartao">
          <p className="aviso aviso--ok">
            Perfil de {criado.nome} criado com o e-mail {criado.email_if}.
          </p>
          <div style={{ marginTop: "1.1rem" }}>
            <Link className="botao botao--largo" to="/login">
              Ir para o login
            </Link>
          </div>
          <p className="rodape-cartao">
            <button className="botao-texto" onClick={() => setCriado(null)}>
              Cadastrar outro estudante
            </button>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="pagina">
      <span className="etiqueta">Para estudantes</span>
      <h1>Criar conta</h1>
      <p className="pagina__apoio">
        Preencha seus dados para começar a candidatar-se
      </p>

      <form className="cartao" onSubmit={enviar} noValidate>
        {avisoErro && <p className="aviso aviso--erro">{avisoErro}</p>}

        <div className="grade">
          <Campo
            nome="nome"
            rotulo="Nome completo"
            placeholder="João Silva"
            autoComplete="name"
            value={form.nome}
            erro={erros.nome}
            onChange={(e) => alterar("nome", e.target.value)}
          />

          <Campo
            nome="cpf"
            rotulo="CPF"
            placeholder="000.000.000-00"
            inputMode="numeric"
            value={form.cpf}
            erro={erros.cpf}
            onChange={(e) => alterar("cpf", mascaraCpf(e.target.value))}
          />

          <Campo
            nome="email_if"
            rotulo="E-mail institucional"
            type="email"
            placeholder="seu.nome@ifms.edu.br"
            autoComplete="email"
            value={form.email_if}
            erro={erros.email_if}
            onChange={(e) => alterar("email_if", e.target.value)}
          />

          <Campo
            nome="telefone"
            rotulo="Telefone"
            placeholder="(00) 00000-0000"
            inputMode="tel"
            value={form.telefone}
            erro={erros.telefone}
            onChange={(e) => alterar("telefone", mascaraTelefone(e.target.value))}
          />

          <Campo
            nome="instituicao"
            rotulo="Instituição"
            placeholder="IF - Instituto Federal"
            value={form.instituicao}
            erro={erros.instituicao}
            onChange={(e) => alterar("instituicao", e.target.value)}
          />

          <Campo
            nome="curso"
            rotulo="Curso"
            placeholder="Análise e Desenvolvimento de Sistemas"
            value={form.curso}
            erro={erros.curso}
            onChange={(e) => alterar("curso", e.target.value)}
          />

          <Campo nome="periodo" rotulo="Período" erro={erros.periodo}>
            <select
              id="periodo"
              name="periodo"
              value={form.periodo}
              onChange={(e) => alterar("periodo", e.target.value)}
            >
              <option value="">Selecione</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}º período
                </option>
              ))}
            </select>
          </Campo>

          <Campo
            nome="senha"
            rotulo="Senha"
            type="password"
            placeholder="Mínimo de 8 caracteres"
            autoComplete="new-password"
            value={form.senha}
            erro={erros.senha}
            onChange={(e) => alterar("senha", e.target.value)}
          />

          <Campo
            nome="confirmar_senha"
            rotulo="Confirmar senha"
            type="password"
            placeholder="Repita a senha"
            autoComplete="new-password"
            value={form.confirmar_senha}
            erro={erros.confirmar_senha}
            onChange={(e) => alterar("confirmar_senha", e.target.value)}
          />
        </div>

        <label className="termos" htmlFor="aceite_termos">
          <input
            id="aceite_termos"
            name="aceite_termos"
            type="checkbox"
            checked={form.aceite_termos}
            onChange={(e) => alterar("aceite_termos", e.target.checked)}
          />
          <span>
            Aceito os termos de uso e a política de privacidade
            {erros.aceite_termos && (
              <span className="campo__erro"> — {erros.aceite_termos}</span>
            )}
          </span>
        </label>

        <button className="botao botao--largo" type="submit" disabled={enviando}>
          {enviando ? "Criando conta..." : "Criar conta"}
        </button>

        <p className="rodape-cartao">
          Já tem uma conta? <Link to="/login">Entrar</Link>
          <br />
          É uma empresa? <Link to="/cadastro/empresa">Cadastre-se aqui</Link>
        </p>
      </form>
    </main>
  );
}
