import { useState } from "react";
import { Modal } from "../Modal";
import { classesBotaoPrimario, classesBotaoSecundario, classesCampo, classesLabel } from "../formClasses";
import { useAppStore } from "../../store/useAppStore";
import { mostrarToast } from "../../store/useUiStore";

interface ModalNovoClienteProps {
  onFechar: () => void;
  onCriado: (clienteId: string) => void;
}

export function ModalNovoCliente({ onFechar, onCriado }: ModalNovoClienteProps) {
  const addCliente = useAppStore((state) => state.addCliente);
  const clientes = useAppStore((state) => state.clientes);

  const [nomeEstabelecimento, setNomeEstabelecimento] = useState("");
  const [nomeResponsavel, setNomeResponsavel] = useState("");
  const [telefoneResponsavel, setTelefoneResponsavel] = useState("");
  const [endereco, setEndereco] = useState("");
  const [linkAvaliacaoGoogle, setLinkAvaliacaoGoogle] = useState("");
  const [linkEncurtado, setLinkEncurtado] = useState("");
  const [indicadoPorClienteId, setIndicadoPorClienteId] = useState("");
  const [observacoes, setObservacoes] = useState("");

  function aoSalvar() {
    if (!nomeEstabelecimento.trim()) return;
    const id = addCliente({
      nomeEstabelecimento: nomeEstabelecimento.trim(),
      nomeResponsavel: nomeResponsavel.trim(),
      telefoneResponsavel: telefoneResponsavel.trim(),
      endereco: endereco.trim(),
      linkAvaliacaoGoogle: linkAvaliacaoGoogle.trim(),
      linkEncurtado: linkEncurtado.trim(),
      dataPrimeiroPedido: null,
      indicadoPorClienteId: indicadoPorClienteId || null,
      leadOrigemId: null,
      observacoes: observacoes.trim(),
    });
    mostrarToast("Cliente salvo.");
    onCriado(id);
  }

  return (
    <Modal titulo="Novo cliente" onFechar={onFechar}>
      <div className="flex flex-col gap-4">
        <div>
          <label className={classesLabel} htmlFor="cliente-nome">
            Nome do estabelecimento
          </label>
          <input
            id="cliente-nome"
            className={classesCampo}
            value={nomeEstabelecimento}
            onChange={(e) => setNomeEstabelecimento(e.target.value)}
            placeholder="Ex.: Açaí da Esquina"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={classesLabel} htmlFor="cliente-responsavel">
              Responsável
            </label>
            <input
              id="cliente-responsavel"
              className={classesCampo}
              value={nomeResponsavel}
              onChange={(e) => setNomeResponsavel(e.target.value)}
            />
          </div>
          <div>
            <label className={classesLabel} htmlFor="cliente-telefone">
              Telefone
            </label>
            <input
              id="cliente-telefone"
              className={`${classesCampo} font-mono`}
              value={telefoneResponsavel}
              onChange={(e) => setTelefoneResponsavel(e.target.value)}
              placeholder="(12) 91234-5678"
            />
          </div>
        </div>

        <div>
          <label className={classesLabel} htmlFor="cliente-endereco">
            Endereço
          </label>
          <input
            id="cliente-endereco"
            className={classesCampo}
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
          />
        </div>

        <div>
          <label className={classesLabel} htmlFor="cliente-link-avaliacao">
            Link de avaliação do Google
          </label>
          <input
            id="cliente-link-avaliacao"
            className={`${classesCampo} font-mono`}
            value={linkAvaliacaoGoogle}
            onChange={(e) => setLinkAvaliacaoGoogle(e.target.value)}
            placeholder="https://g.page/r/..."
          />
        </div>

        <div>
          <label className={classesLabel} htmlFor="cliente-link-encurtado">
            Link encurtado
          </label>
          <input
            id="cliente-link-encurtado"
            className={`${classesCampo} font-mono`}
            value={linkEncurtado}
            onChange={(e) => setLinkEncurtado(e.target.value)}
            placeholder="https://avalia.link/..."
          />
        </div>

        {clientes.length > 0 && (
          <div>
            <label className={classesLabel} htmlFor="cliente-indicado-por">
              Indicado por (opcional)
            </label>
            <select
              id="cliente-indicado-por"
              className={classesCampo}
              value={indicadoPorClienteId}
              onChange={(e) => setIndicadoPorClienteId(e.target.value)}
            >
              <option value="">Ninguém indicou</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nomeEstabelecimento}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className={classesLabel} htmlFor="cliente-observacoes">
            Observações
          </label>
          <textarea
            id="cliente-observacoes"
            className={`${classesCampo} min-h-20 resize-y`}
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
          />
        </div>

        <div className="mt-2 flex justify-end gap-3">
          <button type="button" className={classesBotaoSecundario} onClick={onFechar}>
            Cancelar
          </button>
          <button
            type="button"
            className={classesBotaoPrimario}
            disabled={!nomeEstabelecimento.trim()}
            onClick={aoSalvar}
          >
            Salvar cliente
          </button>
        </div>
      </div>
    </Modal>
  );
}
