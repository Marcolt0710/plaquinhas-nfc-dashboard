import { useEffect, useState } from "react";
import { ArrowLeft, Check, Trash2, TriangleAlert } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { mostrarToast } from "../../store/useUiStore";
import { Badge } from "../Badge";
import { classesBotaoPerigo, classesBotaoPrimario } from "../formClasses";
import { ETAPAS_PEDIDO } from "../../types";
import { TrilhaEtapas } from "./TrilhaEtapas";
import { formatBRL, formatDate } from "../../lib/format";
import {
  TONE_ETAPA,
  custoTotalPedido,
  lucroPedido,
  margemPedido,
  pedidoAtrasado,
  pedidoProximoDoPrazo,
} from "./pedidoHelpers";

interface PainelPedidoProps {
  pedidoId: string;
  onFechar: () => void;
  onAbrirCliente?: (clienteId: string) => void;
}

export function PainelPedido({ pedidoId, onFechar, onAbrirCliente }: PainelPedidoProps) {
  const pedido = useAppStore((state) => state.pedidos.find((p) => p.id === pedidoId));
  const cliente = useAppStore((state) => state.clientes.find((c) => c.id === pedido?.clienteId));
  const avancarEtapaPedido = useAppStore((state) => state.avancarEtapaPedido);
  const deletePedido = useAppStore((state) => state.deletePedido);
  const [erro, setErro] = useState<string | null>(null);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);

  useEffect(() => {
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === "Escape") onFechar();
    }
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [onFechar]);

  if (!pedido) return null;

  const indiceAtual = ETAPAS_PEDIDO.findIndex((e) => e.value === pedido.etapa);
  const proximaEtapa = ETAPAS_PEDIDO[indiceAtual + 1];
  const atrasado = pedidoAtrasado(pedido);
  const proximoDoPrazo = pedidoProximoDoPrazo(pedido);

  function aoAvancar() {
    if (!proximaEtapa || !pedido) return;
    const resultado = avancarEtapaPedido(pedido.id, proximaEtapa.value);
    if (resultado.ok) {
      setErro(null);
      mostrarToast(`Pedido movido para ${proximaEtapa.label}.`);
    } else {
      setErro(resultado.erro ?? "Não foi possível avançar a etapa.");
    }
  }

  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onFechar}
        className="anim-fundo absolute inset-0 hidden bg-black/60 md:block"
      />
      <div className="anim-painel absolute inset-y-0 right-0 flex w-full flex-col overflow-y-auto border-l border-border bg-page md:w-[440px] md:bg-card">
        <div className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-4 md:px-5">
          <button
            type="button"
            onClick={onFechar}
            className="flex items-center gap-1.5 rounded-md p-1.5 text-sm text-secondary hover:bg-card-hover hover:text-primary"
          >
            <ArrowLeft size={18} />
            Voltar
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-5 px-4 py-5 md:px-5">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-mono text-xl text-primary">{pedido.codigo}</h2>
              <Badge tone={TONE_ETAPA[pedido.etapa]}>{ETAPAS_PEDIDO[indiceAtual].label}</Badge>
            </div>
            <button
              type="button"
              onClick={() => cliente && onAbrirCliente?.(cliente.id)}
              disabled={!cliente}
              className="mt-1 text-sm text-secondary underline-offset-2 hover:text-primary hover:underline disabled:no-underline"
            >
              {cliente?.nomeEstabelecimento ?? "Cliente removido"}
            </button>
          </div>

          {atrasado && (
            <div className="flex items-start gap-2 rounded-md border border-alert/30 bg-alert-tint p-3 text-sm text-alert">
              <TriangleAlert size={16} className="mt-0.5 shrink-0" />
              <span>Entrega prometida para {formatDate(pedido.dataPrometidaEntrega)} — já venceu.</span>
            </div>
          )}
          {!atrasado && proximoDoPrazo && (
            <div className="flex items-start gap-2 rounded-md border border-attention/30 bg-attention-tint p-3 text-sm text-attention">
              <TriangleAlert size={16} className="mt-0.5 shrink-0" />
              <span>Faltam menos de 24h para a entrega prometida.</span>
            </div>
          )}
          {erro && (
            <div className="flex items-start gap-2 rounded-md border border-alert/30 bg-alert-tint p-3 text-sm text-alert">
              <TriangleAlert size={16} className="mt-0.5 shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 rounded-lg border border-border bg-card p-4 md:bg-card-hover">
            <div>
              <p className="text-xs uppercase tracking-wide text-secondary">Valor</p>
              <p className="mt-1 font-mono text-md text-primary">{formatBRL(pedido.valorCobrado)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-secondary">Custo</p>
              <p className="mt-1 font-mono text-md text-primary">{formatBRL(custoTotalPedido(pedido))}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-secondary">Lucro</p>
              <p className={`mt-1 font-mono text-md ${lucroPedido(pedido) >= 0 ? "text-accent" : "text-alert"}`}>
                {formatBRL(lucroPedido(pedido))}
              </p>
              <p className="text-xs text-secondary">{margemPedido(pedido).toFixed(0)}% de margem</p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-secondary">Progresso da produção</p>
            {/* Resumo antes do detalhe: a trilha responde "quanto falta"
                num relance; a lista abaixo diz exatamente o quê. */}
            <div className="mb-3">
              <TrilhaEtapas etapa={pedido.etapa} comLegenda />
            </div>
            <ul className="flex flex-col gap-1">
              {ETAPAS_PEDIDO.map((etapa, indice) => {
                const feito = indice <= indiceAtual;
                const atual = indice === indiceAtual;
                return (
                  <li key={etapa.value} className="flex items-center gap-2.5 py-1">
                    {/* Só a etapa atual usa o verde cheio. Antes todas as
                        concluídas usavam, e um pedido entregue virava sete
                        círculos verdes — o destaque deixava de destacar. */}
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
                        atual
                          ? "bg-accent text-accent-ink"
                          : feito
                            ? "bg-card-hover text-accent"
                            : "bg-card-hover text-secondary"
                      }`}
                    >
                      {feito ? <Check size={12} aria-hidden="true" /> : indice + 1}
                    </span>
                    <span
                      className={`text-sm ${
                        indice === indiceAtual ? "text-primary" : feito ? "text-secondary" : "text-disabled"
                      }`}
                    >
                      {etapa.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-secondary">Data da venda</p>
              <p className="mt-1 text-primary">{formatDate(pedido.dataVenda)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-secondary">Entrega prometida</p>
              <p className={`mt-1 ${atrasado ? "text-alert" : proximoDoPrazo ? "text-attention" : "text-primary"}`}>
                {formatDate(pedido.dataPrometidaEntrega)}
              </p>
            </div>
            {pedido.dataEntregaReal && (
              <div>
                <p className="text-xs uppercase tracking-wide text-secondary">Entregue em</p>
                <p className="mt-1 text-primary">{formatDate(pedido.dataEntregaReal)}</p>
              </div>
            )}
            {pedido.dataRetorno30Dias && (
              <div>
                <p className="text-xs uppercase tracking-wide text-secondary">Retorno de 30 dias</p>
                <p className="mt-1 text-primary">{formatDate(pedido.dataRetorno30Dias)}</p>
              </div>
            )}
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-secondary">Etiquetas NFC</p>
            {pedido.etiquetasIds.length === 0 ? (
              <p className="mt-1 text-sm text-secondary">
                Nenhuma etiqueta associada ainda. Etiquetas são geridas no módulo Etiquetas NFC, que chega
                na próxima fase.
              </p>
            ) : (
              <p className="mt-1 text-sm text-primary">
                {pedido.etiquetasIds.length} etiqueta{pedido.etiquetasIds.length > 1 ? "s" : ""} associada
                {pedido.etiquetasIds.length > 1 ? "s" : ""}.
              </p>
            )}
          </div>

          {pedido.observacoes && (
            <div>
              <p className="text-xs uppercase tracking-wide text-secondary">Observações</p>
              <p className="mt-1 text-sm text-primary">{pedido.observacoes}</p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 flex shrink-0 flex-col gap-2 border-t border-border bg-page p-4 md:bg-card md:px-5">
          {proximaEtapa ? (
            <button type="button" className={classesBotaoPrimario} onClick={aoAvancar}>
              Avançar para "{proximaEtapa.label}"
            </button>
          ) : (
            <p className="text-center text-sm text-secondary">Pedido concluído — já está pago.</p>
          )}
          {confirmandoExclusao ? (
            <div className="flex items-center gap-2 rounded-md border border-alert/30 bg-alert-tint p-3">
              <p className="flex-1 text-sm text-alert">Excluir este pedido? Não é possível desfazer.</p>
              <button
                type="button"
                className="text-sm font-medium text-alert underline"
                onClick={() => {
                  deletePedido(pedido.id);
                  onFechar();
                }}
              >
                Excluir
              </button>
              <button
                type="button"
                className="text-sm text-secondary underline"
                onClick={() => setConfirmandoExclusao(false)}
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              type="button"
              className={`${classesBotaoPerigo} flex items-center justify-center gap-2`}
              onClick={() => setConfirmandoExclusao(true)}
            >
              <Trash2 size={16} /> Excluir pedido
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
