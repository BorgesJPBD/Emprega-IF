import {
  Briefcase, FileText, HardHat, Monitor, Palette, ShoppingBag, TrendingUp, Truck, Users,
} from "lucide-react";

import { get } from "./api";

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

export const TARJA_TIPO = {
  "Estágio": "tarja--estagio",
  "Jovem aprendiz": "tarja--aprendiz",
};

const hora = (h) => h.slice(0, 5).replace(/^0/, "");

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
    entrada: v.horario_entrada?.slice(0, 5) ?? null,
    saida: v.horario_saida?.slice(0, 5) ?? null,
    valor: v.remuneracao ?? 0,
    numeroVagas: v.numero_vagas,
    publicadaEm: v.data_publicacao?.slice(0, 10) ?? null,
    prazo: v.prazo_inscricao,
    situacao: v.situacao,
    Icone: ICONES[v.area] ?? Briefcase,
    descricao: v.descricao ?? "",
    requisitos: v.requisitos,
    diferenciais: v.diferenciais,
    beneficios: v.beneficios,
  };
}

const minutos = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export function turnoDa(vaga) {
  if (!vaga.entrada || !vaga.saida) return null;
  const ini = minutos(vaga.entrada);
  const fim = minutos(vaga.saida);
  if (ini >= 18 * 60) return "Noturno";
  if (fim <= 13 * 60) return "Matutino";
  if (ini >= 12 * 60 && fim <= 19 * 60) return "Vespertino";
  return "Integral";
}

export const TURNOS_LIVRES = {
  "Manhã": ["Matutino"],
  "Tarde": ["Vespertino"],
  "Noite": ["Noturno"],
};

export function jornada(vaga) {
  const partes = [];
  const semana = /(\d+)\s*h/i.exec(vaga.cargaHoraria ?? "");
  if (semana) partes.push(`${semana[1]}h/sem`);
  if (vaga.entrada && vaga.saida) {
    const horas = (minutos(vaga.saida) - minutos(vaga.entrada)) / 60;
    if (horas > 0) partes.push(`${String(horas).replace(".", ",")}h/dia`);
  }
  const turno = turnoDa(vaga);
  if (turno) partes.push(turno);
  return partes;
}

export function diasAte(iso) {
  if (!iso) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(`${iso}T00:00:00`) - hoje) / 86400000);
}

export function prazoDa(vaga) {
  const dias = diasAte(vaga.prazo);
  if (dias === null || dias < 0) return null;
  if (dias === 0) return { texto: "Último dia", urgente: true };
  if (dias <= 2) return { texto: `Últimos ${dias + 1} dias`, urgente: true };
  if (dias <= 7) return { texto: `Encerra em ${dias} dias`, urgente: true };
  const data = new Date(`${vaga.prazo}T00:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  return { texto: `Até ${data}`, urgente: false };
}

export const ehNova = (vaga) => {
  if (!vaga.publicadaEm) return false;
  const dias = diasAte(vaga.publicadaEm);
  return dias >= -7 && dias <= 0;
};

export const cidadeDe = (local = "") => local.replace(/\s+-\s+/, " · ");

export const bolsaDe = (vaga) => (vaga.valor ? `R$ ${vaga.valor.toLocaleString("pt-BR")}` : null);

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
