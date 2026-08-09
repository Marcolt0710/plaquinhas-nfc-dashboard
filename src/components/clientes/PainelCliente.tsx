import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ClipboardList, Link as LinkIcon, MapPin, Phone, Trash2 } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { Badge } from "../Badge";
import { EmptyState } from "../EmptyState";
import { classesBotaoPerigo } from "../formClasses";
import { ETAPAS_PEDIDO } from "../../types";
import type { Pedido } from "../../types";
import { formatBRL, formatDate } from "../../lib/format";
import { TONE_ETAPA } from "../pedidos/pedidoHelpers";

interface PainelClienteProps {
  clienteId: string;
  onFechar: () => void;
  onAbrirPedido?: (pedidoId: string) => void;
}

const LABEL_ETAPA = Object.fromEntries(ETAPAS_PEDIDO.map((e) => [e.value, e.label])) as Record<
  Pedido["etapa"],
  string
>;

export function PainelCliente({ clienteId, onFechar, onAbrirPedido }: PainelClienteProps) {
  const cliente = useAppStore((state) => state.clientes.find((c) => c.id === clienteId));
  const clientes = useAppStore((state) => state.clientes);
  const todosPedidos = useAppStore((state) => state.pedidos);
  const pedidos = useMemo(
    () => todosPedidos.filter((p) => p.clienteId === clienteId),
    [todosPedidos, clienteId],
  );
  const deleteCliente = useAppStore((state) => state.deleteCliente);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);

  useEffect(() => {
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === "Escape") onFechar();
    }
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [onFechar]);

  if (!cliente) return null;

  const indicador = cliente.indicadoPorClienteId
    ? clientes.find((c) => c.id === cliente.indicadoPorClienteId)
    : null;

  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onFechar}
        className="absolute inset-0 hidden bg-black/60 md:block"
      />
      <div className="absolute inset-y-0 right-0 flex w-full flex-col overflow-y-auto border-l border-border bg-page md:w-[440px] md:bg-card">
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
            <h2 className="text-xl text-primary">{cliente.nomeEstabelecimento}</h2>
            {cliente.endereco && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-secondary">
                <MapPin size={14} /> {cliente.endereco}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-secondary">Responsável</p>
              <p className="mt-1 text-primary">{cliente.nomeResponsavel || "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-secondary">Telefone</p>
              <p className="mt-1 flex items-center gap-1.5 font-mono text-primary">
                {cliente.telefoneResponsavel ? (
                  <>
                    <Phone size={13} /> {cliente.telefoneResponsavel}
                  </>
                ) : (
                  "—"
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 md:bg-card-hover">
            <div>
              <p className="text-xs uppercase tracking-wide text-secondary">Link de avaliação do Google</p>
              <p className="mt-1 break-all font-mono text-xs text-primary">
                {cliente.linkAvaliacaoGoogle || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-secondary">
                Link encurtado (gravado na etiqueta)
              </p>
              <p className="mt-1 flex items-center gap-1.5 break-all font-mono text-xs text-accent">
                {cliente.linkEncurtado ? (
                  <>
                    <LinkIcon size={12} className="shrink-0" /> {cliente.linkEncurtado}
                  </>
                ) : (
                  <span className="text-secondary">—</span>
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-secondary">Primeiro pedido</p>
              <p className="mt-1 text-primary">{formatDate(cliente.dataPrimeiroPedido)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-secondary">Indicado por</p>
              <p className="mt-1 text-primary">{indicador?.nomeEstabelecimento ?? "Ninguém"}</p>
            </div>
          </div>

          {cliente.observacoes && (
            <div>
              <p className="text-xs uppercase tracking-wide text-secondary">Observações</p>
              <p className="mt-1 text-sm text-primary">{cliente.observacoes}</p>
            </div>
          )}

          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-secondary">
              Histórico de pedidos ({pedidos.length})
            </p>
            {pedidos.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                titulo="Nenhum pedido ainda"
                descricao="Os pedidos deste cliente aparecem aqui assim que forem registrados."
              />
            ) : (
              <ul className="flex flex-col gap-2">
                {pedidos.map((pedido) => (
                  <li key={pedido.id}>
                    <button
                      type="button"
                      onClick={() => onAbrirPedido?.(pedido.id)}
                      className="flex w-full items-center justify-between gap-2 rounded-md border border-border bg-card p-3 text-left hover:border-border-strong"
                    >
                      <div>
                        <p className="font-mono text-xs text-secondary">{pedido.codigo}</p>
                        <p className="text-sm text-primary">
                          {pedido.numeroPlacas} placa{pedido.numeroPlacas > 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge tone={TONE_ETAPA[pedido.etapa]}>{LABEL_ETAPA[pedido.etapa]}</Badge>
                        <span className="font-mono text-xs text-secondary">
                          {formatBRL(pedido.valorCobrado)}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 flex shrink-0 flex-col gap-2 border-t border-border bg-page p-4 md:bg-card md:px-5">
          {pedidos.length > 0 ? (
            <p className="rounded-md border border-border bg-card-hover p-3 text-center text-xs text-secondary">
              Este cliente tem {pedidos.length} pedido{pedidos.length > 1 ? "s" : ""} registrado
              {pedidos.length > 1 ? "s" : ""} e não pode ser excluído. Para remover, exclua antes os
              pedidos vinculados.
            </p>
          ) : confirmandoExclusao ? (
            <div className="flex items-center gap-2 rounded-md border border-alert/30 bg-alert-tint p-3">
              <p className="flex-1 text-sm text-alert">Excluir este cliente? Não é possível desfazer.</p>
              <button
                type="button"
                className="text-sm font-medium text-alert underline"
                onClick={() => {
                  deleteCliente(cliente.id);
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
              <Trash2 size={16} /> Excluir cliente
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
