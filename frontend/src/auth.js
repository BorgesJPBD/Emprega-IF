const CHAVE = "emprega-if:sessao";

export function salvarSessao({ access_token, usuario }, lembrar) {
  const deposito = lembrar ? localStorage : sessionStorage;
  deposito.setItem(CHAVE, JSON.stringify({ token: access_token, usuario }));
}

export function lerSessao() {
  const bruto =
    localStorage.getItem(CHAVE) || sessionStorage.getItem(CHAVE) || null;
  if (!bruto) return null;

  try {
    return JSON.parse(bruto);
  } catch {
    limparSessao();
    return null;
  }
}

export function limparSessao() {
  localStorage.removeItem(CHAVE);
  sessionStorage.removeItem(CHAVE);
}
