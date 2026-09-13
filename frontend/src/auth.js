/**
 * Sessão do usuário no navegador.
 *
 * Com "Lembrar-me" marcado, a sessão vai para o localStorage e sobrevive
 * ao fechamento do navegador. Sem ele, vai para o sessionStorage e morre
 * junto com a aba — que é o comportamento que a pessoa espera ao não
 * marcar a caixinha, e o mais seguro em computador compartilhado (o do
 * laboratório do IF, por exemplo).
 */

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
