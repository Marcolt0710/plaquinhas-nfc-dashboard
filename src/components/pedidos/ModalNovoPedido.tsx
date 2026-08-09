import { useMemo, useState } from "react";
import { Modal } from "../Modal";
import { classesBotaoPrimario, classesBotaoSecundario, classesCampo, classesLabel } from "../formClasses";
import { useAppStore } from "../../store/useAppStore";
import { formatBRL } from "../../lib/format";

interface ModalNovoPedidoProps {
  onFechar: () => void;
  onCriado: (pedidoId: string) => void;
  onIrParaNovoCliente?: () => void;
  clienteIdInicial?: string;
}

function dataDeHoje(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ModalNovoPedido({
  onFechar,
  onCriado,
  onIrParaNovoCliente,
  clienteIdInicial,
}: ModalNovoPedidoProps) {
  const clientes = useAppStore((state) => state.clientes);
  const todosPacotes = useAppStore((state) => state.configuracao.pacotes);
  const pacotes = useMemo(() => todosPacotes.filter((p) => p.ativo), [todosPacotes]);
  const addPedido = useAppStore((state) => state.addPedido);

  const [clienteId, setClienteId] = useState(clienteIdInicial ?? clientes[0]?.id ?? "");
  const [pacoteId, setPacoteId] = useState(pacotes[0]?.id ?? "");
  const [valorCobrado, setValorCobrado] = useState(String(pacotes[0]?.preco ?? ""));
  const [dataVenda, setDataVenda] = useState(dataDeHoje());
  const [observacoes, setObservacoes] = useState("");

  function aoTrocarPacote(id: string) {
    setPacoteId(id);
    const pacote = pacotes.find((p) => p.id === id);
    if (pacote) setValorCobrado(String(pacote.preco));
  }

  function aoSalvar() {
    if (!clienteId || !pacoteId) return;
    const id = addPedido({
      clienteId,
      pacoteId,
      valorCobrado: valorCobrado ? Number(valorCobrado) : undefined,
      dataVenda: new Date(dataVenda).toISOString(),
      observacoes: observacoes.trim(),
    });
    onCriado(id);
  }

  if (clientes.length === 0) {
    return (
      <Modal titulo="Novo pedido" onFechar={onFechar}>
        <p className="text-sm text-secondary">
          Você ainda não tem nenhum cliente cadastrado. Cadastre um cliente antes de registrar um pedido.
        </p>
        <div className="mt-4 flex justify-end gap-3">
          <button type="button" className={classesBotaoSecundario} onClick={onFechar}>
            Fechar
          </button>
          {onIrParaNovoCliente && (
            <button type="button" className={classesBotaoPrimario} onClick={onIrParaNovoCliente}>
              Cadastrar cliente
            </button>
          )}
        </div>
      </Modal>
    );
  }

  if (pacotes.length === 0) {
    return (
      <Modal titulo="Novo pedido" onFechar={onFechar}>
        <p className="text-sm text-secondary">
          Não há pacotes ativos em Configurações. Cadastre pelo menos um pacote antes de registrar um
          pedido.
        </p>
        <div className="mt-4 flex justify-end">
          <button type="button" className={classesBotaoSecundario} onClick={onFechar}>
            Fechar
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal titulo="Novo pedido" onFechar={onFechar}>
      <div className="flex flex-col gap-4">
        <div>
          <label className={classesLabel} htmlFor="pedido-cliente">
            Cliente
          </label>
          <select
            id="pedido-cliente"
            className={classesCampo}
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
          >
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nomeEstabelecimento}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={classesLabel} htmlFor="pedido-pacote">
            Pacote
          </label>
          <select
            id="pedido-pacote"
            className={classesCampo}
            value={pacoteId}
            onChange={(e) => aoTrocarPacote(e.target.value)}
          >
            {pacotes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome} — {formatBRL(p.preco)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={classesLabel} htmlFor="pedido-valor">
              Valor cobrado
            </label>
            <input
              id="pedido-valor"
              type="number"
              min={0}
              step={0.01}
              className={`${classesCampo} font-mono`}
              value={valorCobrado}
              onChange={(e) => setValorCobrado(e.target.value)}
            />
          </div>
          <div>
            <label className={classesLabel} htmlFor="pedido-data-venda">
              Data da venda
            </label>
            <input
              id="pedido-data-venda"
              type="date"
              className={classesCampo}
              value={dataVenda}
              onChange={(e) => setDataVenda(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className={classesLabel} htmlFor="pedido-observacoes">
            Observações
          </label>
          <textarea
            id="pedido-observacoes"
            className={`${classesCampo} min-h-20 resize-y`}
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="O que vale lembrar sobre esta venda"
          />
        </div>

        <div className="mt-2 flex justify-end gap-3">
          <button type="button" className={classesBotaoSecundario} onClick={onFechar}>
            Cancelar
          </button>
          <button
            type="button"
            className={classesBotaoPrimario}
            disabled={!clienteId || !pacoteId}
            onClick={aoSalvar}
          >
            Salvar pedido
          </button>
        </div>
      </div>
    </Modal>
  );
}
