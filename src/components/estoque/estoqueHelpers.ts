import type { ItemEstoque } from "../../types";

export function itemAbaixoDoMinimo(item: Pick<ItemEstoque, "quantidadeAtual" | "quantidadeMinima">): boolean {
  return item.quantidadeAtual < item.quantidadeMinima;
}

/** Percentual do nível atual em relação ao mínimo, para a barra visual (limitado a 100%). */
export function percentualNivel(item: Pick<ItemEstoque, "quantidadeAtual" | "quantidadeMinima">): number {
  if (item.quantidadeMinima <= 0) return 100;
  const alvo = item.quantidadeMinima * 2; // barra cheia = 2x o mínimo, dá folga visual
  return Math.max(4, Math.min(100, Math.round((item.quantidadeAtual / alvo) * 100)));
}
