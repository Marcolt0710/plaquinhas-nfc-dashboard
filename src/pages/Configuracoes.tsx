import { useState, type FormEvent } from "react";
import { CheckCircle2, Pencil, Plus } from "lucide-react";
import { useAppStore, custoTotalPorPlaca } from "../store/useAppStore";
import { Badge } from "../components/Badge";
import {
  classesBotaoPerigo,
  classesBotaoPrimario,
  classesBotaoSecundario,
  classesCampo,
  classesLabel,
} from "../components/formClasses";
import { formatBRL } from "../lib/format";
import { ModalPacote } from "../components/configuracoes/ModalPacote";
import { useMensagemSucesso } from "../components/configuracoes/useMensagemSucesso";
import type { CustosUnitarios, Pacote } from "../types";

const CAMPOS_CUSTO: { chave: keyof Omit<CustosUnitarios, "taxaPerdaPercentual">; rotulo: string }[] = [
  { chave: "filamentoPorPlaca", rotulo: "Filamento por placa" },
  { chave: "etiquetaNfc", rotulo: "Etiqueta NFC" },
  { chave: "adesivoBase", rotulo: "Adesivo base" },
  { chave: "etiquetaQr", rotulo: "Etiqueta do QR" },
  { chave: "energiaPorImpressao", rotulo: "Energia por impressão" },
  { chave: "embalagem", rotulo: "Embalagem" },
];

function SucessoInline({ mensagem }: { mensagem: string | null }) {
  if (!mensagem) return null;
  return (
    <p className="flex items-center gap-1.5 text-sm text-accent">
      <CheckCircle2 size={16} />
      {mensagem}
    </p>
  );
}

export default function Configuracoes() {
  const configuracao = useAppStore((state) => state.configuracao);
  const atualizarCustosUnitarios = useAppStore((state) => state.atualizarCustosUnitarios);
  const atualizarMarca = useAppStore((state) => state.atualizarMarca);
  const inativarPacote = useAppStore((state) => state.inativarPacote);

  // --- Custos unitários -------------------------------------------------
  const [custosForm, setCustosForm] = useState<CustosUnitarios>(configuracao.custosUnitarios);
  const sucessoCustos = useMensagemSucesso();

  function aoSalvarCustos(evento: FormEvent) {
    evento.preventDefault();
    atualizarCustosUnitarios(custosForm);
    sucessoCustos.mostrar("Custos salvos.");
  }

  // --- Marca / sócios / prazos -------------------------------------------
  const [marcaForm, setMarcaForm] = useState(configuracao.marca);
  const sucessoMarca = useMensagemSucesso();

  function aoSalvarMarca(evento: FormEvent) {
    evento.preventDefault();
    atualizarMarca(marcaForm);
    sucessoMarca.mostrar("Dados salvos.");
  }

  // --- Pacotes -----------------------------------------------------------
  const [modalPacoteAberto, setModalPacoteAberto] = useState<"novo" | Pacote | null>(null);
  const [inativandoId, setInativandoId] = useState<string | null>(null);

  const pacotesOrdenados = [...configuracao.pacotes].sort((a, b) => Number(b.ativo) - Number(a.ativo));

  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-2xl text-sm text-secondary">
        Estes números alimentam os cálculos do resto do sistema — é a partir deles que cada pedido novo
        calcula seu custo e sua margem.
      </p>

      {/* Custos unitários */}
      <form
        onSubmit={aoSalvarCustos}
        className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5"
      >
        <div>
          <h2 className="text-lg text-primary">Custos unitários por placa</h2>
          <p className="mt-1 text-sm text-secondary">
            Isso afeta só os próximos pedidos — os já fechados mantêm o custo que tinham na hora da venda.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CAMPOS_CUSTO.map(({ chave, rotulo }) => (
            <div key={chave}>
              <label className={classesLabel} htmlFor={`custo-${chave}`}>
                {rotulo} (R$)
              </label>
              <input
                id={`custo-${chave}`}
                type="number"
                min={0}
                step={0.01}
                className={classesCampo}
                value={custosForm[chave]}
                onChange={(e) =>
                  setCustosForm((form) => ({ ...form, [chave]: Number(e.target.value) || 0 }))
                }
              />
            </div>
          ))}
          <div>
            <label className={classesLabel} htmlFor="custo-perda">
              Taxa de perda (%)
            </label>
            <input
              id="custo-perda"
              type="number"
              min={0}
              max={100}
              step={0.1}
              className={classesCampo}
              value={custosForm.taxaPerdaPercentual}
              onChange={(e) =>
                setCustosForm((form) => ({ ...form, taxaPerdaPercentual: Number(e.target.value) || 0 }))
              }
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-md border border-border-strong bg-card-hover px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-secondary">Custo total por placa (calculado)</span>
          <span className="font-mono text-2xl text-primary">{formatBRL(custoTotalPorPlaca(custosForm))}</span>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className={classesBotaoPrimario}>
            Salvar custos
          </button>
          <SucessoInline mensagem={sucessoCustos.mensagem} />
        </div>
      </form>

      {/* Pacotes */}
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg text-primary">Pacotes</h2>
            <p className="mt-1 text-sm text-secondary">
              Os preços ainda não estão fechados — edite à vontade. Um pacote inativo some do formulário de
              novo pedido, mas pedidos antigos continuam mostrando o nome dele normalmente.
            </p>
          </div>
          <button
            type="button"
            className={`${classesBotaoSecundario} flex shrink-0 items-center justify-center gap-1.5`}
            onClick={() => setModalPacoteAberto("novo")}
          >
            <Plus size={16} /> Novo pacote
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {pacotesOrdenados.map((pacote) => (
            <div
              key={pacote.id}
              className={`flex flex-col gap-3 rounded-md border border-border bg-card-hover px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${
                pacote.ativo ? "" : "opacity-60"
              }`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="min-w-0">
                  <p className="truncate text-base text-primary">{pacote.nome}</p>
                  <p className="text-xs text-secondary">
                    {pacote.numeroPlacas} {pacote.numeroPlacas === 1 ? "placa" : "placas"} ·{" "}
                    <span className="font-mono">{formatBRL(pacote.preco)}</span>
                  </p>
                </div>
                <Badge tone={pacote.ativo ? "verde" : "neutro"}>{pacote.ativo ? "Ativo" : "Inativo"}</Badge>
              </div>

              {inativandoId === pacote.id ? (
                <div className="flex shrink-0 items-center gap-2 rounded-md border border-alert/30 bg-alert-tint px-3 py-2">
                  <p className="text-sm text-alert">Inativar este pacote?</p>
                  <button
                    type="button"
                    className="text-sm font-medium text-alert underline"
                    onClick={() => {
                      inativarPacote(pacote.id);
                      setInativandoId(null);
                    }}
                  >
                    Inativar
                  </button>
                  <button
                    type="button"
                    className="text-sm text-secondary underline"
                    onClick={() => setInativandoId(null)}
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    className={`${classesBotaoSecundario} flex items-center gap-1.5 px-3 py-2 text-sm`}
                    onClick={() => setModalPacoteAberto(pacote)}
                  >
                    <Pencil size={14} /> Editar
                  </button>
                  {pacote.ativo && (
                    <button
                      type="button"
                      className={`${classesBotaoPerigo} px-3 py-2 text-sm`}
                      onClick={() => setInativandoId(pacote.id)}
                    >
                      Inativar
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Marca, sócios e prazos */}
      <form
        onSubmit={aoSalvarMarca}
        className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5"
      >
        <h2 className="text-lg text-primary">Marca, sócios e prazos</h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className={classesLabel} htmlFor="marca-nome">
              Nome da marca
            </label>
            <input
              id="marca-nome"
              className={classesCampo}
              value={marcaForm.nome}
              onChange={(e) => setMarcaForm((form) => ({ ...form, nome: e.target.value }))}
            />
          </div>
          <div>
            <label className={classesLabel} htmlFor="marca-prazo">
              Prazo padrão de entrega (dias)
            </label>
            <input
              id="marca-prazo"
              type="number"
              min={0}
              step={1}
              className={classesCampo}
              value={marcaForm.prazoPadraoEntregaDias}
              onChange={(e) =>
                setMarcaForm((form) => ({ ...form, prazoPadraoEntregaDias: Number(e.target.value) || 0 }))
              }
            />
          </div>
          <div>
            <label className={classesLabel} htmlFor="marca-retorno">
              Dias para o retorno de acompanhamento
            </label>
            <input
              id="marca-retorno"
              type="number"
              min={0}
              step={1}
              className={classesCampo}
              value={marcaForm.diasRetornoAcompanhamento}
              onChange={(e) =>
                setMarcaForm((form) => ({
                  ...form,
                  diasRetornoAcompanhamento: Number(e.target.value) || 0,
                }))
              }
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {marcaForm.socios.map((socio, indice) => (
            <div key={indice} className="rounded-md border border-border bg-card-hover p-3">
              <p className="mb-2 text-xs uppercase tracking-wide text-secondary">Sócio {indice + 1}</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className={classesLabel} htmlFor={`socio-${indice}-nome`}>
                    Nome
                  </label>
                  <input
                    id={`socio-${indice}-nome`}
                    className={classesCampo}
                    value={socio.nome}
                    onChange={(e) =>
                      setMarcaForm((form) => ({
                        ...form,
                        socios: form.socios.map((s, i) =>
                          i === indice ? { ...s, nome: e.target.value } : s,
                        ),
                      }))
                    }
                  />
                </div>
                <div>
                  <label className={classesLabel} htmlFor={`socio-${indice}-telefone`}>
                    Telefone
                  </label>
                  <input
                    id={`socio-${indice}-telefone`}
                    className={classesCampo}
                    value={socio.telefone}
                    placeholder="(12) 91234-5678"
                    onChange={(e) =>
                      setMarcaForm((form) => ({
                        ...form,
                        socios: form.socios.map((s, i) =>
                          i === indice ? { ...s, telefone: e.target.value } : s,
                        ),
                      }))
                    }
                  />
                </div>
                <div>
                  <label className={classesLabel} htmlFor={`socio-${indice}-email`}>
                    E-mail
                  </label>
                  <input
                    id={`socio-${indice}-email`}
                    type="email"
                    className={classesCampo}
                    value={socio.email}
                    onChange={(e) =>
                      setMarcaForm((form) => ({
                        ...form,
                        socios: form.socios.map((s, i) =>
                          i === indice ? { ...s, email: e.target.value } : s,
                        ),
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className={classesBotaoPrimario}>
            Salvar dados
          </button>
          <SucessoInline mensagem={sucessoMarca.mensagem} />
        </div>
      </form>

      {modalPacoteAberto && (
        <ModalPacote
          pacote={modalPacoteAberto === "novo" ? undefined : modalPacoteAberto}
          onFechar={() => setModalPacoteAberto(null)}
        />
      )}

      <div className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-lg text-primary">Atalhos de teclado</h2>
        <p className="mt-1 text-sm text-secondary">
          Funcionam em qualquer tela, exceto enquanto você estiver digitando num campo.
        </p>
        <dl className="mt-3 flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-3">
            <kbd className="rounded border border-border bg-card-hover px-2 py-1 font-mono text-xs text-primary">
              /
            </kbd>
            <dd className="text-secondary">Foca a busca da barra superior</dd>
          </div>
          <div className="flex items-center gap-3">
            <kbd className="rounded border border-border bg-card-hover px-2 py-1 font-mono text-xs text-primary">
              n
            </kbd>
            <dd className="text-secondary">
              Dispara a ação principal da tela atual (o botão verde da barra superior)
            </dd>
          </div>
          <div className="flex items-center gap-3">
            <kbd className="rounded border border-border bg-card-hover px-2 py-1 font-mono text-xs text-primary">
              Esc
            </kbd>
            <dd className="text-secondary">Fecha o modal ou painel aberto</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
