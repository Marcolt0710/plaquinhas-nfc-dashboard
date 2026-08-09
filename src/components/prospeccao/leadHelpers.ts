import type { BadgeTone } from "../Badge";
import type { Lead, SituacaoLead } from "../../types";
import { estaVencido } from "../../lib/date";

// Cores por situação — ver docs/fase-1-design-system.md §5 "Situação do lead".
export const TONE_SITUACAO: Record<SituacaoLead, BadgeTone> = {
  a_visitar: "neutro",
  visitado: "neutroClaro",
  interessado: "amarelo",
  vendido: "verde",
  descartado: "vermelhoSuave",
};

export const LABEL_SITUACAO: Record<SituacaoLead, string> = {
  a_visitar: "A visitar",
  visitado: "Visitado",
  interessado: "Interessado",
  vendido: "Vendido",
  descartado: "Descartado",
};

const LIMITE_NOTA_MINIMA = 3.5;
const LIMITE_AVALIACOES_MAXIMO = 500;

export function notaAbaixoDoMinimo(lead: Lead): boolean {
  return lead.notaGoogle !== null && lead.notaGoogle < LIMITE_NOTA_MINIMA;
}

export function avaliacoesAcimaDoMaximo(lead: Lead): boolean {
  return lead.numeroAvaliacoes !== null && lead.numeroAvaliacoes > LIMITE_AVALIACOES_MAXIMO;
}

export function temAlertaDeVenda(lead: Lead): boolean {
  return notaAbaixoDoMinimo(lead) || avaliacoesAcimaDoMaximo(lead);
}

export function retornoVencido(lead: Lead): boolean {
  return (
    Boolean(lead.dataRetorno) &&
    estaVencido(lead.dataRetorno) &&
    lead.situacao !== "vendido" &&
    lead.situacao !== "descartado"
  );
}
