import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Nfc, PackagePlus, Search, TriangleAlert } from "lucide-react";
import { EmptyState } from "../components/EmptyState";
import { Badge } from "../components/Badge";
import { classesCampo, classesSelect } from "../components/formClasses";
import { useAppStore } from "../store/useAppStore";
import { usePrimaryAction } from "../lib/usePrimaryAction";
import { useAbrirPorParametro } from "../lib/useAbrirPorParametro";
import type { SituacaoEtiqueta } from "../types";
import { formatDate } from "../lib/format";
import {
  LABEL_RESULTADO_TESTE,
  LABEL_SITUACAO_ETIQUETA,
  LIMITE_ESTOQUE_BAIXO,
  TONE_RESULTADO_TESTE,
  TONE_SITUACAO_ETIQUETA,
} from "../components/etiquetas/etiquetaHelpers";
import { FluxoGravacao } from "../components/etiquetas/FluxoGravacao";
import { PainelEtiqueta } from "../components/etiquetas/PainelEtiqueta";
import { BotaoExportarCsv } from "../components/BotaoExportarCsv";
import { exportarCsv } from "../lib/csv";
import { mostrarToast } from "../store/useUiStore";

export default function Etiquetas() {
  const navigate = useNavigate();
  const etiquetas = useAppStore((state) => state.etiquetas);
  const pedidos = useAppStore((state) => state.pedidos);
  const clientes = useAppStore((state) => state.clientes);
  const adicionarEtiquetasEmEstoque = useAppStore((state) => state.adicionarEtiquetasEmEstoque);

  const [buscaLink, setBuscaLink] = useState("");
  const [filtroSituacao, setFiltroSituacao] = useState<SituacaoEtiqueta | "todas">("todas");
  const [fluxoGravacaoAberto, setFluxoGravacaoAberto] = useState(false);
  const [etiquetaSelecionadaId, setEtiquetaSelecionadaId] = useState<string | null>(null);
  const [quantidadeReposicao, setQuantidadeReposicao] = useState("");

  usePrimaryAction({ rotulo: "Gravar etiqueta", onClick: () => setFluxoGravacaoAberto(true) });

  // Abre a ficha quando a busca global navega para cá com ?abrir=<id>.
  useAbrirPorParametro(setEtiquetaSelecionadaId);

  const emEstoque = etiquetas.filter((e) => e.situacao === "em_estoque").length;
  const estoqueBaixo = emEstoque < LIMITE_ESTOQUE_BAIXO;

  const etiquetasFiltradas = useMemo(() => {
    const termo = buscaLink.trim().toLowerCase();
    return etiquetas.filter((etiqueta) => {
      if (termo && !(etiqueta.linkGravado ?? "").toLowerCase().includes(termo)) return false;
      if (filtroSituacao !== "todas" && etiqueta.situacao !== filtroSituacao) return false;
      return true;
    });
  }, [etiquetas, buscaLink, filtroSituacao]);

  function nomeClienteDaEtiqueta(pedidoId: string | null) {
    if (!pedidoId) return null;
    const pedido = pedidos.find((p) => p.id === pedidoId);
    if (!pedido) return null;
    const cliente = clientes.find((c) => c.id === pedido.clienteId);
    return { codigo: pedido.codigo, nome: cliente?.nomeEstabelecimento ?? "cliente não encontrado" };
  }

  function exportar() {
    exportarCsv(
      "etiquetas-nfc",
      etiquetasFiltradas.map((etiqueta) => {
        const vinculo = nomeClienteDaEtiqueta(etiqueta.pedidoId);
        return {
          Código: etiqueta.codigoInterno,
          UID: etiqueta.uid ?? "",
          Situação: LABEL_SITUACAO_ETIQUETA[etiqueta.situacao],
          Pedido: vinculo?.codigo ?? "",
          Cliente: vinculo?.nome ?? "",
          "Link gravado": etiqueta.linkGravado ?? "",
          "Data de gravação": formatDate(etiqueta.dataGravacao),
          "Gravado por": etiqueta.gravadoPor ?? "",
          "Resultado do teste": LABEL_RESULTADO_TESTE[etiqueta.resultadoTeste],
          "Aparelho do teste": etiqueta.aparelhoTeste ?? "",
        };
      }),
    );
  }

  function confirmarReposicao() {
    const quantidade = Number(quantidadeReposicao);
    if (!Number.isFinite(quantidade) || quantidade <= 0) return;
    adicionarEtiquetasEmEstoque(Math.floor(quantidade));
    mostrarToast(`${Math.floor(quantidade)} etiqueta${Math.floor(quantidade) > 1 ? "s" : ""} adicionada${Math.floor(quantidade) > 1 ? "s" : ""} ao estoque.`);
    setQuantidadeReposicao("");
  }

  const modais = (
    <>
      {fluxoGravacaoAberto && <FluxoGravacao onFechar={() => setFluxoGravacaoAberto(false)} />}
      {etiquetaSelecionadaId && (
        <PainelEtiqueta
          etiquetaId={etiquetaSelecionadaId}
          onFechar={() => setEtiquetaSelecionadaId(null)}
          onAbrirPedido={() => navigate("/pedidos")}
        />
      )}
    </>
  );

  if (etiquetas.length === 0) {
    return (
      <>
        <EmptyState
          icon={Nfc}
          titulo="Nenhuma etiqueta cadastrada ainda"
          descricao="Cada etiqueta gravada guarda o link do cliente e o histórico de teste — é o registro que sustenta o suporte depois da entrega. Sem ele, um link perdido não tem como ser recuperado."
          acaoRotulo="Gravar etiqueta"
          onAcao={() => setFluxoGravacaoAberto(true)}
        />
        {modais}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {estoqueBaixo && (
        <div className="flex flex-col gap-3 rounded-lg border border-attention/30 bg-attention-tint p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2 text-sm text-attention">
            <TriangleAlert size={16} className="mt-0.5 shrink-0" />
            <span className="min-w-0">
              {emEstoque === 1
                ? "Só resta 1 etiqueta em estoque"
                : `Só restam ${emEstoque} etiquetas em estoque`}{" "}
              — abaixo do mínimo de {LIMITE_ESTOQUE_BAIXO}.
            </span>
          </p>
          <div className="flex min-w-0 items-center gap-2">
            <input
              type="number"
              min={1}
              className="w-20 min-w-0 rounded-sm border border-border bg-input px-3 py-2.5 text-base text-primary placeholder:text-secondary focus:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              placeholder="Qtd."
              value={quantidadeReposicao}
              onChange={(e) => setQuantidadeReposicao(e.target.value)}
            />
            <button
              type="button"
              onClick={confirmarReposicao}
              className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md bg-attention px-3 py-2.5 text-sm font-medium text-accent-ink hover:opacity-90"
            >
              <PackagePlus size={16} /> Adicionar ao estoque
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative sm:max-w-sm sm:flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
          />
          <input
            className={`${classesCampo} pl-9`}
            placeholder="Buscar por link gravado"
            value={buscaLink}
            onChange={(e) => setBuscaLink(e.target.value)}
          />
        </div>
        <select
          className={`${classesSelect} sm:w-auto`}
          value={filtroSituacao}
          onChange={(e) => setFiltroSituacao(e.target.value as SituacaoEtiqueta | "todas")}
        >
          <option value="todas">Todas as situações</option>
          <option value="em_estoque">Em estoque</option>
          <option value="gravada">Gravada</option>
          <option value="entregue">Entregue</option>
          <option value="com_defeito">Com defeito</option>
        </select>
        <BotaoExportarCsv onExportar={exportar} className="sm:ml-auto" />
      </div>

      {etiquetasFiltradas.length === 0 ? (
        <EmptyState
          icon={Search}
          titulo="Nenhuma etiqueta encontrada"
          descricao="Ajuste a busca por link ou o filtro de situação."
          acaoRotulo="Limpar filtros"
          onAcao={() => {
            setBuscaLink("");
            setFiltroSituacao("todas");
          }}
        />
      ) : (
        <div className="min-w-0 overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-secondary">
                <th className="px-4 py-3 font-medium">Código</th>
                <th className="px-4 py-3 font-medium">Situação</th>
                <th className="px-4 py-3 font-medium">Pedido / cliente</th>
                <th className="px-4 py-3 font-medium">Link gravado</th>
                <th className="px-4 py-3 font-medium">Teste</th>
                <th className="px-4 py-3 font-medium">Gravação</th>
              </tr>
            </thead>
            <tbody>
              {etiquetasFiltradas.map((etiqueta) => {
                const vinculo = nomeClienteDaEtiqueta(etiqueta.pedidoId);
                return (
                  <tr
                    key={etiqueta.id}
                    onClick={() => setEtiquetaSelecionadaId(etiqueta.id)}
                    className="cursor-pointer border-b border-border last:border-0 hover:bg-card-hover"
                  >
                    <td className="px-4 py-3 font-mono text-sm text-primary">{etiqueta.codigoInterno}</td>
                    <td className="px-4 py-3">
                      <Badge tone={TONE_SITUACAO_ETIQUETA[etiqueta.situacao]}>
                        {LABEL_SITUACAO_ETIQUETA[etiqueta.situacao]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-secondary">
                      {vinculo ? `${vinculo.codigo} — ${vinculo.nome}` : "—"}
                    </td>
                    <td className="max-w-[240px] truncate px-4 py-3 font-mono text-sm text-secondary">
                      {etiqueta.linkGravado ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={TONE_RESULTADO_TESTE[etiqueta.resultadoTeste]}>
                        {LABEL_RESULTADO_TESTE[etiqueta.resultadoTeste]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-secondary">{formatDate(etiqueta.dataGravacao)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modais}
    </div>
  );
}
