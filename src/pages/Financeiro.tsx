import { Wallet } from "lucide-react";
import { EmptyState } from "../components/EmptyState";
import { useAppStore } from "../store/useAppStore";
import { formatBRL, formatPercent } from "../lib/format";
import { agoraISO } from "../lib/date";
import { CartaoIndicador } from "../components/financeiro/CartaoIndicador";
import { GraficoBarrasSemanal } from "../components/financeiro/GraficoBarrasSemanal";
import { GraficoRosca } from "../components/financeiro/GraficoRosca";
import { GraficoLinhaClientes } from "../components/financeiro/GraficoLinhaClientes";
import {
  chaveDoMes,
  chaveDoMesAnterior,
  distribuicaoPorPacote,
  evolucaoClientes,
  investimentoEmEstoque,
  lucroPorPacote,
  pedidosAReceber,
  pedidosPagos,
  resumoDoMes,
  serieSemanal,
  ticketMedioHistorico,
  variacaoPercentual,
} from "../components/financeiro/financeiroHelpers";

export default function Financeiro() {
  const pedidos = useAppStore((state) => state.pedidos);
  const clientes = useAppStore((state) => state.clientes);
  const itensEstoque = useAppStore((state) => state.itensEstoque);
  const pacotes = useAppStore((state) => state.configuracao.pacotes);

  const historicoPago = pedidosPagos(pedidos);

  if (historicoPago.length === 0) {
    return (
      <EmptyState
        icon={Wallet}
        titulo="Os números aparecem depois da primeira venda paga"
        descricao="Faturamento, custo e lucro são calculados a partir dos pedidos marcados como pagos. Nada aparece aqui até a primeira venda ser fechada e paga — nenhum valor é estimado ou inventado."
      />
    );
  }

  const chaveMesAtual = chaveDoMes(agoraISO());
  const chaveMesPassado = chaveDoMesAnterior(chaveMesAtual);
  const mesAtual = resumoDoMes(pedidos, chaveMesAtual);
  const mesPassado = resumoDoMes(pedidos, chaveMesPassado);
  const variacaoFaturamento = variacaoPercentual(mesAtual.faturamento, mesPassado.faturamento);

  const aReceber = pedidosAReceber(pedidos);
  const totalAReceber = aReceber.reduce((soma, p) => soma + p.valorCobrado, 0);

  const investimentoEstoqueAtual = investimentoEmEstoque(itensEstoque);
  const ticketMedio = ticketMedioHistorico(pedidos);
  const porPacote = lucroPorPacote(pedidos, pacotes);
  const distribuicao = distribuicaoPorPacote(pedidos, pacotes);
  const semanas = serieSemanal(pedidos);
  const clientesAoLongoDoTempo = evolucaoClientes(clientes);

  function nomeCliente(clienteId: string) {
    return clientes.find((c) => c.id === clienteId)?.nomeEstabelecimento ?? "Cliente não encontrado";
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <CartaoIndicador
          rotulo="Faturamento do mês"
          valor={formatBRL(mesAtual.faturamento)}
          variacao={
            variacaoFaturamento === null
              ? null
              : {
                  texto: `${variacaoFaturamento >= 0 ? "+" : ""}${formatPercent(variacaoFaturamento)} vs. mês anterior`,
                  positiva: variacaoFaturamento >= 0,
                }
          }
          nota={variacaoFaturamento === null ? "sem dado do mês anterior para comparar" : undefined}
        />
        <CartaoIndicador rotulo="Custo do mês" valor={formatBRL(mesAtual.custo)} nota="produtos vendidos" />
        <CartaoIndicador
          rotulo="Lucro bruto do mês"
          valor={formatBRL(mesAtual.lucro)}
          nota={`margem de ${formatPercent(mesAtual.margem)}`}
        />
        <CartaoIndicador
          rotulo="A receber"
          valor={formatBRL(totalAReceber)}
          nota={`${aReceber.length} ${aReceber.length === 1 ? "pedido entregue" : "pedidos entregues"} sem pagamento`}
        />
        <CartaoIndicador
          rotulo="Investimento em estoque"
          valor={formatBRL(investimentoEstoqueAtual)}
          nota="quantidade × custo unitário"
        />
        <CartaoIndicador rotulo="Ticket médio" valor={formatBRL(ticketMedio)} nota="histórico, todos os pedidos pagos" />
      </div>

      {aReceber.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-lg text-primary">Pedidos entregues aguardando pagamento</h2>
          <div className="mt-3 min-w-0 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-secondary">
                  <th className="py-2 pr-4 font-medium">Pedido</th>
                  <th className="py-2 pr-4 font-medium">Cliente</th>
                  <th className="py-2 text-right font-medium">Valor</th>
                </tr>
              </thead>
              <tbody>
                {aReceber.map((pedido) => (
                  <tr key={pedido.id} className="border-b border-border last:border-0">
                    <td className="py-2 pr-4 font-mono text-sm text-secondary">{pedido.codigo}</td>
                    <td className="py-2 pr-4 text-sm text-primary">{nomeCliente(pedido.clienteId)}</td>
                    <td className="py-2 text-right font-mono text-sm text-primary">{formatBRL(pedido.valorCobrado)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-lg text-primary">Faturamento e lucro por semana</h2>
          <p className="text-xs text-secondary">últimas 8 semanas, pedidos pagos</p>
          <div className="mt-2">
            <GraficoBarrasSemanal dados={semanas} />
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-lg text-primary">Vendas por pacote</h2>
          <p className="text-xs text-secondary">pedidos pagos, por pacote vendido</p>
          <div className="mt-2">
            <GraficoRosca dados={distribuicao} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-lg text-primary">Evolução do número de clientes</h2>
          <p className="text-xs text-secondary">total acumulado, por mês de cadastro</p>
          <div className="mt-2">
            {clientesAoLongoDoTempo.length > 1 ? (
              <GraficoLinhaClientes dados={clientesAoLongoDoTempo} />
            ) : (
              <p className="flex h-[260px] items-center justify-center text-sm text-secondary">
                Ainda não há histórico suficiente para uma linha — volte aqui depois de mais um mês de clientes novos.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-lg text-primary">Lucro por pacote</h2>
          <div className="mt-3 flex flex-col gap-2">
            {porPacote.map((item) => (
              <div key={item.pacoteId} className="flex items-center justify-between gap-3 rounded-md bg-card-hover px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm text-primary">{item.nome}</p>
                  <p className="text-xs text-secondary">
                    {item.quantidade} {item.quantidade === 1 ? "venda paga" : "vendas pagas"}
                  </p>
                </div>
                <p className={`shrink-0 font-mono text-sm ${item.lucro >= 0 ? "text-accent" : "text-alert"}`}>
                  {formatBRL(item.lucro)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-secondary">
        O custo de cada pedido usa o custo por placa congelado no momento da venda — mudar os custos unitários em
        Configurações não altera a margem de pedidos já fechados, só a dos próximos.
      </p>
    </div>
  );
}
