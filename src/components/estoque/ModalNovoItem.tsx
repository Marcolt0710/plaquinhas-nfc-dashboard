import { useState } from "react";
import { Modal } from "../Modal";
import { classesBotaoPrimario, classesCampo, classesSelect, classesLabel } from "../formClasses";
import { useAppStore } from "../../store/useAppStore";
import { mostrarToast } from "../../store/useUiStore";
import { TIPOS_ITEM_ESTOQUE, type TipoItemEstoque } from "../../types";

interface ModalNovoItemProps {
  onFechar: () => void;
  onCriado: (id: string) => void;
}

// Etiqueta NFC não aparece aqui: seu estoque é derivado das etiquetas
// individuais geridas no módulo Etiquetas NFC (ver docs/fase-0-arquitetura.md).
const TIPOS_CADASTRAVEIS = TIPOS_ITEM_ESTOQUE.filter((t) => t.value !== "etiqueta_nfc");

export function ModalNovoItem({ onFechar, onCriado }: ModalNovoItemProps) {
  const addItemEstoque = useAppStore((state) => state.addItemEstoque);

  const [tipo, setTipo] = useState<TipoItemEstoque>(TIPOS_CADASTRAVEIS[0].value);
  const [nome, setNome] = useState(TIPOS_CADASTRAVEIS[0].label);
  const [quantidadeAtual, setQuantidadeAtual] = useState("0");
  const [quantidadeMinima, setQuantidadeMinima] = useState("10");
  const [custoUnitario, setCustoUnitario] = useState("");
  const [fornecedor, setFornecedor] = useState("");
  const [prazoReposicaoDias, setPrazoReposicaoDias] = useState("5");

  const podeSalvar = nome.trim().length > 0 && Number(quantidadeMinima) >= 0;

  function salvar() {
    if (!podeSalvar) return;
    const tipoInfo = TIPOS_ITEM_ESTOQUE.find((t) => t.value === tipo)!;
    const id = addItemEstoque({
      nome: nome.trim(),
      tipo,
      unidade: tipoInfo.unidade as "un" | "g",
      quantidadeAtual: Number(quantidadeAtual) || 0,
      quantidadeMinima: Number(quantidadeMinima) || 0,
      custoUnitario: Number(custoUnitario) || 0,
      fornecedor: fornecedor.trim(),
      prazoReposicaoDias: Number(prazoReposicaoDias) || 0,
    });
    mostrarToast("Item salvo.");
    onCriado(id);
  }

  return (
    <Modal titulo="Novo item de estoque" onFechar={onFechar} largura="sm">
      <div className="flex flex-col gap-4">
        <label>
          <span className={classesLabel}>Tipo</span>
          <select
            className={classesSelect}
            value={tipo}
            onChange={(e) => {
              const novoTipo = e.target.value as TipoItemEstoque;
              setTipo(novoTipo);
              setNome(TIPOS_ITEM_ESTOQUE.find((t) => t.value === novoTipo)?.label ?? "");
            }}
          >
            {TIPOS_CADASTRAVEIS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className={classesLabel}>Nome</span>
          <input className={classesCampo} value={nome} onChange={(e) => setNome(e.target.value)} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label>
            <span className={classesLabel}>Quantidade atual</span>
            <input
              type="number"
              min={0}
              className={classesCampo}
              value={quantidadeAtual}
              onChange={(e) => setQuantidadeAtual(e.target.value)}
            />
          </label>
          <label>
            <span className={classesLabel}>Quantidade mínima</span>
            <input
              type="number"
              min={0}
              className={classesCampo}
              value={quantidadeMinima}
              onChange={(e) => setQuantidadeMinima(e.target.value)}
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label>
            <span className={classesLabel}>Custo unitário (R$)</span>
            <input
              type="number"
              min={0}
              step="0.01"
              className={classesCampo}
              value={custoUnitario}
              onChange={(e) => setCustoUnitario(e.target.value)}
            />
          </label>
          <label>
            <span className={classesLabel}>Prazo de reposição (dias)</span>
            <input
              type="number"
              min={0}
              className={classesCampo}
              value={prazoReposicaoDias}
              onChange={(e) => setPrazoReposicaoDias(e.target.value)}
            />
          </label>
        </div>
        <label>
          <span className={classesLabel}>Fornecedor</span>
          <input
            className={classesCampo}
            value={fornecedor}
            onChange={(e) => setFornecedor(e.target.value)}
            placeholder="Nome do fornecedor"
          />
        </label>
        <button type="button" className={classesBotaoPrimario} disabled={!podeSalvar} onClick={salvar}>
          Cadastrar item
        </button>
      </div>
    </Modal>
  );
}
