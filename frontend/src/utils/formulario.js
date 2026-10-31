export const apenasDigitos = (valor) => valor.replace(/\D/g, "");

export function mascaraCnpj(valor) {
  return apenasDigitos(valor)
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export function mascaraTelefone(valor) {
  const d = apenasDigitos(valor).slice(0, 11);
  if (!d) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function mascaraMoeda(valor) {
  const d = apenasDigitos(valor);
  if (!d) return "";
  return (Number(d) / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export const valorEmNumero = (valor) => Number(apenasDigitos(valor)) / 100;

export function cnpjValido(cnpj) {
  const d = apenasDigitos(cnpj);
  if (d.length !== 14 || /^(\d)\1+$/.test(d)) return false;

  const pesos = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const digito = (qtd, p) => {
    const soma = [...d.slice(0, qtd)].reduce((acc, c, i) => acc + Number(c) * p[i], 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  return digito(12, pesos) === Number(d[12]) && digito(13, [6, ...pesos]) === Number(d[13]);
}