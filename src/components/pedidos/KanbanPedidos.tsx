import { useState } from "react";
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { TriangleAlert } from "lucide-react";
import { ETAPAS_PEDIDO, type EtapaPedido } from "../../types";
import { useAppStore } from "../../store/useAppStore";
import { mostrarToast } from "../../store/useUiStore";
import { ColunaKanban } from "./ColunaKanban";

interface KanbanPedidosProps {
  onAbrirPedido: (id: string) => void;
}

// Quadro arrastável: soltar um cartão numa coluna chama avancarEtapaPedido.
// Não existe estado local otimista — a posição do cartão vem sempre da
// store, então se a store recusar a transição (ex. entrega sem teste),
// o cartão simplesmente não se move e a mensagem de erro explica por quê.
export function KanbanPedidos({ onAbrirPedido }: KanbanPedidosProps) {
  const pedidos = useAppStore((state) => state.pedidos);
  const avancarEtapaPedido = useAppStore((state) => state.avancarEtapaPedido);
  const [erro, setErro] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function aoSoltar(evento: DragEndEvent) {
    const { active, over } = evento;
    if (!over) return;
    const pedido = pedidos.find((p) => p.id === active.id);
    const novaEtapa = over.id as EtapaPedido;
    if (!pedido || pedido.etapa === novaEtapa) return;

    const resultado = avancarEtapaPedido(pedido.id, novaEtapa);
    if (resultado.ok) {
      setErro(null);
      const rotuloEtapa = ETAPAS_PEDIDO.find((e) => e.value === novaEtapa)?.label ?? novaEtapa;
      mostrarToast(`Pedido movido para ${rotuloEtapa}.`);
    } else {
      setErro(resultado.erro ?? "Não foi possível mover o pedido.");
    }
  }

  return (
    <div>
      {erro && (
        <div className="mb-3 flex items-start gap-2 rounded-md border border-alert/30 bg-alert-tint p-3 text-sm text-alert">
          <TriangleAlert size={16} className="mt-0.5 shrink-0" />
          <span className="flex-1">{erro}</span>
          <button type="button" className="shrink-0 underline" onClick={() => setErro(null)}>
            Entendi
          </button>
        </div>
      )}
      <DndContext sensors={sensors} onDragEnd={aoSoltar}>
        <div className="flex gap-3 overflow-x-auto pb-3">
          {ETAPAS_PEDIDO.map(({ value, label }) => (
            <ColunaKanban
              key={value}
              etapa={value}
              titulo={label}
              pedidos={pedidos.filter((p) => p.etapa === value)}
              onAbrirPedido={onAbrirPedido}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
