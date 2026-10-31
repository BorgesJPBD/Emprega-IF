import { useSyncExternalStore } from "react";

const CHAVE = "emprega-if:salvas";
const ouvintes = new Set();

function ler() {
  try {
    const lista = JSON.parse(localStorage.getItem(CHAVE) ?? "[]");
    return Array.isArray(lista) ? lista.map(String) : [];
  } catch {
    return [];
  }
}

let atuais = ler();

function avisar() {
  ouvintes.forEach((ouvir) => ouvir());
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === CHAVE) {
      atuais = ler();
      avisar();
    }
  });
}

export function alternarSalva(id) {
  const chave = String(id);
  atuais = atuais.includes(chave) ? atuais.filter((v) => v !== chave) : [...atuais, chave];
  try {
    localStorage.setItem(CHAVE, JSON.stringify(atuais));
  } catch {
  }
  avisar();
}

function assinar(ouvir) {
  ouvintes.add(ouvir);
  return () => ouvintes.delete(ouvir);
}

export function useSalvas() {
  return useSyncExternalStore(assinar, () => atuais, () => atuais);
}
