import type { BadgeTone } from "../Badge";
import type { EtapaPedido, Pedido } from "../../types";
import { estaVencido, faltamMenosDe24h } from "../../lib/date";

// Cores por etapa — ver docs/fase-1-design-system.md §5 "Etapas do pedido".
// As 6 etapas intermediárias usam a MESMA cor neutra de propósito: a
// diferença entre elas é a posição, não a cor. "Entregue" e "Pago" são as
// únicas com verde, porque são os dois momentos de sucesso reais.
export const TONE_ETAPA: Record<EtapaPedido, BadgeTone> = {
  vendido: "neutro",
  link_criado: "neutro",
  arte_pronta: "neutro",
  impresso: "neutro",
  nfc_gravado: "neutro",
  testado: "neutro",
  entregue: "verde",
  pago: "verdeSolido",
};

const ETAPAS_FINAIS: EtapaPedido[] = ["entregue", "pago"];

export function pedidoAtrasado(pedido: Pedido): boolean {
  return !ETAPAS_FINAIS.includes(pedido.etapa) && estaVencido(pedido.dataPrometidaEntrega);
}

export function pedidoProximoDoPrazo(pedido: Pedido): boolean {
  return !ETAPAS_FINAIS.includes(pedido.etapa) && faltamMenosDe24h(pedido.dataPrometidaEntrega);
}

export function custoTotalPedido(pedido: Pedido): number {
  return pedido.custoUnitarioSnapshot * pedido.numeroPlacas;
}

export function lucroPedido(pedido: Pedido): number {
  return pedido.valorCobrado - custoTotalPedido(pedido);
}

export function margemPedido(pedido: Pedido): number {
  return pedido.valorCobrado > 0 ? (lucroPedido(pedido) / pedido.valorCobrado) * 100 : 0;
}
