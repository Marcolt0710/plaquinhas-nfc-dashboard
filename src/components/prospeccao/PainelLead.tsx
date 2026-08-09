import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, Star, Trash2, TriangleAlert } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { Badge } from "../Badge";
import { classesBotaoPerigo, classesBotaoPrimario } from "../formClasses";
import { CATEGORIAS_LEAD } from "../../types";
import { formatDate, formatDateTime } from "../../lib/format";
import {
  LABEL_SITUACAO,
  TONE_SITUACAO,
  avaliacoesAcimaDoMaximo,
  notaAbaixoDoMinimo,
  retornoVencido,
} from "./leadHelpers";
import { ModalRegistrarVisita } from "./ModalRegistrarVisita";

interface PainelLeadProps {
  leadId: string;
  onFechar: () => void;
}

export function PainelLead({ leadId, onFechar }: PainelLeadProps) {
  const lead = useAppStore((state) => state.leads.find((l) => l.id === leadId));
  const deleteLead = useAppStore((state) => state.deleteLead);
  const [modalVisitaAberto, setModalVisitaAberto] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);

  useEffect(() => {
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === "Escape" && !modalVisitaAberto) onFechar();
    }
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [onFechar, modalVisitaAberto]);

  if (!lead) return null;

  const categoriaLabel = CATEGORIAS_LEAD.find((c) => c.value === lead.categoria)?.label ?? lead.categoria;

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
              <h2 className="text-xl text-primary">{lead.nomeEstabelecimento}</h2>
              <Badge tone={TONE_SITUACAO[lead.situacao]}>{LABEL_SITUACAO[lead.situacao]}</Badge>
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-secondary">
              <MapPin size={14} /> {lead.endereco || lead.rua}
            </p>
            <p className="mt-1 text-sm text-secondary">{categoriaLabel}</p>
          </div>

          {notaAbaixoDoMinimo(lead) && (
            <div className="flex items-start gap-2 rounded-md border border-alert/30 bg-alert-tint p-3 text-sm text-alert">
              <TriangleAlert size={16} className="mt-0.5 shrink-0" />
              <span>
                Nota abaixo de 3,5 — não vendemos aqui. A plaquinha aumenta o volume de avaliação e
                derruba ainda mais a nota de quem tem um problema real.
              </span>
            </div>
          )}
          {avaliacoesAcimaDoMaximo(lead) && (
            <div className="flex items-start gap-2 rounded-md border border-alert/30 bg-alert-tint p-3 text-sm text-alert">
              <TriangleAlert size={16} className="mt-0.5 shrink-0" />
              <span>Mais de 500 avaliações — a dor de ter poucas avaliações não existe aqui.</span>
            </div>
          )}
          {retornoVencido(lead) && (
            <div className="flex items-start gap-2 rounded-md border border-attention/30 bg-attention-tint p-3 text-sm text-attention">
              <TriangleAlert size={16} className="mt-0.5 shrink-0" />
              <span>Retorno marcado para {formatDate(lead.dataRetorno)} — já venceu.</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-card p-4 md:bg-card-hover">
            <div>
              <p className="text-xs uppercase tracking-wide text-secondary">Nota no Google</p>
              <p className="mt-1 flex items-center gap-1 font-mono text-md text-primary">
                {lead.notaGoogle !== null ? (
                  <>
                    <Star size={14} className="text-attention" /> {lead.notaGoogle.toFixed(1)}
                  </>
                ) : (
                  "—"
                )}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-secondary">Avaliações</p>
              <p className="mt-1 font-mono text-md text-primary">{lead.numeroAvaliacoes ?? "—"}</p>
            </div>
            {lead.vizinhoReferencia && (
              <div className="col-span-2 border-t border-border pt-3">
                <p className="text-xs uppercase tracking-wide text-secondary">Vizinho de referência</p>
                <p className="mt-1 text-sm text-primary">
                  {lead.vizinhoReferencia.nome} —{" "}
                  <span className="font-mono">{lead.vizinhoReferencia.notaGoogle.toFixed(1)}</span> (
                  {lead.vizinhoReferencia.numeroAvaliacoes} avaliações)
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-secondary">Última visita</p>
              <p className="mt-1 text-primary">{formatDate(lead.dataVisita)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-secondary">Data para voltar</p>
              <p className={`mt-1 ${retornoVencido(lead) ? "text-attention" : "text-primary"}`}>
                {formatDate(lead.dataRetorno)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-secondary">Quem atendeu</p>
              <p className="mt-1 text-primary">
                {lead.atendidoPor ?? "—"}
                {lead.eraDono ? " (dono)" : ""}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-secondary">Cliente</p>
              <p className="mt-1 text-primary">{lead.clienteId ? "Convertido" : "—"}</p>
            </div>
          </div>

          {lead.motivoDescarte && lead.situacao === "descartado" && (
            <div>
              <p className="text-xs uppercase tracking-wide text-secondary">Motivo do descarte</p>
              <p className="mt-1 text-sm text-primary">{lead.motivoDescarte}</p>
            </div>
          )}

          {lead.observacoes && (
            <div>
              <p className="text-xs uppercase tracking-wide text-secondary">Observações</p>
              <p className="mt-1 text-sm text-primary">{lead.observacoes}</p>
            </div>
          )}

          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-secondary">
              Histórico de visitas ({lead.historicoVisitas.length})
            </p>
            {lead.historicoVisitas.length === 0 ? (
              <p className="text-sm text-secondary">Nenhuma visita registrada ainda.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {[...lead.historicoVisitas].reverse().map((visita) => (
                  <li key={visita.id} className="rounded-md border border-border bg-card p-3 md:bg-card-hover">
                    <div className="flex items-center justify-between gap-2">
                      <Badge tone={TONE_SITUACAO[visita.resultado]}>{LABEL_SITUACAO[visita.resultado]}</Badge>
                      <span className="font-mono text-xs text-secondary">{formatDateTime(visita.data)}</span>
                    </div>
                    {visita.atendidoPor && (
                      <p className="mt-2 text-sm text-secondary">
                        Atendido por {visita.atendidoPor}
                        {visita.eraDono ? " (dono)" : ""}
                      </p>
                    )}
                    {visita.proximaAcao && <p className="mt-1 text-sm text-primary">{visita.proximaAcao}</p>}
                    {visita.observacoes && <p className="mt-1 text-sm text-secondary">{visita.observacoes}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 flex shrink-0 flex-col gap-2 border-t border-border bg-page p-4 md:bg-card md:px-5">
          <button type="button" className={classesBotaoPrimario} onClick={() => setModalVisitaAberto(true)}>
            Registrar visita
          </button>
          {confirmandoExclusao ? (
            <div className="flex items-center gap-2 rounded-md border border-alert/30 bg-alert-tint p-3">
              <p className="flex-1 text-sm text-alert">Excluir este lead? Não é possível desfazer.</p>
              <button
                type="button"
                className="text-sm font-medium text-alert underline"
                onClick={() => {
                  deleteLead(lead.id);
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
              <Trash2 size={16} /> Excluir lead
            </button>
          )}
        </div>
      </div>

      {modalVisitaAberto && (
        <ModalRegistrarVisita
          lead={lead}
          onFechar={() => setModalVisitaAberto(false)}
          onRegistrado={() => setModalVisitaAberto(false)}
        />
      )}
    </div>
  );
}
