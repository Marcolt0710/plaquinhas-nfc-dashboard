import type { Pedido } from "../../types";
import { ETAPAS_PEDIDO } from "../../types";
import { Badge } from "../Badge";
import { useAppStore } from "../../store/useAppStore";
import { formatBRL, formatDate } from "../../lib/format";
import { TONE_ETAPA, pedidoAtrasado, pedidoProximoDoPrazo } from "./pedidoHelpers";

interface TabelaPedidosProps {
  pedidos: Pedido[];
  onAbrirPedido: (id: string) => void;
}

const LABEL_ETAPA = Object.fromEntries(ETAPAS_PEDIDO.map((e) => [e.value, e.label])) as Record<
  Pedido["etapa"],
  string
>;

// Visão alternativa em lista, para quem prefere não arrastar (Fase 4) —
// principalmente útil no celular.
export function TabelaPedidos({ pedidos, onAbrirPedido }: TabelaPedidosProps) {
  const clientes = useAppStore((state) => state.clientes);

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full min-w-[720px] text-left">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-secondary">
            <th className="px-4 py-3 font-medium">Pedido</th>
            <th className="px-4 py-3 font-medium">Cliente</th>
            <th className="px-4 py-3 font-medium">Etapa</th>
            <th className="px-4 py-3 font-medium">Entrega</th>
            <th className="px-4 py-3 text-right font-medium">Valor</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((pedido) => {
            const cliente = clientes.find((c) => c.id === pedido.clienteId);
            const atrasado = pedidoAtrasado(pedido);
            const proximo = pedidoProximoDoPrazo(pedido);
            return (
              <tr
                key={pedido.id}
                onClick={() => onAbrirPedido(pedido.id)}
                className="cursor-pointer border-b border-border last:border-0 hover:bg-card-hover"
              >
                <td className="px-4 py-3 font-mono text-sm text-secondary">{pedido.codigo}</td>
                <td className="px-4 py-3 text-sm text-primary">
                  {cliente?.nomeEstabelecimento ?? "Cliente removido"}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={TONE_ETAPA[pedido.etapa]}>{LABEL_ETAPA[pedido.etapa]}</Badge>
                </td>
                <td
                  className={`px-4 py-3 text-sm ${
                    atrasado ? "text-alert" : proximo ? "text-attention" : "text-secondary"
                  }`}
                >
                  {formatDate(pedido.dataPrometidaEntrega)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-sm text-primary">
                  {formatBRL(pedido.valorCobrado)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
