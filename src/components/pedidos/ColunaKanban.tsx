import { useDroppable } from "@dnd-kit/core";
import type { EtapaPedido, Pedido } from "../../types";
import { CartaoPedido } from "./CartaoPedido";

interface ColunaKanbanProps {
  etapa: EtapaPedido;
  titulo: string;
  pedidos: Pedido[];
  onAbrirPedido: (id: string) => void;
}

export function ColunaKanban({ etapa, titulo, pedidos, onAbrirPedido }: ColunaKanbanProps) {
  const { setNodeRef, isOver } = useDroppable({ id: etapa });

  return (
    <div
      ref={setNodeRef}
      className={`flex w-64 shrink-0 flex-col gap-3 rounded-lg border p-3 transition-colors ${
        isOver ? "border-accent bg-accent-tint" : "border-border bg-page"
      }`}
    >
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-medium text-primary">{titulo}</h3>
        <span className="font-mono text-xs text-secondary">{pedidos.length}</span>
      </div>
      <div className="flex flex-col gap-2">
        {pedidos.length === 0 ? (
          <p className="px-1 text-xs text-secondary">Nenhum pedido aqui.</p>
        ) : (
          pedidos.map((pedido) => (
            <CartaoPedido key={pedido.id} pedido={pedido} onAbrir={() => onAbrirPedido(pedido.id)} />
          ))
        )}
      </div>
    </div>
  );
}
