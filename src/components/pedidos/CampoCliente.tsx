import { useMemo, useState } from "react";
import { Check, UserPlus, X } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { classesCampo, classesLabel } from "../formClasses";

interface CampoClienteProps {
  /** Nome digitado. Vira cliente novo se não casar com nenhum existente. */
  nome: string;
  onNome: (nome: string) => void;
  /** Id do cliente existente escolhido, ou null quando é nome novo. */
  clienteId: string | null;
  onClienteId: (id: string | null) => void;
}

function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

/**
 * Campo de cliente por digitação, não por lista.
 *
 * A venda acontece na porta do comércio: obrigar a cadastrar o cliente
 * antes de registrar o pedido inverte a ordem do que de fato aconteceu.
 * Aqui você escreve o nome. Se já existe, o campo oferece o cliente e o
 * histórico continua ligado ao mesmo registro; se é novo, ele é criado
 * junto com o pedido, e os dados de contato entram depois com calma.
 */
export function CampoCliente({ nome, onNome, clienteId, onClienteId }: CampoClienteProps) {
  const clientes = useAppStore((s) => s.clientes);
  const [focado, setFocado] = useState(false);

  const selecionado = clientes.find((c) => c.id === clienteId) ?? null;

  const sugestoes = useMemo(() => {
    const termo = normalizar(nome);
    if (!termo) return [];
    return clientes
      .filter((c) => normalizar(c.nomeEstabelecimento).includes(termo))
      .slice(0, 5);
  }, [clientes, nome]);

  const casaExatamente = clientes.some(
    (c) => normalizar(c.nomeEstabelecimento) === normalizar(nome),
  );
  const seraNovo = nome.trim().length > 0 && !selecionado && !casaExatamente;

  if (selecionado) {
    return (
      <div>
        <span className={classesLabel}>Cliente</span>
        <div className="flex items-center justify-between gap-3 rounded-sm border border-border bg-input px-3 py-2.5">
          <span className="flex min-w-0 items-center gap-2">
            <Check size={16} className="shrink-0 text-accent" aria-hidden="true" />
            <span className="truncate text-base text-primary">
              {selecionado.nomeEstabelecimento}
            </span>
          </span>
          <button
            type="button"
            onClick={() => {
              onClienteId(null);
              onNome("");
            }}
            className="shrink-0 rounded p-1 text-secondary hover:text-primary"
            aria-label="Trocar de cliente"
          >
            <X size={15} aria-hidden="true" />
          </button>
        </div>
        <p className="mt-1 text-xs text-secondary">
          Pedido entra no histórico deste cliente.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <label className={classesLabel} htmlFor="pedido-cliente">
        Cliente
      </label>
      <input
        id="pedido-cliente"
        className={classesCampo}
        value={nome}
        onChange={(e) => onNome(e.target.value)}
        onFocus={() => setFocado(true)}
        // Sem o atraso, o clique numa sugestão não chega a disparar: o
        // blur esconde a lista antes do mousedown virar click.
        onBlur={() => setTimeout(() => setFocado(false), 120)}
        placeholder="Nome do estabelecimento"
        autoComplete="off"
      />

      {focado && sugestoes.length > 0 && (
        <div className="absolute left-0 right-0 z-10 mt-1 overflow-hidden rounded-md border border-border bg-card">
          <p className="px-3 pb-1 pt-2 text-xs uppercase tracking-wide text-secondary">
            Clientes já cadastrados
          </p>
          {sugestoes.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                onClienteId(c.id);
                onNome(c.nomeEstabelecimento);
              }}
              className="block w-full px-3 py-2 text-left hover:bg-card-hover"
            >
              <span className="block truncate text-sm text-primary">{c.nomeEstabelecimento}</span>
              {c.nomeResponsavel && (
                <span className="block truncate text-xs text-secondary">{c.nomeResponsavel}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {seraNovo && (
        <p className="mt-1 flex items-start gap-1.5 text-xs text-secondary">
          <UserPlus size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
          Cliente novo — será cadastrado junto com o pedido. O telefone e o link de avaliação você
          preenche depois, na ficha dele.
        </p>
      )}
    </div>
  );
}
