import { ETAPAS_PEDIDO, type EtapaPedido } from "../../types";

interface TrilhaEtapasProps {
  etapa: EtapaPedido;
  /** Mostra "5 de 8 · Impresso" abaixo da trilha. */
  comLegenda?: boolean;
}

/**
 * As oito etapas da produção como uma trilha horizontal compacta.
 *
 * Marcador sequencial aqui não é decoração: a produção é uma sequência
 * real e fixa (vendido → link → arte → impresso → NFC → testado →
 * entregue → pago), então a posição carrega a informação que a pessoa
 * precisa — quanto falta para entregar. Dá para ler sem ler texto.
 *
 * A cor segue a regra da Fase 1: as etapas vencidas usam o cinza de
 * borda forte, a atual usa o verde de destaque, e as futuras quase
 * somem. O verde marca "onde estou", não "está tudo bem".
 */
export function TrilhaEtapas({ etapa, comLegenda = false }: TrilhaEtapasProps) {
  const indiceAtual = ETAPAS_PEDIDO.findIndex((e) => e.value === etapa);
  const total = ETAPAS_PEDIDO.length;
  const rotuloAtual = ETAPAS_PEDIDO[indiceAtual]?.label ?? "";

  return (
    <div>
      <div
        className="flex gap-[3px]"
        role="img"
        aria-label={`Etapa ${indiceAtual + 1} de ${total}: ${rotuloAtual}`}
      >
        {ETAPAS_PEDIDO.map((e, i) => (
          <span
            key={e.value}
            className={`h-1 flex-1 rounded-full ${
              i < indiceAtual
                ? "bg-border-strong"
                : i === indiceAtual
                  ? "bg-accent"
                  : "bg-border/60"
            }`}
          />
        ))}
      </div>
      {comLegenda && (
        <p className="mt-1.5 text-xs text-secondary">
          <span className="num">
            {indiceAtual + 1} de {total}
          </span>{" "}
          · {rotuloAtual}
        </p>
      )}
    </div>
  );
}
