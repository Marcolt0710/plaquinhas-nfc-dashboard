import { useMemo, useState } from "react";
import { Footprints, LayoutList, MapPin, Star, TriangleAlert } from "lucide-react";
import { EmptyState } from "../components/EmptyState";
import { Badge } from "../components/Badge";
import { classesCampo } from "../components/formClasses";
import { useAppStore } from "../store/useAppStore";
import { usePrimaryAction } from "../lib/usePrimaryAction";
import { CATEGORIAS_LEAD, SITUACOES_LEAD, type CategoriaLead, type Lead, type SituacaoLead } from "../types";
import { formatDate } from "../lib/format";
import {
  LABEL_SITUACAO,
  TONE_SITUACAO,
  avaliacoesAcimaDoMaximo,
  notaAbaixoDoMinimo,
  retornoVencido,
} from "../components/prospeccao/leadHelpers";
import { ModalNovoLead } from "../components/prospeccao/ModalNovoLead";
import { PainelLead } from "../components/prospeccao/PainelLead";

export default function Prospeccao() {
  const leads = useAppStore((state) => state.leads);

  const [busca, setBusca] = useState("");
  const [filtroSituacao, setFiltroSituacao] = useState<SituacaoLead | "todas">("todas");
  const [filtroCategoria, setFiltroCategoria] = useState<CategoriaLead | "todas">("todas");
  const [filtroRua, setFiltroRua] = useState<string>("todas");
  const [agruparPorRua, setAgruparPorRua] = useState(true);
  const [modalNovoLeadAberto, setModalNovoLeadAberto] = useState(false);
  const [leadSelecionadoId, setLeadSelecionadoId] = useState<string | null>(null);

  usePrimaryAction({ rotulo: "Novo lead", onClick: () => setModalNovoLeadAberto(true) });

  const ruas = useMemo(() => Array.from(new Set(leads.map((l) => l.rua))).sort(), [leads]);

  const leadsFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return leads.filter((lead) => {
      if (termo && !lead.nomeEstabelecimento.toLowerCase().includes(termo)) return false;
      if (filtroSituacao !== "todas" && lead.situacao !== filtroSituacao) return false;
      if (filtroCategoria !== "todas" && lead.categoria !== filtroCategoria) return false;
      if (filtroRua !== "todas" && lead.rua !== filtroRua) return false;
      return true;
    });
  }, [leads, busca, filtroSituacao, filtroCategoria, filtroRua]);

  const portasVisitadas = leads.filter((l) => l.situacao !== "a_visitar").length;
  const vendidos = leads.filter((l) => l.situacao === "vendido").length;
  const taxaConversao = portasVisitadas > 0 ? Math.round((vendidos / portasVisitadas) * 100) : 0;
  const leadsRestantesNaRua =
    filtroRua !== "todas"
      ? leads.filter((l) => l.rua === filtroRua && l.situacao === "a_visitar").length
      : null;

  const grupos = useMemo(() => {
    if (!agruparPorRua) return null;
    const mapa = new Map<string, Lead[]>();
    for (const lead of leadsFiltrados) {
      const grupo = mapa.get(lead.rua) ?? [];
      grupo.push(lead);
      mapa.set(lead.rua, grupo);
    }
    return Array.from(mapa.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [leadsFiltrados, agruparPorRua]);

  if (leads.length === 0) {
    return (
      <>
        <EmptyState
          icon={Footprints}
          titulo="Nenhum lead cadastrado ainda"
          descricao="Aqui você acompanha o roteiro de porta fria: comércios visitados, o que responderam e quando voltar. Comece cadastrando o primeiro comércio do seu roteiro."
          acaoRotulo="Novo lead"
          onAcao={() => setModalNovoLeadAberto(true)}
        />
        {modalNovoLeadAberto && (
          <ModalNovoLead
            onFechar={() => setModalNovoLeadAberto(false)}
            onCriado={(id) => {
              setModalNovoLeadAberto(false);
              setLeadSelecionadoId(id);
            }}
          />
        )}
        {leadSelecionadoId && (
          <PainelLead leadId={leadSelecionadoId} onFechar={() => setLeadSelecionadoId(null)} />
        )}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-secondary">Portas visitadas</p>
          <p className="mt-1 font-mono text-2xl text-primary">{portasVisitadas}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-secondary">Taxa de conversão</p>
          <p className="mt-1 font-mono text-2xl text-accent">{taxaConversao}%</p>
          <p className="mt-0.5 text-xs text-secondary">vendidos sobre portas visitadas</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-secondary">Faltam nesta rua</p>
          <p className="mt-1 font-mono text-2xl text-primary">
            {leadsRestantesNaRua !== null ? leadsRestantesNaRua : "—"}
          </p>
          <p className="mt-0.5 text-xs text-secondary">
            {filtroRua !== "todas" ? "ainda não visitados" : "filtre por rua para ver"}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <input
          className={`${classesCampo} sm:max-w-xs`}
          placeholder="Buscar por nome"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <select
          className={`${classesCampo} sm:w-auto`}
          value={filtroSituacao}
          onChange={(e) => setFiltroSituacao(e.target.value as SituacaoLead | "todas")}
        >
          <option value="todas">Todas as situações</option>
          {SITUACOES_LEAD.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <select
          className={`${classesCampo} sm:w-auto`}
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value as CategoriaLead | "todas")}
        >
          <option value="todas">Todas as categorias</option>
          {CATEGORIAS_LEAD.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          className={`${classesCampo} sm:w-auto`}
          value={filtroRua}
          onChange={(e) => setFiltroRua(e.target.value)}
        >
          <option value="todas">Todas as ruas</option>
          {ruas.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setAgruparPorRua((v) => !v)}
          className={`flex items-center gap-1.5 rounded-md border px-3 py-2.5 text-sm font-medium ${
            agruparPorRua
              ? "border-accent bg-accent-tint text-accent"
              : "border-border text-secondary hover:border-border-strong hover:text-primary"
          }`}
        >
          {agruparPorRua ? <MapPin size={16} /> : <LayoutList size={16} />}
          Agrupar por rua
        </button>
      </div>

      {leadsFiltrados.length === 0 ? (
        <EmptyState
          icon={Footprints}
          titulo="Nenhum lead encontrado"
          descricao="Ajuste a busca ou os filtros para ver leads do roteiro."
        />
      ) : agruparPorRua && grupos ? (
        <div className="flex flex-col gap-6">
          {grupos.map(([rua, leadsDaRua]) => (
            <div key={rua}>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-secondary">
                <MapPin size={14} /> {rua}
                <span className="font-mono text-xs text-disabled">({leadsDaRua.length})</span>
              </h3>
              <div className="flex flex-col gap-2">
                {leadsDaRua.map((lead) => (
                  <LinhaLead key={lead.id} lead={lead} onClick={() => setLeadSelecionadoId(lead.id)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {leadsFiltrados.map((lead) => (
            <LinhaLead key={lead.id} lead={lead} onClick={() => setLeadSelecionadoId(lead.id)} />
          ))}
        </div>
      )}

      {modalNovoLeadAberto && (
        <ModalNovoLead
          onFechar={() => setModalNovoLeadAberto(false)}
          onCriado={(id) => {
            setModalNovoLeadAberto(false);
            setLeadSelecionadoId(id);
          }}
        />
      )}
      {leadSelecionadoId && (
        <PainelLead leadId={leadSelecionadoId} onFechar={() => setLeadSelecionadoId(null)} />
      )}
    </div>
  );
}

function LinhaLead({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  const alerta = notaAbaixoDoMinimo(lead) || avaliacoesAcimaDoMaximo(lead);
  const vencido = retornoVencido(lead);
  const categoriaLabel = CATEGORIAS_LEAD.find((c) => c.value === lead.categoria)?.label ?? lead.categoria;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col gap-2 rounded-lg border bg-card p-4 text-left transition-colors hover:border-border-strong hover:bg-card-hover sm:flex-row sm:items-center sm:justify-between ${
        vencido ? "border-attention/40" : "border-border"
      }`}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-base text-primary">{lead.nomeEstabelecimento}</span>
            {alerta && <TriangleAlert size={14} className="shrink-0 text-alert" />}
            {vencido && <Badge tone="amarelo">Retorno vencido</Badge>}
          </div>
          <p className="mt-0.5 truncate text-sm text-secondary">
            {categoriaLabel} · {lead.rua}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-4 text-sm">
        <span className="flex items-center gap-1 font-mono text-secondary">
          <Star size={13} className="text-attention" />
          {lead.notaGoogle !== null ? lead.notaGoogle.toFixed(1) : "—"}
          <span className="text-disabled">({lead.numeroAvaliacoes ?? 0})</span>
        </span>
        {lead.dataRetorno && (
          <span className="hidden font-mono text-xs text-secondary md:inline">
            volta {formatDate(lead.dataRetorno)}
          </span>
        )}
        <Badge tone={TONE_SITUACAO[lead.situacao]}>{LABEL_SITUACAO[lead.situacao]}</Badge>
      </div>
    </button>
  );
}
