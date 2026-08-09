import { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Link as LinkIcon, TriangleAlert } from "lucide-react";
import { Modal } from "../Modal";
import { Badge } from "../Badge";
import {
  classesBotaoPrimario,
  classesBotaoSecundario,
  classesCampo,
  classesLabel,
} from "../formClasses";
import { useAppStore } from "../../store/useAppStore";
import type { ResultadoTeste } from "../../types";
import { TONE_SITUACAO_ETIQUETA, LABEL_SITUACAO_ETIQUETA, etiquetaDisponivelParaGravar } from "./etiquetaHelpers";

interface FluxoGravacaoProps {
  onFechar: () => void;
}

type Passo = "pedido" | "link" | "etiqueta" | "gravador" | "teste" | "concluido";

export function FluxoGravacao({ onFechar }: FluxoGravacaoProps) {
  const pedidos = useAppStore((state) => state.pedidos);
  const clientes = useAppStore((state) => state.clientes);
  const etiquetas = useAppStore((state) => state.etiquetas);
  const gravarEtiqueta = useAppStore((state) => state.gravarEtiqueta);
  const registrarTesteEtiqueta = useAppStore((state) => state.registrarTesteEtiqueta);

  const [passo, setPasso] = useState<Passo>("pedido");
  const [pedidoId, setPedidoId] = useState<string | null>(null);
  const [etiquetaId, setEtiquetaId] = useState<string | null>(null);
  const [motivoRegravacao, setMotivoRegravacao] = useState("");
  const [gravadoPor, setGravadoPor] = useState("");
  const [resultado, setResultado] = useState<ResultadoTeste>("aprovado");
  const [aparelho, setAparelho] = useState("");

  const pedidosPendentes = useMemo(
    () => pedidos.filter((p) => p.etiquetasIds.length < p.numeroPlacas),
    [pedidos],
  );

  const pedido = pedidoId ? pedidos.find((p) => p.id === pedidoId) ?? null : null;
  const cliente = pedido ? clientes.find((c) => c.id === pedido.clienteId) ?? null : null;
  const etiquetasDisponiveis = useMemo(
    () => etiquetas.filter(etiquetaDisponivelParaGravar),
    [etiquetas],
  );
  const etiquetaEscolhida = etiquetaId ? etiquetas.find((e) => e.id === etiquetaId) ?? null : null;
  const regravando = Boolean(
    etiquetaEscolhida?.linkGravado && cliente && etiquetaEscolhida.linkGravado !== cliente.linkEncurtado,
  );

  const placasGravadas = pedido?.etiquetasIds.length ?? 0;
  const faltamPlacas = pedido ? pedido.numeroPlacas - placasGravadas : 0;

  function confirmarGravacao() {
    if (!pedido || !cliente || !etiquetaId || !gravadoPor.trim()) return;
    gravarEtiqueta(etiquetaId, {
      pedidoId: pedido.id,
      linkGravado: cliente.linkEncurtado,
      gravadoPor: gravadoPor.trim(),
      motivoRegravacao: regravando ? motivoRegravacao.trim() : undefined,
    });
    setPasso("teste");
  }

  function confirmarTeste() {
    if (!etiquetaId || !aparelho.trim()) return;
    registrarTesteEtiqueta(etiquetaId, { resultado, aparelho: aparelho.trim() });
    setPasso("concluido");
  }

  function gravarProximaPlaca() {
    setEtiquetaId(null);
    setMotivoRegravacao("");
    setResultado("aprovado");
    setAparelho("");
    setPasso("etiqueta");
  }

  return (
    <Modal titulo="Gravar etiqueta" onFechar={onFechar} largura="md">
      {passo === "pedido" && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-secondary">
            Escolha o pedido que ainda precisa de etiqueta gravada.
          </p>
          {pedidosPendentes.length === 0 ? (
            <p className="rounded-md border border-border bg-card-hover p-4 text-sm text-secondary">
              Nenhum pedido está faltando etiqueta no momento — todos já têm uma etiqueta por placa.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {pedidosPendentes.map((p) => {
                const c = clientes.find((cli) => cli.id === p.clienteId);
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setPedidoId(p.id);
                        setPasso("link");
                      }}
                      className="flex w-full items-center justify-between rounded-md border border-border p-3 text-left hover:border-border-strong hover:bg-card-hover"
                    >
                      <span>
                        <span className="block font-mono text-sm text-secondary">{p.codigo}</span>
                        <span className="block text-base text-primary">
                          {c?.nomeEstabelecimento ?? "Cliente não encontrado"}
                        </span>
                      </span>
                      <span className="font-mono text-sm text-secondary">
                        {p.etiquetasIds.length}/{p.numeroPlacas} placas
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {passo === "link" && pedido && cliente && (
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => setPasso("pedido")}
            className="flex items-center gap-1.5 text-sm text-secondary hover:text-primary"
          >
            <ArrowLeft size={16} /> Trocar pedido
          </button>
          <div>
            <p className="text-sm text-secondary">
              Pedido <span className="font-mono text-primary">{pedido.codigo}</span> —{" "}
              {cliente.nomeEstabelecimento}
            </p>
            <p className="mt-1 text-sm text-secondary">
              {placasGravadas} de {pedido.numeroPlacas} placas já têm etiqueta gravada.
            </p>
          </div>
          <div className="rounded-md border border-accent/40 bg-accent-tint p-4">
            <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-accent">
              <LinkIcon size={14} /> Confira o link antes de gravar
            </p>
            <p className="mt-2 break-all font-mono text-md text-primary">{cliente.linkEncurtado}</p>
            <p className="mt-2 text-xs text-secondary">
              Este é o link que vai ser gravado na etiqueta. Se estiver errado, corrija o cadastro do
              cliente antes de continuar.
            </p>
          </div>
          <button type="button" className={classesBotaoPrimario} onClick={() => setPasso("etiqueta")}>
            O link está correto, continuar
          </button>
        </div>
      )}

      {passo === "etiqueta" && pedido && cliente && (
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => setPasso("link")}
            className="flex items-center gap-1.5 text-sm text-secondary hover:text-primary"
          >
            <ArrowLeft size={16} /> Voltar
          </button>
          <p className="text-sm text-secondary">
            Escolha a etiqueta física que vai receber o link de {cliente.nomeEstabelecimento}.
          </p>
          {etiquetasDisponiveis.length === 0 ? (
            <p className="rounded-md border border-alert/30 bg-alert-tint p-3 text-sm text-alert">
              Não há etiquetas disponíveis em estoque para gravar. Registre novas etiquetas antes de
              continuar.
            </p>
          ) : (
            <ul className="flex max-h-64 flex-col gap-2 overflow-y-auto">
              {etiquetasDisponiveis.map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => setEtiquetaId(e.id)}
                    className={`flex w-full items-center justify-between rounded-md border p-3 text-left ${
                      etiquetaId === e.id
                        ? "border-accent bg-accent-tint"
                        : "border-border hover:border-border-strong hover:bg-card-hover"
                    }`}
                  >
                    <span className="font-mono text-sm text-primary">{e.codigoInterno}</span>
                    <Badge tone={TONE_SITUACAO_ETIQUETA[e.situacao]}>
                      {LABEL_SITUACAO_ETIQUETA[e.situacao]}
                    </Badge>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {etiquetaEscolhida?.linkGravado && (
            <div className="flex items-start gap-2 rounded-md border border-attention/30 bg-attention-tint p-3 text-sm text-attention">
              <TriangleAlert size={16} className="mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p>Esta etiqueta já tem um link gravado — isso vai ser uma regravação.</p>
                <p className="mt-1 font-mono text-xs">{etiquetaEscolhida.linkGravado}</p>
                <label className="mt-2 block">
                  <span className={classesLabel}>Motivo da regravação</span>
                  <input
                    className={classesCampo}
                    value={motivoRegravacao}
                    onChange={(e) => setMotivoRegravacao(e.target.value)}
                    placeholder="Ex.: etiqueta sobrando de pedido cancelado"
                  />
                </label>
              </div>
            </div>
          )}
          <button
            type="button"
            className={classesBotaoPrimario}
            disabled={!etiquetaId}
            onClick={() => setPasso("gravador")}
          >
            Continuar
          </button>
        </div>
      )}

      {passo === "gravador" && pedido && etiquetaEscolhida && (
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => setPasso("etiqueta")}
            className="flex items-center gap-1.5 text-sm text-secondary hover:text-primary"
          >
            <ArrowLeft size={16} /> Voltar
          </button>
          <p className="text-sm text-secondary">
            Gravando <span className="font-mono text-primary">{etiquetaEscolhida.codigoInterno}</span> para
            o pedido <span className="font-mono text-primary">{pedido.codigo}</span>.
          </p>
          <label>
            <span className={classesLabel}>Quem está gravando</span>
            <input
              className={classesCampo}
              value={gravadoPor}
              onChange={(e) => setGravadoPor(e.target.value)}
              placeholder="Seu nome"
              autoFocus
            />
          </label>
          <button
            type="button"
            className={classesBotaoPrimario}
            disabled={!gravadoPor.trim()}
            onClick={confirmarGravacao}
          >
            Confirmar gravação
          </button>
        </div>
      )}

      {passo === "teste" && etiquetaEscolhida && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-accent">
            <CheckCircle2 size={18} />
            <p className="text-sm">
              Etiqueta <span className="font-mono">{etiquetaEscolhida.codigoInterno}</span> gravada.
              Agora teste antes de guardar para entrega.
            </p>
          </div>
          <label>
            <span className={classesLabel}>Resultado do teste</span>
            <select
              className={classesCampo}
              value={resultado}
              onChange={(e) => setResultado(e.target.value as ResultadoTeste)}
            >
              <option value="aprovado">Aprovado</option>
              <option value="reprovado">Reprovado</option>
            </select>
          </label>
          <label>
            <span className={classesLabel}>Aparelho usado no teste</span>
            <input
              className={classesCampo}
              value={aparelho}
              onChange={(e) => setAparelho(e.target.value)}
              placeholder="Ex.: iPhone 13, Moto G54..."
            />
          </label>
          <button
            type="button"
            className={classesBotaoPrimario}
            disabled={!aparelho.trim()}
            onClick={confirmarTeste}
          >
            Registrar teste
          </button>
        </div>
      )}

      {passo === "concluido" && pedido && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-accent">
            <CheckCircle2 size={18} />
            <p className="text-sm">
              {placasGravadas} de {pedido.numeroPlacas} placas gravadas e testadas para o pedido{" "}
              <span className="font-mono">{pedido.codigo}</span>.
            </p>
          </div>
          {faltamPlacas > 0 ? (
            <button type="button" className={classesBotaoPrimario} onClick={gravarProximaPlaca}>
              Gravar próxima placa deste pedido
            </button>
          ) : (
            <p className="text-sm text-secondary">
              Todas as placas deste pedido já têm etiqueta gravada e testada. O pedido pode avançar para
              entregue no módulo Pedidos.
            </p>
          )}
          <button type="button" className={classesBotaoSecundario} onClick={onFechar}>
            Concluir
          </button>
        </div>
      )}
    </Modal>
  );
}
