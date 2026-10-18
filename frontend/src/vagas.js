import {
  Briefcase, FileText, HardHat, Monitor, Palette, ShoppingBag, TrendingUp, Truck, Users,
} from "lucide-react";

import { get } from "./api";

/* Busca as vagas no backend (tabela `vagas` do PostgreSQL) e converte para o
   formato que as telas usam desde o protótipo — assim CartaoVaga, Home,
   Vagas e DetalheVaga continuam lendo os mesmos campos de antes. */

const ICONES = {
  Tecnologia: Monitor,
  Administrativo: FileText,
  Marketing: TrendingUp,
  Design: Palette,
  Vendas: ShoppingBag,
  "Recursos Humanos": Users,
  Engenharia: HardHat,
  Logística: Truck,
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
