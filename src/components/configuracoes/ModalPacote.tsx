import { useState, type FormEvent } from "react";
import { Modal } from "../Modal";
import { classesBotaoPrimario, classesBotaoSecundario, classesCampo, classesLabel } from "../formClasses";
import { useAppStore } from "../../store/useAppStore";
import type { Pacote } from "../../types";

interface ModalPacoteProps {
  pacote?: Pacote;
  onFechar: () => void;
}

// Cria ou edita um pacote. Nunca exclui — ver inativarPacote na store:
// pedidos antigos referenciam o pacote pelo id, então apagar quebraria
// o histórico. Editar aqui não muda pedidos já fechados (eles guardam
// valorCobrado/custoUnitarioSnapshot próprios, congelados na venda).
export function ModalPacote({ pacote, onFechar }: ModalPacoteProps) {
  const addPacote = useAppStore((state) => state.addPacote);
  const updatePacote = useAppStore((state) => state.updatePacote);

  const [nome, setNome] = useState(pacote?.nome ?? "");
  const [numeroPlacas, setNumeroPlacas] = useState(String(pacote?.numeroPlacas ?? 1));
  const [preco, setPreco] = useState(String(pacote?.preco ?? ""));

  function aoSalvar(evento: FormEvent) {
    evento.preventDefault();
    const dados = {
      nome: nome.trim(),
      numeroPlacas: Math.max(1, Math.round(Number(numeroPlacas) || 1)),
      preco: Number(preco) || 0,
      ativo: pacote?.ativo ?? true,
    };
    if (pacote) {
      updatePacote(pacote.id, dados);
    } else {
      addPacote(dados);
    }
    onFechar();
  }

  return (
    <Modal titulo={pacote ? "Editar pacote" : "Novo pacote"} onFechar={onFechar} largura="sm">
      <form onSubmit={aoSalvar} className="flex flex-col gap-4">
        <div>
          <label className={classesLabel} htmlFor="pacote-nome">
            Nome do pacote
          </label>
          <input
            id="pacote-nome"
            className={classesCampo}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex.: 2 placas"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={classesLabel} htmlFor="pacote-placas">
              Número de placas
            </label>
            <input
              id="pacote-placas"
              type="number"
              min={1}
              step={1}
              className={classesCampo}
              value={numeroPlacas}
              onChange={(e) => setNumeroPlacas(e.target.value)}
              required
            />
          </div>
          <div>
            <label className={classesLabel} htmlFor="pacote-preco">
              Preço (R$)
            </label>
            <input
              id="pacote-preco"
              type="number"
              min={0}
              step={0.01}
              className={classesCampo}
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="mt-2 flex justify-end gap-2">
          <button type="button" className={classesBotaoSecundario} onClick={onFechar}>
            Cancelar
          </button>
          <button type="submit" className={classesBotaoPrimario}>
            {pacote ? "Salvar pacote" : "Criar pacote"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
