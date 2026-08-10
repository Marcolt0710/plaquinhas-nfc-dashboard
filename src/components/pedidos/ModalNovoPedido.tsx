import { useMemo, useState } from "react";
import { Modal } from "../Modal";
import { classesBotaoPrimario, classesBotaoSecundario, classesCampo, classesSelect, classesLabel } from "../formClasses";
import { useAppStore } from "../../store/useAppStore";
import { mostrarToast } from "../../store/useUiStore";
import { formatBRL } from "../../lib/format";
import { CampoCliente } from "./CampoCliente";

interface ModalNovoPedidoProps {
  onFechar: () => void;
  onCriado: (pedidoId: string) => void;
  clienteIdInicial?: string;
}

function dataDeHoje(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ModalNovoPedido({
  onFechar,
  onCriado,
  clienteIdInicial,
}: ModalNovoPedidoProps) {
  const clientes = useAppStore((state) => state.clientes);
  const todosPacotes = useAppStore((state) => state.configuracao.pacotes);
  const pacotes = useMemo(() => todosPacotes.filter((p) => p.ativo), [todosPacotes]);
  const addPedido = useAppStore((state) => state.addPedido);
  const addCliente = useAppStore((state) => state.addCliente);

  const clienteInicial = clientes.find((c) => c.id === clienteIdInicial);
  const [clienteId, setClienteId] = useState<string | null>(clienteIdInicial ?? null);
  const [nomeCliente, setNomeCliente] = useState(clienteInicial?.nomeEstabelecimento ?? "");
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
    const nome = nomeCliente.trim();
    if (!nome || !pacoteId) return;

    // Cliente existente escolhido na lista, ou nome que já bate com um
    // cadastrado — nos dois casos o pedido entra no histórico dele, em
    // vez de criar um registro duplicado do mesmo comércio.
    const existente =
      clientes.find((c) => c.id === clienteId) ??
      clientes.find(
        (c) => c.nomeEstabelecimento.trim().toLowerCase() === nome.toLowerCase(),
      );

    const idDoCliente =
      existente?.id ??
      addCliente({
        nomeEstabelecimento: nome,
        nomeResponsavel: "",
        telefoneResponsavel: "",
        endereco: "",
        linkAvaliacaoGoogle: "",
        linkEncurtado: "",
        dataPrimeiroPedido: new Date(dataVenda).toISOString(),
        indicadoPorClienteId: null,
        leadOrigemId: null,
        observacoes: "",
      });

    const id = addPedido({
      clienteId: idDoCliente,
      pacoteId,
      valorCobrado: valorCobrado ? Number(valorCobrado) : undefined,
      dataVenda: new Date(dataVenda).toISOString(),
      observacoes: observacoes.trim(),
    });
    mostrarToast(existente ? "Pedido salvo." : "Pedido e cliente salvos.");
    onCriado(id);
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
        <CampoCliente
          nome={nomeCliente}
          onNome={setNomeCliente}
          clienteId={clienteId}
          onClienteId={setClienteId}
        />

        <div>
          <label className={classesLabel} htmlFor="pedido-pacote">
            Pacote
          </label>
          <select
            id="pedido-pacote"
            className={classesSelect}
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
            disabled={!nomeCliente.trim() || !pacoteId}
            onClick={aoSalvar}
          >
            Salvar pedido
          </button>
        </div>
      </div>
    </Modal>
  );
}
