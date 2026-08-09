import { useState } from "react";
import { ClipboardList, LayoutGrid, List } from "lucide-react";
import { EmptyState } from "../components/EmptyState";
import { useAppStore } from "../store/useAppStore";
import { usePrimaryAction } from "../lib/usePrimaryAction";
import { useAbrirPorParametro } from "../lib/useAbrirPorParametro";
import { KanbanPedidos } from "../components/pedidos/KanbanPedidos";
import { TabelaPedidos } from "../components/pedidos/TabelaPedidos";
import { PainelPedido } from "../components/pedidos/PainelPedido";
import { ModalNovoPedido } from "../components/pedidos/ModalNovoPedido";
import { ModalNovoCliente } from "../components/clientes/ModalNovoCliente";
import { PainelCliente } from "../components/clientes/PainelCliente";
import { BotaoExportarCsv } from "../components/BotaoExportarCsv";
import { exportarCsv } from "../lib/csv";
import { custoTotalPedido, lucroPedido } from "../components/pedidos/pedidoHelpers";
import { formatBRL, formatDate } from "../lib/format";
import { ETAPAS_PEDIDO } from "../types";

function visaoPadrao(): "kanban" | "tabela" {
  if (typeof window === "undefined") return "kanban";
  return window.innerWidth < 768 ? "tabela" : "kanban";
}

export default function Pedidos() {
  const pedidos = useAppStore((state) => state.pedidos);
  const clientes = useAppStore((state) => state.clientes);
  const [visao, setVisao] = useState<"kanban" | "tabela">(visaoPadrao);
  const [modalNovoPedidoAberto, setModalNovoPedidoAberto] = useState(false);
  const [modalNovoClienteAberto, setModalNovoClienteAberto] = useState(false);
  const [pedidoSelecionadoId, setPedidoSelecionadoId] = useState<string | null>(null);
  const [clienteSelecionadoId, setClienteSelecionadoId] = useState<string | null>(null);

  usePrimaryAction({ rotulo: "Novo pedido", onClick: () => setModalNovoPedidoAberto(true) });

  // Abre a ficha quando a busca global navega para cá com ?abrir=<id>.
  useAbrirPorParametro(setPedidoSelecionadoId);

  function abrirClienteAPartirDoPedido(clienteId: string) {
    setPedidoSelecionadoId(null);
    setClienteSelecionadoId(clienteId);
  }

  const labelEtapa = Object.fromEntries(ETAPAS_PEDIDO.map((e) => [e.value, e.label])) as Record<
    string,
    string
  >;

  function exportar() {
    exportarCsv(
      "pedidos",
      pedidos.map((pedido) => ({
        Código: pedido.codigo,
        Cliente: clientes.find((c) => c.id === pedido.clienteId)?.nomeEstabelecimento ?? "",
        Placas: pedido.numeroPlacas,
        Valor: formatBRL(pedido.valorCobrado),
        Custo: formatBRL(custoTotalPedido(pedido)),
        Lucro: formatBRL(lucroPedido(pedido)),
        "Data da venda": formatDate(pedido.dataVenda),
        "Entrega prometida": formatDate(pedido.dataPrometidaEntrega),
        Etapa: labelEtapa[pedido.etapa] ?? pedido.etapa,
        Pago: pedido.pago ? "Sim" : "Não",
      })),
    );
  }

  const modais = (
    <>
      {modalNovoPedidoAberto && (
        <ModalNovoPedido
          onFechar={() => setModalNovoPedidoAberto(false)}
          onCriado={(id) => {
            setModalNovoPedidoAberto(false);
            setPedidoSelecionadoId(id);
          }}
          onIrParaNovoCliente={() => {
            setModalNovoPedidoAberto(false);
            setModalNovoClienteAberto(true);
          }}
        />
      )}
      {modalNovoClienteAberto && (
        <ModalNovoCliente
          onFechar={() => setModalNovoClienteAberto(false)}
          onCriado={() => {
            setModalNovoClienteAberto(false);
            setModalNovoPedidoAberto(true);
          }}
        />
      )}
      {pedidoSelecionadoId && (
        <PainelPedido
          pedidoId={pedidoSelecionadoId}
          onFechar={() => setPedidoSelecionadoId(null)}
          onAbrirCliente={abrirClienteAPartirDoPedido}
        />
      )}
      {clienteSelecionadoId && (
        <PainelCliente
          clienteId={clienteSelecionadoId}
          onFechar={() => setClienteSelecionadoId(null)}
          onAbrirPedido={(id) => {
            setClienteSelecionadoId(null);
            setPedidoSelecionadoId(id);
          }}
        />
      )}
    </>
  );

  if (pedidos.length === 0) {
    return (
      <>
        <EmptyState
          icon={ClipboardList}
          titulo="Nenhum pedido registrado ainda"
          descricao="Cada venda vira um pedido, que passa por etapas de produção — do link criado até a entrega e o pagamento. Registre o primeiro para acompanhar o quadro."
          acaoRotulo="Novo pedido"
          onAcao={() => setModalNovoPedidoAberto(true)}
        />
        {modais}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setVisao("kanban")}
          className={`flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium ${
            visao === "kanban"
              ? "border-accent bg-accent-tint text-accent"
              : "border-border text-secondary hover:border-border-strong hover:text-primary"
          }`}
        >
          <LayoutGrid size={16} /> Quadro
        </button>
        <button
          type="button"
          onClick={() => setVisao("tabela")}
          className={`flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium ${
            visao === "tabela"
              ? "border-accent bg-accent-tint text-accent"
              : "border-border text-secondary hover:border-border-strong hover:text-primary"
          }`}
        >
          <List size={16} /> Tabela
        </button>
        <BotaoExportarCsv onExportar={exportar} className="ml-auto" />
      </div>

      {visao === "kanban" ? (
        <KanbanPedidos onAbrirPedido={setPedidoSelecionadoId} />
      ) : (
        <TabelaPedidos pedidos={pedidos} onAbrirPedido={setPedidoSelecionadoId} />
      )}

      {modais}
    </div>
  );
}
