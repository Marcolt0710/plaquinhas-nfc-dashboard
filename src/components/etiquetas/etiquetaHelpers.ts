import type { BadgeTone } from "../Badge";
import type { EtiquetaNFC, ResultadoTeste, SituacaoEtiqueta } from "../../types";

// Cores por situação — ver docs/fase-1-design-system.md §5 "Etiqueta NFC".
// Gravada fica em amarelo de propósito: é uma etapa intermediária que
// ainda precisa de atenção (falta testar).
export const TONE_SITUACAO_ETIQUETA: Record<SituacaoEtiqueta, BadgeTone> = {
  em_estoque: "neutro",
  gravada: "amarelo",
  entregue: "verde",
  com_defeito: "vermelho",
};

export const LABEL_SITUACAO_ETIQUETA: Record<SituacaoEtiqueta, string> = {
  em_estoque: "Em estoque",
  gravada: "Gravada",
  entregue: "Entregue",
  com_defeito: "Com defeito",
};

export const TONE_RESULTADO_TESTE: Record<ResultadoTeste, BadgeTone> = {
  aprovado: "verde",
  reprovado: "vermelho",
  nao_testado: "neutro",
};

export const LABEL_RESULTADO_TESTE: Record<ResultadoTeste, string> = {
  aprovado: "Aprovado",
  reprovado: "Reprovado",
  nao_testado: "Não testado",
};

export const LIMITE_ESTOQUE_BAIXO = 10;

export function etiquetaDisponivelParaGravar(etiqueta: EtiquetaNFC): boolean {
  return etiqueta.situacao !== "com_defeito" && etiqueta.situacao !== "entregue";
}
