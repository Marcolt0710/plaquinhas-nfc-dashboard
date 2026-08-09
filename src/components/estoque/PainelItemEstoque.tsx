import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, PackageMinus, PackagePlus, TriangleAlert } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { classesBotaoPrimario, classesBotaoSecundario } from "../formClasses";
import { formatBRL, formatDateTime } from "../../lib/format";
import { NivelBarra } from "./NivelBarra";
import { itemAbaixoDoMinimo } from "./estoqueHelpers";
import { ModalMovimentoEstoque } from "./ModalMovimentoEstoque";
import { TIPOS_ITEM_ESTOQUE } from "../../types";

interface PainelItemEstoqueProps {
  itemId: string;
  onFechar: () => void;
}

const LABEL_MOVIMENTO: Record<string, string> = {
  entrada: "Entrada",
  saida: "Saída",
  perda: "Perda",
  ajuste: "Ajuste",
};

export function PainelItemEstoque({ itemId, onFechar }: PainelItemEstoqueProps) {
  const item = useAppStore((state) => state.itensEstoque.find((i) => i.id === itemId));
  const movimentos = useAppStore((state) => state.movimentosEstoque);
  const [modalMovimento, setModalMovimento] = useState<"entrada" | "perda" | null>(null);

  const historico = useMemo(
    () =>
      movimentos
        .filter((m) => m.itemId === itemId)
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()),
    [movimentos, itemId],
  );

  useEffect(() => {
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === "Escape" && !modalMovimento) onFechar();
    }
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [onFechar, modalMovimento]);

  if (!item) return null;

  const tipoLabel = TIPOS_ITEM_ESTOQUE.find((t) => t.value === item.tipo)?.label ?? item.tipo;

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
            <h2 className="text-xl text-primary">{item.nome}</h2>
            {tipoLabel !== item.nome && <p className="mt-1 text-sm text-secondary">{tipoLabel}</p>}
          </div>

          {itemAbaixoDoMinimo(item) && (
            <div className="flex items-start gap-2 rounded-md border border-attention/30 bg-attention-tint p-3 text-sm text-attention">
              <TriangleAlert size={16} className="mt-0.5 shrink-0" />
              <span className="min-w-0">
                Abaixo da quantidade mínima ({item.quantidadeMinima} {item.unidade}).
              </span>
            </div>
          )}

          <div>
            <p className="flex items-baseline justify-between text-sm">
              <span className="font-mono text-md text-primary">
                {item.quantidadeAtual} {item.unidade}
              </span>
              <span className="text-secondary">mínimo: {item.quantidadeMinima}</span>
            </p>
            <div className="mt-2">
              <NivelBarra quantidadeAtual={item.quantidadeAtual} quantidadeMinima={item.quantidadeMinima} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-secondary">Custo unitário</p>
              <p className="mt-1 font-mono text-primary">{formatBRL(item.custoUnitario)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-secondary">Prazo de reposição</p>
              <p className="mt-1 text-primary">{item.prazoReposicaoDias} dias</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-wide text-secondary">Fornecedor</p>
              <p className="mt-1 text-primary">{item.fornecedor || "—"}</p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-secondary">
              Histórico de movimentos ({historico.length})
            </p>
            {historico.length === 0 ? (
              <p className="text-sm text-secondary">Nenhum movimento registrado ainda.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {historico.map((mov) => (
                  <li
                    key={mov.id}
                    className="rounded-md border border-border bg-card p-3 text-sm md:bg-card-hover"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={
                          mov.tipo === "entrada"
                            ? "text-accent"
                            : mov.tipo === "perda"
                              ? "text-alert"
                              : "text-secondary"
                        }
                      >
                        {LABEL_MOVIMENTO[mov.tipo] ?? mov.tipo}: {mov.tipo === "entrada" ? "+" : "-"}
                        {mov.quantidade} {item.unidade}
                      </span>
                      <span className="font-mono text-xs text-secondary">{formatDateTime(mov.data)}</span>
                    </div>
                    <p className="mt-1 text-secondary">{mov.motivo}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 flex shrink-0 flex-col gap-2 border-t border-border bg-page p-4 md:bg-card md:px-5">
          <div className="flex gap-2">
            <button
              type="button"
              className={`${classesBotaoPrimario} flex flex-1 items-center justify-center gap-2`}
              onClick={() => setModalMovimento("entrada")}
            >
              <PackagePlus size={16} /> Dar entrada
            </button>
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-md border border-alert/40 px-4 py-2.5 text-base font-medium text-alert hover:bg-alert-tint"
              onClick={() => setModalMovimento("perda")}
            >
              <PackageMinus size={16} /> Registrar perda
            </button>
          </div>
          <button type="button" className={classesBotaoSecundario} onClick={onFechar}>
            Fechar
          </button>
        </div>
      </div>

      {modalMovimento && (
        <ModalMovimentoEstoque item={item} tipo={modalMovimento} onFechar={() => setModalMovimento(null)} />
      )}
    </div>
  );
}
