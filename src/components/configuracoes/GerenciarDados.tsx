import { useState } from "react";
import { FlaskConical, Trash2, TriangleAlert } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { mostrarToast } from "../../store/useUiStore";
import { classesBotaoPerigo, classesBotaoSecundario } from "../formClasses";

export function GerenciarDados() {
  const carregarDemonstracao = useAppStore((s) => s.carregarDemonstracao);
  const apagarTodosOsDados = useAppStore((s) => s.apagarTodosOsDados);
  const leads = useAppStore((s) => s.leads);
  const clientes = useAppStore((s) => s.clientes);
  const pedidos = useAppStore((s) => s.pedidos);
  const etiquetas = useAppStore((s) => s.etiquetas);
  const itensEstoque = useAppStore((s) => s.itensEstoque);

  const [confirmando, setConfirmando] = useState(false);

  const total =
    leads.length + clientes.length + pedidos.length + etiquetas.length + itensEstoque.length;
  const vazio = total === 0;

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
      <div>
        <h2 className="text-lg text-primary">Dados</h2>
        <p className="mt-1 max-w-2xl text-sm text-secondary">
          {vazio
            ? "O sistema está vazio. Todo número que aparecer nas telas virá do que você cadastrar — nada é estimado nem preenchido de exemplo."
            : `Hoje há ${total} ${total === 1 ? "registro" : "registros"} entre leads, clientes, pedidos, etiquetas e itens de estoque.`}
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => {
            carregarDemonstracao();
            mostrarToast("Dados de demonstração carregados.");
          }}
          className={`${classesBotaoSecundario} flex items-center justify-center gap-2`}
        >
          <FlaskConical size={16} aria-hidden="true" /> Carregar demonstração
        </button>

        {confirmando ? (
          <div className="flex flex-1 flex-col gap-2 rounded-md border border-alert/30 bg-alert-tint p-3 sm:flex-row sm:items-center">
            <p className="flex-1 text-sm text-alert">
              Apagar os {total} registros? Baixe um backup antes se quiser poder voltar atrás.
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => {
                  apagarTodosOsDados();
                  setConfirmando(false);
                  mostrarToast("Dados apagados.");
                }}
                className="rounded-md bg-alert px-3 py-2 text-sm font-medium text-page"
              >
                Apagar tudo
              </button>
              <button
                type="button"
                onClick={() => setConfirmando(false)}
                className="rounded-md px-3 py-2 text-sm text-secondary hover:text-primary"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={vazio}
            onClick={() => setConfirmando(true)}
            className={`${classesBotaoPerigo} flex items-center justify-center gap-2 disabled:opacity-40`}
          >
            <Trash2 size={16} aria-hidden="true" /> Apagar todos os dados
          </button>
        )}
      </div>

      <p className="flex items-start gap-2 text-xs text-secondary">
        <TriangleAlert size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
        <span>
          A demonstração cadastra clientes, pedidos e etiquetas fictícios — inclusive faturamento e
          lucro. Serve para conhecer o sistema, não para operar. Apague antes de registrar a
          primeira venda de verdade, para não misturar o que é real com o que é exemplo. Custos e
          pacotes não são afetados por nenhum dos dois botões.
        </span>
      </p>
    </div>
  );
}
