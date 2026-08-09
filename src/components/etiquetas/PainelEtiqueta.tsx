import { useEffect, useState } from "react";
import { ArrowLeft, History, TriangleAlert } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { Badge } from "../Badge";
import { classesBotaoPerigo, classesBotaoSecundario, classesCampo, classesLabel } from "../formClasses";
import { formatDate, formatDateTime } from "../../lib/format";
import {
  LABEL_RESULTADO_TESTE,
  LABEL_SITUACAO_ETIQUETA,
  TONE_RESULTADO_TESTE,
  TONE_SITUACAO_ETIQUETA,
} from "./etiquetaHelpers";

interface PainelEtiquetaProps {
  etiquetaId: string;
  onFechar: () => void;
  onAbrirPedido?: (pedidoId: string) => void;
}

export function PainelEtiqueta({ etiquetaId, onFechar, onAbrirPedido }: PainelEtiquetaProps) {
  const etiqueta = useAppStore((state) => state.etiquetas.find((e) => e.id === etiquetaId));
  const pedido = useAppStore((state) =>
    etiqueta?.pedidoId ? state.pedidos.find((p) => p.id === etiqueta.pedidoId) : undefined,
  );
  const cliente = useAppStore((state) =>
    pedido ? state.clientes.find((c) => c.id === pedido.clienteId) : undefined,
  );
  const marcarEtiquetaDefeito = useAppStore((state) => state.marcarEtiquetaDefeito);

  const [marcandoDefeito, setMarcandoDefeito] = useState(false);
  const [motivoDefeito, setMotivoDefeito] = useState("");

  useEffect(() => {
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === "Escape" && !marcandoDefeito) onFechar();
    }
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [onFechar, marcandoDefeito]);

  if (!etiqueta) return null;

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
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-mono text-xl text-primary">{etiqueta.codigoInterno}</h2>
              <Badge tone={TONE_SITUACAO_ETIQUETA[etiqueta.situacao]}>
                {LABEL_SITUACAO_ETIQUETA[etiqueta.situacao]}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-secondary">UID: {etiqueta.uid ?? "não lido"}</p>
          </div>

          {etiqueta.situacao === "com_defeito" && etiqueta.motivoDefeito && (
            <div className="flex items-start gap-2 rounded-md border border-alert/30 bg-alert-tint p-3 text-sm text-alert">
              <TriangleAlert size={16} className="mt-0.5 shrink-0" />
              <span className="min-w-0">{etiqueta.motivoDefeito}</span>
            </div>
          )}

          <div>
            <p className="text-xs uppercase tracking-wide text-secondary">Link gravado atualmente</p>
            <p className="mt-1 break-all font-mono text-sm text-primary">
              {etiqueta.linkGravado ?? "— nenhum link gravado —"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-secondary">Data da gravação</p>
              <p className="mt-1 text-primary">{formatDate(etiqueta.dataGravacao)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-secondary">Gravado por</p>
              <p className="mt-1 text-primary">{etiqueta.gravadoPor ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-secondary">Resultado do teste</p>
              <Badge tone={TONE_RESULTADO_TESTE[etiqueta.resultadoTeste]} className="mt-1">
                {LABEL_RESULTADO_TESTE[etiqueta.resultadoTeste]}
              </Badge>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-secondary">Aparelho do teste</p>
              <p className="mt-1 text-primary">{etiqueta.aparelhoTeste ?? "—"}</p>
            </div>
          </div>

          {pedido && (
            <div className="rounded-md border border-border bg-card-hover p-3">
              <p className="text-xs uppercase tracking-wide text-secondary">Pedido vinculado</p>
              <button
                type="button"
                onClick={() => onAbrirPedido?.(pedido.id)}
                disabled={!onAbrirPedido}
                className="mt-1 block text-left text-sm text-accent underline disabled:no-underline disabled:text-primary"
              >
                {pedido.codigo} — {cliente?.nomeEstabelecimento ?? "cliente não encontrado"}
              </button>
            </div>
          )}

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wide text-secondary">
              <History size={14} />
              Histórico de regravações ({etiqueta.historicoRegravacoes.length})
            </p>
            {etiqueta.historicoRegravacoes.length === 0 ? (
              <p className="text-sm text-secondary">Esta etiqueta nunca foi regravada.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {[...etiqueta.historicoRegravacoes].reverse().map((regravacao) => (
                  <li
                    key={regravacao.id}
                    className="rounded-md border border-border bg-card p-3 md:bg-card-hover"
                  >
                    <p className="font-mono text-xs text-secondary">{formatDateTime(regravacao.data)}</p>
                    <p className="mt-1 break-all font-mono text-sm text-primary">
                      Link anterior: {regravacao.linkAnterior}
                    </p>
                    {regravacao.motivo && (
                      <p className="mt-1 text-sm text-secondary">Motivo: {regravacao.motivo}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {etiqueta.situacao !== "com_defeito" && (
          <div className="sticky bottom-0 flex shrink-0 flex-col gap-2 border-t border-border bg-page p-4 md:bg-card md:px-5">
            {marcandoDefeito ? (
              <div className="flex flex-col gap-2 rounded-md border border-alert/30 bg-alert-tint p-3">
                <label>
                  <span className={`${classesLabel} text-alert`}>Qual foi o defeito?</span>
                  <input
                    className={classesCampo}
                    value={motivoDefeito}
                    onChange={(e) => setMotivoDefeito(e.target.value)}
                    placeholder="Ex.: chip não grava mais"
                    autoFocus
                  />
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={!motivoDefeito.trim()}
                    className="text-sm font-medium text-alert underline disabled:opacity-40"
                    onClick={() => {
                      marcarEtiquetaDefeito(etiqueta.id, motivoDefeito.trim());
                      setMarcandoDefeito(false);
                      setMotivoDefeito("");
                    }}
                  >
                    Confirmar defeito
                  </button>
                  <button
                    type="button"
                    className="text-sm text-secondary underline"
                    onClick={() => setMarcandoDefeito(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className={`${classesBotaoPerigo} flex items-center justify-center gap-2`}
                onClick={() => setMarcandoDefeito(true)}
              >
                <TriangleAlert size={16} /> Marcar com defeito
              </button>
            )}
            <button type="button" className={classesBotaoSecundario} onClick={onFechar}>
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
