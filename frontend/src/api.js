import { lerSessao, limparSessao } from "./auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export class ErroApi extends Error {
  constructor(mensagem, campos = {}) {
    super(mensagem);
    this.campos = campos;
  }
}

function traduzirErro(status, corpo) {
  if (status === 422 && Array.isArray(corpo?.detail)) {
    const campos = {};
    for (const item of corpo.detail) {
      const nome = item.loc?.[item.loc.length - 1] ?? "geral";
      campos[nome] = item.msg.replace(/^Value error,\s*/, "");
    }
    return new ErroApi("Revise os campos destacados.", campos);
  }

  if (status === 409 && corpo?.detail?.campo) {
    return new ErroApi(corpo.detail.mensagem, {
      [corpo.detail.campo]: corpo.detail.mensagem,
    });
  }

  const texto =
    typeof corpo?.detail === "string"
      ? corpo.detail
      : "Não foi possível concluir a operação. Tente novamente.";
  return new ErroApi(texto);
}

async function requisitar(metodo, rota, dados) {
  const sessao = lerSessao();
  const cabecalhos = { "Content-Type": "application/json" };
  if (sessao?.token) cabecalhos.Authorization = `Bearer ${sessao.token}`;

  let resposta;
  try {
    resposta = await fetch(`${API_URL}${rota}`, {
      method: metodo,
      headers: cabecalhos,
      body: dados === undefined ? undefined : JSON.stringify(dados),
    });
  } catch {
    throw new ErroApi("Não foi possível falar com o servidor. A API está rodando?");
  }

  const corpo = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    if (resposta.status === 401 && sessao) limparSessao();
    const erro = traduzirErro(resposta.status, corpo);
    erro.status = resposta.status;
    throw erro;
  }
  return corpo;
}

export const post = (rota, dados) => requisitar("POST", rota, dados);
export const patch = (rota, dados) => requisitar("PATCH", rota, dados);

export function get(rota, filtros = {}) {
  const busca = new URLSearchParams(
    Object.entries(filtros).filter(([, valor]) => valor !== "" && valor != null)
  ).toString();
  return requisitar("GET", busca ? `${rota}?${busca}` : rota);
}
