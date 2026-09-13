const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Erro de requisição já traduzido para a tela.
 * - campos: { nomeDoCampo: "mensagem" } para mostrar embaixo do input
 * - mensagem: texto geral, quando o erro não pertence a um campo
 */
export class ErroApi extends Error {
  constructor(mensagem, campos = {}) {
    super(mensagem);
    this.campos = campos;
  }
}

function traduzirErro(status, corpo) {
  // 422: lista de validações do Pydantic
  if (status === 422 && Array.isArray(corpo?.detail)) {
    const campos = {};
    for (const item of corpo.detail) {
      const nome = item.loc?.[item.loc.length - 1] ?? "geral";
      campos[nome] = item.msg.replace(/^Value error,\s*/, "");
    }
    return new ErroApi("Revise os campos destacados.", campos);
  }

  // 409: conflito devolvido pela rota, com o campo responsável
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

export async function post(rota, dados) {
  let resposta;
  try {
    resposta = await fetch(`${API_URL}${rota}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
  } catch {
    throw new ErroApi("Não foi possível falar com o servidor. A API está rodando?");
  }

  const corpo = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    throw traduzirErro(resposta.status, corpo);
  }
  return corpo;
}
