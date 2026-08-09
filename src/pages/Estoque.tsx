import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Boxes, Nfc, PackageMinus, PackagePlus, TriangleAlert } from "lucide-react";
import { EmptyState } from "../components/EmptyState";
import { useAppStore } from "../store/useAppStore";
import { usePrimaryAction } from "../lib/usePrimaryAction";
import { formatBRL } from "../lib/format";
import { TIPOS_ITEM_ESTOQUE } from "../types";
import { itemAbaixoDoMinimo } from "../components/estoque/estoqueHelpers";
import { NivelBarra } from "../components/estoque/NivelBarra";
import { ModalNovoItem } from "../components/estoque/ModalNovoItem";
import { ModalMovimentoEstoque } from "../components/estoque/ModalMovimentoEstoque";
import { PainelItemEstoque } from "../components/estoque/PainelItemEstoque";
import { BotaoExportarCsv } from "../components/BotaoExportarCsv";
import { exportarCsv } from "../lib/csv";

export default function Estoque() {
  const navigate = useNavigate();
  const itensEstoque = useAppStore((state) => state.itensEstoque);
  const etiquetas = useAppStore((state) => state.etiquetas);

  const [modalNovoItemAberto, setModalNovoItemAberto] = useState(false);
  const [itemSelecionadoId, setItemSelecionadoId] = useState<string | null>(null);
  const [movimentoRapido, setMovimentoRapido] = useState<{ itemId: string; tipo: "entrada" | "perda" } | null>(
    null,
  );

  usePrimaryAction({ rotulo: "Novo item", onClick: () => setModalNovoItemAberto(true) });

  const etiquetasEmEstoque = etiquetas.filter((e) => e.situacao === "em_estoque").length;
  const etiquetaAbaixoDoMinimo = etiquetasEmEstoque < 10;

  function exportar() {
    exportarCsv(
      "estoque",
      itensEstoque.map((item) => ({
        Nome: item.nome,
        Tipo: TIPOS_ITEM_ESTOQUE.find((t) => t.value === item.tipo)?.label ?? item.tipo,
        "Quantidade atual": item.quantidadeAtual,
        Unidade: item.unidade,
        "Quantidade mínima": item.quantidadeMinima,
        "Custo unitário": formatBRL(item.custoUnitario),
        Fornecedor: item.fornecedor,
        "Prazo de reposição (dias)": item.prazoReposicaoDias,
      })),
    );
  }

  const modais = (
    <>
      {modalNovoItemAberto && (
        <ModalNovoItem
          onFechar={() => setModalNovoItemAberto(false)}
          onCriado={(id) => {
            setModalNovoItemAberto(false);
            setItemSelecionadoId(id);
          }}
        />
      )}
      {itemSelecionadoId && (
        <PainelItemEstoque itemId={itemSelecionadoId} onFechar={() => setItemSelecionadoId(null)} />
      )}
      {movimentoRapido &&
        (() => {
          const item = itensEstoque.find((i) => i.id === movimentoRapido.itemId);
          if (!item) return null;
          return (
            <ModalMovimentoEstoque
              item={item}
              tipo={movimentoRapido.tipo}
              onFechar={() => setMovimentoRapido(null)}
            />
          );
        })()}
    </>
  );

  if (itensEstoque.length === 0) {
    return (
      <>
        <EmptyState
          icon={Boxes}
          titulo="Nenhum item de estoque cadastrado ainda"
          descricao="Cadastre etiquetas NFC, adesivo vinil, papel do QR, filamento PETG e embalagens para acompanhar quantidade e saber quando repor."
          acaoRotulo="Novo item"
          onAcao={() => setModalNovoItemAberto(true)}
        />
        {modais}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div
        className={`flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between ${
          etiquetaAbaixoDoMinimo ? "border-attention/30 bg-attention-tint" : "border-border bg-card"
        }`}
      >
        <button
          type="button"
          onClick={() => navigate("/etiquetas")}
          className="flex min-w-0 flex-1 items-start gap-3 text-left"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-card-hover">
            <Nfc size={18} className={etiquetaAbaixoDoMinimo ? "text-attention" : "text-secondary"} />
          </div>
          <span className="min-w-0">
            <span className="block text-base text-primary">Etiquetas NFC NTAG213</span>
            <span className="block text-sm text-secondary">
              <span className="font-mono">{etiquetasEmEstoque} un</span> em estoque — gerido no módulo
              Etiquetas NFC
            </span>
          </span>
        </button>
        {etiquetaAbaixoDoMinimo && (
          <span className="flex shrink-0 items-center gap-1.5 text-sm text-attention">
            <TriangleAlert size={16} /> Abaixo do mínimo de 10
          </span>
        )}
      </div>

      <div className="flex justify-end">
        <BotaoExportarCsv onExportar={exportar} />
      </div>

      <div className="flex flex-col gap-3">
        {itensEstoque.map((item) => {
          const tipoLabel = TIPOS_ITEM_ESTOQUE.find((t) => t.value === item.tipo)?.label ?? item.tipo;
          const abaixoDoMinimo = itemAbaixoDoMinimo(item);
          return (
            <div
              key={item.id}
              className={`rounded-lg border p-4 ${
                abaixoDoMinimo ? "border-attention/30 bg-attention-tint" : "border-border bg-card"
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => setItemSelecionadoId(item.id)}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-base text-primary">{item.nome}</span>
                    <span className="shrink-0 font-mono text-sm text-primary">
                      {item.quantidadeAtual} {item.unidade}
                    </span>
                  </div>
                  {tipoLabel !== item.nome && (
                    <p className="mt-0.5 text-xs text-secondary">{tipoLabel}</p>
                  )}
                  <div className="mt-2">
                    <NivelBarra quantidadeAtual={item.quantidadeAtual} quantidadeMinima={item.quantidadeMinima} />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-secondary">
                    {abaixoDoMinimo && (
                      <span className="flex items-center gap-1 text-attention">
                        <TriangleAlert size={12} /> abaixo do mínimo de {item.quantidadeMinima}
                      </span>
                    )}
                    <span>Custo unit.: {formatBRL(item.custoUnitario)}</span>
                    <span>Fornecedor: {item.fornecedor || "—"}</span>
                    <span>Repõe em {item.prazoReposicaoDias} dias</span>
                  </div>
                </button>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => setMovimentoRapido({ itemId: item.id, tipo: "entrada" })}
                    className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium text-primary hover:border-border-strong hover:bg-card-hover"
                  >
                    <PackagePlus size={15} /> Entrada
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovimentoRapido({ itemId: item.id, tipo: "perda" })}
                    className="flex items-center gap-1.5 rounded-md border border-alert/40 px-3 py-2 text-sm font-medium text-alert hover:bg-alert-tint"
                  >
                    <PackageMinus size={15} /> Perda
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modais}
    </div>
  );
}
