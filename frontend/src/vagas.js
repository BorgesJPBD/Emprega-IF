import {
  Briefcase, FileText, HardHat, Monitor, Palette, ShoppingBag, TrendingUp, Truck, Users,
} from "lucide-react";

import { get } from "./api";

/* Busca as vagas no backend (tabela `vagas` do PostgreSQL) e converte para o
   formato que as telas usam desde o protótipo — assim CartaoVaga, Home,
   Vagas e DetalheVaga continuam lendo os mesmos campos de antes. */

export const ICONES = {
  Tecnologia: Monitor,
  Administrativo: FileText,
  Marketing: TrendingUp,
  Design: Palette,
  Vendas: ShoppingBag,
  "Recursos Humanos": Users,
  Engenharia: HardHat,
  Logística: Truck,
};

/* Um toque de cor por área, só no ícone da vaga. Classes escritas por
   inteiro para o Tailwind encontrar. */
export const CORES = {
  Tecnologia: "bg-sky-50 text-sky-700",
  Administrativo: "bg-amber-50 text-amber-700",
  Marketing: "bg-rose-50 text-rose-700",
  Design: "bg-violet-50 text-violet-700",
  Vendas: "bg-orange-50 text-orange-700",
  "Recursos Humanos": "bg-teal-50 text-teal-700",
  Engenharia: "bg-slate-100 text-slate-700",
  Logística: "bg-lime-50 text-lime-700",
};

/* Tipo da vaga: estágio no verde da marca, jovem aprendiz em azul. */
export const COR_TIPO = {
  "Estágio": "border-marca-200 bg-marca-50 text-marca-800",
  "Jovem aprendiz": "border-sky-200 bg-sky-50 text-sky-800",
};

/** "08:00:00" -> "8:00" */
const hora = (h) => h.slice(0, 5).replace(/^0/, "");

/** Vaga como vem da API -> vaga como as telas usam. */
export function paraTela(v) {
  return {
    id: v.id,
    titulo: v.titulo,
    empresa: v.empresa_nome,
    tipo: v.tipo,
    area: v.area ?? "Outra",
    local: v.localizacao ?? "A definir",
    modalidade: v.modalidade ?? "A definir",
    horario: v.horario_entrada && v.horario_saida
      ? `${hora(v.horario_entrada)} às ${hora(v.horario_saida)}`
      : "Horário a definir",
    cargaHoraria: v.carga_horaria ?? "A definir",
    valor: v.remuneracao ?? 0,
    numeroVagas: v.numero_vagas,
    publicadaEm: (v.data_publicacao ?? new Date().toISOString()).slice(0, 10),
    prazo: v.prazo_inscricao,
    situacao: v.situacao,
    Icone: ICONES[v.area] ?? Briefcase,
    cor: CORES[v.area] ?? "bg-neutral-100 text-neutral-600",
    descricao: v.descricao ?? "",
    requisitos: v.requisitos,
    diferenciais: v.diferenciais,
    beneficios: v.beneficios,
  };
}

/** Filtros aceitos: { tipo, area, localizacao, limite } */
export async function buscarVagas(filtros = {}) {
  const lista = await get("/vagas", filtros);
  return lista.map(paraTela);
}

export async function buscarVaga(id) {
  return paraTela(await get(`/vagas/${id}`));
}

export async function buscarParecidas(id) {
  const lista = await get(`/vagas/${id}/parecidas`);
  return lista.map(paraTela);
}
