import { useDraggable } from "@dnd-kit/core";
import type { Pedido } from "../../types";
import { useAppStore } from "../../store/useAppStore";
import { formatBRL, formatDate } from "../../lib/format";
import { pedidoAtrasado, pedidoProximoDoPrazo } from "./pedidoHelpers";

interface CartaoPedidoProps {
  pedido: Pedido;
  onAbrir: () => void;
}

// Cartão arrastável do quadro kanban. O indicador de prazo (ponto
// amarelo/vermelho) é independente da cor da etapa — ver pedidoHelpers.
export function CartaoPedido({ pedido, onAbrir }: CartaoPedidoProps) {
  const cliente = useAppStore((state) => state.clientes.find((c) => c.id === pedido.clienteId));
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: pedido.id });

  const atrasado = pedidoAtrasado(pedido);
  const proximo = pedidoProximoDoPrazo(pedido);

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 10 }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onAbrir}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onAbrir();
        }
      }}
      className={`flex touch-none flex-col gap-2 rounded-lg border bg-card p-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent ${
        isDragging ? "opacity-50" : "hover:border-border-strong"
      } ${atrasado ? "border-alert/50" : proximo ? "border-attention/50" : "border-border"}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs text-secondary">{pedido.codigo}</span>
        {(atrasado || proximo) && (
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${atrasado ? "bg-alert" : "bg-attention"}`}
            aria-label={atrasado ? "Entrega atrasada" : "Entrega em menos de 24h"}
          />
        )}
      </div>
      <p className="text-sm text-primary">{cliente?.nomeEstabelecimento ?? "Cliente removido"}</p>
      <div className="flex items-center justify-between text-xs text-secondary">
        <span>
          {pedido.numeroPlacas} placa{pedido.numeroPlacas > 1 ? "s" : ""}
        </span>
        <span className="font-mono text-accent">{formatBRL(pedido.valorCobrado)}</span>
      </div>
      <span className="text-xs text-secondary">Entrega {formatDate(pedido.dataPrometidaEntrega)}</span>
    </div>
  );
}
