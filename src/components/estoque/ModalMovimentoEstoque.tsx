import { useState } from "react";
import { Modal } from "../Modal";
import { classesBotaoPrimario, classesCampo, classesLabel } from "../formClasses";
import { useAppStore } from "../../store/useAppStore";
import { mostrarToast } from "../../store/useUiStore";
import type { ItemEstoque } from "../../types";

interface ModalMovimentoEstoqueProps {
  item: ItemEstoque;
  tipo: "entrada" | "perda";
  onFechar: () => void;
}

export function ModalMovimentoEstoque({ item, tipo, onFechar }: ModalMovimentoEstoqueProps) {
  const registrarEntradaEstoque = useAppStore((state) => state.registrarEntradaEstoque);
  const registrarPerdaEstoque = useAppStore((state) => state.registrarPerdaEstoque);

  const [quantidade, setQuantidade] = useState("");
  const [motivo, setMotivo] = useState(tipo === "entrada" ? "Compra do fornecedor" : "");

  const quantidadeValida = Number(quantidade) > 0;
  const podeSalvar = quantidadeValida && (tipo === "entrada" || motivo.trim().length > 0);

  function salvar() {
    if (!podeSalvar) return;
    const qtd = Number(quantidade);
    if (tipo === "entrada") {
      registrarEntradaEstoque(item.id, qtd, motivo.trim() || "Compra do fornecedor");
      mostrarToast("Entrada registrada.");
    } else {
      registrarPerdaEstoque(item.id, qtd, motivo.trim());
      mostrarToast("Perda registrada.");
    }
    onFechar();
  }

  return (
    <Modal
      titulo={tipo === "entrada" ? "Dar entrada em estoque" : "Registrar perda"}
      onFechar={onFechar}
      largura="sm"
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-secondary">
          {item.nome} — atualmente {item.quantidadeAtual} {item.unidade}
        </p>
        <label>
          <span className={classesLabel}>
            Quantidade ({item.unidade}) {tipo === "perda" ? "perdida" : "recebida"}
          </span>
          <input
            type="number"
            min={1}
            className={classesCampo}
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            autoFocus
          />
        </label>
        <label>
          <span className={classesLabel}>
            {tipo === "entrada" ? "Motivo (opcional)" : "Motivo da perda"}
          </span>
          <input
            className={classesCampo}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder={
              tipo === "entrada" ? "Ex.: compra do fornecedor" : "Ex.: impressão falha, adesivo estragado"
            }
          />
        </label>
        <button type="button" className={classesBotaoPrimario} disabled={!podeSalvar} onClick={salvar}>
          {tipo === "entrada" ? "Confirmar entrada" : "Confirmar perda"}
        </button>
      </div>
    </Modal>
  );
}
