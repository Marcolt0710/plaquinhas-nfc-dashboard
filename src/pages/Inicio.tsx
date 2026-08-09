import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ClipboardList, Footprints, Nfc, Plus } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { Badge } from "../components/Badge";
import { EmptyState } from "../components/EmptyState";
import { classesBotaoSecundario } from "../components/formClasses";
import { formatBRL, formatDate } from "../lib/format";
import { agoraISO, ehHojeOuAntes } from "../lib/date";
import { ETAPAS_PEDIDO } from "../types";
import { pedidoAtrasado, TONE_ETAPA } from "../components/pedidos/pedidoHelpers";
import { itemAbaixoDoMinimo } from "../components/estoque/estoqueHelpers";
import { retornoVencido } from "../components/prospeccao/leadHelpers";
import { chaveDoMes, pedidosAReceber, resumoDoMes } from "../components/financeiro/financeiroHelpers";
import { CartaoNumeroGrande } from "../components/inicio/CartaoNumeroGrande";
import { FaixaAlertas, type AlertaInicio } from "../components/inicio/FaixaAlertas";
import { PainelPedido } from "../components/pedidos/PainelPedido";

const LABEL_ETAPA = Object.fromEntries(ETAPAS_PEDIDO.map((e) => [e.value, e.label])) as Record<
  string,
  string
>;

const ETAPAS_EM_PRODUCAO = ETAPAS_PEDIDO.filter((e) => e.value !== "entregue" && e.value !== "pago").map(
  (e) => e.value,
);

export default function Inicio() {
  const navigate = useNavigate();
  const pedidos = useAppStore((state) => state.pedidos);
  const clientes = useAppStore((state) => state.clientes);
  const leads = useAppStore((state) => state.leads);
  const itensEstoque = useAppStore((state) => state.itensEstoque);

  const [pedidoSelecionadoId, setPedidoSelecionadoId] = useState<string | null>(null);

  function nomeCliente(clienteId: string) {
    return clientes.find((c) => c.id === clienteId)?.nomeEstabelecimento ?? "Cliente removido";
  }

  // --- Faixa de alertas -----------------------------------------------
  const alertas = useMemo(() => {
    const lista: AlertaInicio[] = [];

    const pedidosAtrasados = pedidos.filter(pedidoAtrasado);
    if (pedidosAtrasados.length > 0) {
      lista.push({
        chave: "atraso",
        icone: "atraso",
        severidade: "alerta",
        rota: "/pedidos",
        texto:
          pedidosAtrasados.length === 1
            ? "1 pedido está com a entrega atrasada"
            : `${pedidosAtrasados.length} pedidos estão com a entrega atrasada`,
      });
    }

    const itensBaixos = itensEstoque.filter(itemAbaixoDoMinimo);
    if (itensBaixos.length > 0) {
      lista.push({
        chave: "estoque",
        icone: "estoque",
        severidade: "atencao",
        rota: "/estoque",
        texto:
          itensBaixos.length === 1
            ? `${itensBaixos[0].nome} está abaixo do estoque mínimo`
            : `${itensBaixos.length} itens de estoque estão abaixo do mínimo`,
      });
    }

    const retornos30 = pedidos.filter(
      (p) => !p.retornoFeito && p.dataRetorno30Dias && ehHojeOuAntes(p.dataRetorno30Dias),
    );
    if (retornos30.length > 0) {
      lista.push({
        chave: "retorno30",
        icone: "retorno",
        severidade: "atencao",
        rota: "/pedidos",
        texto:
          retornos30.length === 1
            ? "1 retorno de 30 dias está na hora de fazer"
            : `${retornos30.length} retornos de 30 dias estão na hora de fazer`,
      });
    }

    return lista;
  }, [pedidos, itensEstoque]);

  // --- Quatro números grandes -------------------------------------------
  const pedidosEmProducao = pedidos.filter((p) => ETAPAS_EM_PRODUCAO.includes(p.etapa));
  const aReceber = pedidosAReceber(pedidos);
  const totalAReceber = aReceber.reduce((soma, p) => soma + p.valorCobrado, 0);
  const resumoMesAtual = resumoDoMes(pedidos, chaveDoMes(agoraISO()));

  // --- Para hoje -----------------------------------------------------
  const entregasParaHoje = pedidos.filter(
    (p) => p.etapa !== "entregue" && p.etapa !== "pago" && ehHojeOuAntes(p.dataPrometidaEntrega),
  );
  const leadsParaRetornar = leads.filter(retornoVencido);
  const retornos30ParaHoje = pedidos.filter(
    (p) => !p.retornoFeito && p.dataRetorno30Dias && ehHojeOuAntes(p.dataRetorno30Dias),
  );
  const nadaParaHoje =
    entregasParaHoje.length === 0 && leadsParaRetornar.length === 0 && retornos30ParaHoje.length === 0;

  // --- Últimos pedidos -------------------------------------------------
  const ultimosPedidos = [...pedidos]
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
    .slice(0, 6);

  if (pedidos.length === 0 && leads.length === 0 && clientes.length === 0) {
    return (
      <EmptyState
        icon={Footprints}
        titulo="Tudo pronto para começar"
        descricao="Assim que você cadastrar leads, pedidos e etiquetas, esta tela reúne o que precisa de atenção hoje: entregas, retornos e alertas de estoque."
        acaoRotulo="Ir para Prospecção"
        onAcao={() => navigate("/prospeccao")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <FaixaAlertas alertas={alertas} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <CartaoNumeroGrande rotulo="Pedidos em produção" valor={String(pedidosEmProducao.length)} />
        <CartaoNumeroGrande
          rotulo="A receber"
          valor={formatBRL(totalAReceber)}
          nota={`${aReceber.length} ${aReceber.length === 1 ? "pedido entregue" : "pedidos entregues"}`}
        />
        <CartaoNumeroGrande
          rotulo="Faturamento do mês"
          valor={formatBRL(resumoMesAtual.faturamento)}
          tom={resumoMesAtual.faturamento > 0 ? "accent" : "primary"}
        />
        <CartaoNumeroGrande
          rotulo="Lucro do mês"
          valor={formatBRL(resumoMesAtual.lucro)}
          nota={`margem de ${resumoMesAtual.margem.toFixed(1).replace(".", ",")}%`}
          tom={resumoMesAtual.lucro > 0 ? "accent" : resumoMesAtual.lucro < 0 ? "alert" : "primary"}
        />
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-lg text-primary">Para hoje</h2>
        {nadaParaHoje ? (
          <p className="mt-3 flex items-center gap-2 text-sm text-secondary">
            <CheckCircle2 size={16} className="text-accent" />
            Está tudo em dia — nenhuma entrega, retorno de lead ou acompanhamento de 30 dias pendente para hoje.
          </p>
        ) : (
          <div className="mt-3 flex flex-col gap-4">
            {entregasParaHoje.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wide text-secondary">Entregas</p>
                <div className="mt-2 flex flex-col gap-1.5">
                  {entregasParaHoje.map((pedido) => (
                    <button
                      key={pedido.id}
                      type="button"
                      onClick={() => setPedidoSelecionadoId(pedido.id)}
                      className="flex items-center justify-between gap-2 rounded-md bg-card-hover px-3 py-2 text-left text-sm hover:bg-border/40"
                    >
                      <span className="min-w-0 truncate text-primary">
                        <span className="font-mono text-secondary">{pedido.codigo}</span> —{" "}
                        {nomeCliente(pedido.clienteId)}
                      </span>
                      <span className="shrink-0 text-xs text-alert">{formatDate(pedido.dataPrometidaEntrega)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {leadsParaRetornar.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wide text-secondary">Leads para revisitar</p>
                <div className="mt-2 flex flex-col gap-1.5">
                  {leadsParaRetornar.map((lead) => (
                    <button
                      key={lead.id}
                      type="button"
                      onClick={() => navigate("/prospeccao")}
                      className="flex items-center justify-between gap-2 rounded-md bg-card-hover px-3 py-2 text-left text-sm hover:bg-border/40"
                    >
                      <span className="min-w-0 truncate text-primary">{lead.nomeEstabelecimento}</span>
                      <span className="shrink-0 text-xs text-attention">{formatDate(lead.dataRetorno)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {retornos30ParaHoje.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wide text-secondary">Retornos de 30 dias</p>
                <div className="mt-2 flex flex-col gap-1.5">
                  {retornos30ParaHoje.map((pedido) => (
                    <button
                      key={pedido.id}
                      type="button"
                      onClick={() => setPedidoSelecionadoId(pedido.id)}
                      className="flex items-center justify-between gap-2 rounded-md bg-card-hover px-3 py-2 text-left text-sm hover:bg-border/40"
                    >
                      <span className="min-w-0 truncate text-primary">{nomeCliente(pedido.clienteId)}</span>
                      <span className="shrink-0 text-xs text-attention">{formatDate(pedido.dataRetorno30Dias)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {ultimosPedidos.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-lg text-primary">Últimos pedidos</h2>
          <div className="mt-3 flex flex-col gap-1.5">
            {ultimosPedidos.map((pedido) => (
              <button
                key={pedido.id}
                type="button"
                onClick={() => setPedidoSelecionadoId(pedido.id)}
                className="flex items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-card-hover"
              >
                <span className="min-w-0 truncate">
                  <span className="font-mono text-secondary">{pedido.codigo}</span>{" "}
                  <span className="text-primary">{nomeCliente(pedido.clienteId)}</span>
                </span>
                <Badge tone={TONE_ETAPA[pedido.etapa]}>{LABEL_ETAPA[pedido.etapa]}</Badge>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => navigate("/pedidos")}
          className={`flex items-center gap-1.5 ${classesBotaoSecundario}`}
        >
          <Plus size={16} /> Novo pedido
        </button>
        <button
          type="button"
          onClick={() => navigate("/prospeccao")}
          className={`flex items-center gap-1.5 ${classesBotaoSecundario}`}
        >
          <Footprints size={16} /> Novo lead
        </button>
        <button
          type="button"
          onClick={() => navigate("/etiquetas")}
          className={`flex items-center gap-1.5 ${classesBotaoSecundario}`}
        >
          <Nfc size={16} /> Gravar etiqueta
        </button>
        <button
          type="button"
          onClick={() => navigate("/pedidos")}
          className={`ml-auto hidden items-center gap-1.5 text-sm text-secondary hover:text-primary sm:flex`}
        >
          <ClipboardList size={14} /> Ver todos os pedidos
        </button>
      </div>

      {pedidoSelecionadoId && (
        <PainelPedido pedidoId={pedidoSelecionadoId} onFechar={() => setPedidoSelecionadoId(null)} />
      )}
    </div>
  );
}
