import { useMemo, useState } from "react";
import { Users } from "lucide-react";
import { EmptyState } from "../components/EmptyState";
import { useAppStore } from "../store/useAppStore";
import { usePrimaryAction } from "../lib/usePrimaryAction";
import { classesCampo } from "../components/formClasses";
import { formatDate } from "../lib/format";
import { ModalNovoCliente } from "../components/clientes/ModalNovoCliente";
import { PainelCliente } from "../components/clientes/PainelCliente";
import { PainelPedido } from "../components/pedidos/PainelPedido";
import { BotaoExportarCsv } from "../components/BotaoExportarCsv";
import { exportarCsv } from "../lib/csv";

export default function Clientes() {
  const clientes = useAppStore((state) => state.clientes);
  const pedidos = useAppStore((state) => state.pedidos);
  const [busca, setBusca] = useState("");
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [clienteSelecionadoId, setClienteSelecionadoId] = useState<string | null>(null);
  const [pedidoSelecionadoId, setPedidoSelecionadoId] = useState<string | null>(null);

  usePrimaryAction({ rotulo: "Novo cliente", onClick: () => setModalNovoAberto(true) });

  const clientesFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return clientes;
    return clientes.filter((c) => c.nomeEstabelecimento.toLowerCase().includes(termo));
  }, [clientes, busca]);

  function contarPedidos(clienteId: string) {
    return pedidos.filter((p) => p.clienteId === clienteId).length;
  }

  function exportar() {
    exportarCsv(
      "clientes",
      clientesFiltrados.map((cliente) => ({
        Estabelecimento: cliente.nomeEstabelecimento,
        Responsável: cliente.nomeResponsavel,
        Telefone: cliente.telefoneResponsavel,
        Endereço: cliente.endereco,
        "Link de avaliação": cliente.linkAvaliacaoGoogle,
        "Link encurtado": cliente.linkEncurtado,
        "Primeiro pedido": formatDate(cliente.dataPrimeiroPedido),
        Pedidos: contarPedidos(cliente.id),
      })),
    );
  }

  const modais = (
    <>
      {modalNovoAberto && (
        <ModalNovoCliente
          onFechar={() => setModalNovoAberto(false)}
          onCriado={(id) => {
            setModalNovoAberto(false);
            setClienteSelecionadoId(id);
          }}
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
      {pedidoSelecionadoId && (
        <PainelPedido pedidoId={pedidoSelecionadoId} onFechar={() => setPedidoSelecionadoId(null)} />
      )}
    </>
  );

  if (clientes.length === 0) {
    return (
      <>
        <EmptyState
          icon={Users}
          titulo="Nenhum cliente cadastrado ainda"
          descricao="Um cliente aparece aqui quando um lead vira venda, ou quando alguém chega pronto para comprar por indicação. Cadastre o primeiro para começar o histórico."
          acaoRotulo="Novo cliente"
          onAcao={() => setModalNovoAberto(true)}
        />
        {modais}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          className={`${classesCampo} sm:max-w-xs`}
          placeholder="Buscar por nome do estabelecimento"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <BotaoExportarCsv onExportar={exportar} className="sm:ml-auto" />
      </div>

      {clientesFiltrados.length === 0 ? (
        <EmptyState
          icon={Users}
          titulo="Nenhum cliente encontrado"
          descricao="Ajuste a busca para ver outros clientes."
          acaoRotulo="Limpar busca"
          onAcao={() => setBusca("")}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full min-w-[560px] text-left">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-secondary">
                <th className="px-4 py-3 font-medium">Estabelecimento</th>
                <th className="px-4 py-3 font-medium">Responsável</th>
                <th className="px-4 py-3 font-medium">Primeiro pedido</th>
                <th className="px-4 py-3 text-right font-medium">Pedidos</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map((cliente) => (
                <tr
                  key={cliente.id}
                  onClick={() => setClienteSelecionadoId(cliente.id)}
                  className="cursor-pointer border-b border-border last:border-0 hover:bg-card-hover"
                >
                  <td className="px-4 py-3 text-sm text-primary">{cliente.nomeEstabelecimento}</td>
                  <td className="px-4 py-3 text-sm text-secondary">{cliente.nomeResponsavel || "—"}</td>
                  <td className="px-4 py-3 text-sm text-secondary">
                    {formatDate(cliente.dataPrimeiroPedido)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-primary">
                    {contarPedidos(cliente.id)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modais}
    </div>
  );
}
