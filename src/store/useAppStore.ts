import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Cliente,
  Configuracao,
  CustosUnitarios,
  EtiquetaNFC,
  EtapaPedido,
  ItemEstoque,
  Lead,
  MovimentoEstoque,
  Pacote,
  Pedido,
  ResultadoTeste,
  SituacaoLead,
  VisitaLead,
} from "../types";
import { gerarId, proximoCodigo } from "../lib/id";
import {
  mesclarPorId,
  somarResumos,
  type ArquivoBackup,
  type ResumoMesclagem,
} from "../lib/backup";
import { agoraISO, somarDias } from "../lib/date";
import {
  CONFIGURACAO_INICIAL,
  CLIENTES_INICIAIS,
  ETIQUETAS_INICIAIS,
  ITENS_ESTOQUE_INICIAIS,
  LEADS_INICIAIS,
  MOVIMENTOS_ESTOQUE_INICIAIS,
  PEDIDOS_INICIAIS,
} from "./seed";

// Soma dos custos unitários configurados, com a taxa de perda aplicada
// por cima — é este valor que vira o custoUnitarioSnapshot de um pedido
// novo (Fase 9). Nunca recalcula pedidos já existentes.
export function custoTotalPorPlaca(custos: CustosUnitarios): number {
  const base =
    custos.filamentoPorPlaca +
    custos.etiquetaNfc +
    custos.adesivoBase +
    custos.etiquetaQr +
    custos.energiaPorImpressao +
    custos.embalagem;
  return base * (1 + custos.taxaPerdaPercentual / 100);
}

export interface ResultadoAcao {
  ok: boolean;
  erro?: string;
}

interface AppState {
  leads: Lead[];
  clientes: Cliente[];
  pedidos: Pedido[];
  etiquetas: EtiquetaNFC[];
  itensEstoque: ItemEstoque[];
  movimentosEstoque: MovimentoEstoque[];
  configuracao: Configuracao;

  // --- Leads -----------------------------------------------------------
  addLead: (dados: Omit<Lead, "id" | "criadoEm" | "atualizadoEm" | "historicoVisitas" | "clienteId">) => string;
  updateLead: (id: string, patch: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  registrarVisitaLead: (
    leadId: string,
    visita: Omit<VisitaLead, "id">,
  ) => void;
  converterLeadEmCliente: (
    leadId: string,
    dadosCliente: Omit<Cliente, "id" | "criadoEm" | "atualizadoEm" | "leadOrigemId">,
  ) => string;

  // --- Clientes ----------------------------------------------------------
  addCliente: (dados: Omit<Cliente, "id" | "criadoEm" | "atualizadoEm">) => string;
  updateCliente: (id: string, patch: Partial<Cliente>) => void;
  deleteCliente: (id: string) => void;

  // --- Pedidos -----------------------------------------------------------
  addPedido: (dados: {
    clienteId: string;
    pacoteId: string;
    valorCobrado?: number;
    dataVenda?: string;
    leadOrigemId?: string | null;
    observacoes?: string;
  }) => string;
  updatePedido: (id: string, patch: Partial<Pedido>) => void;
  avancarEtapaPedido: (id: string, novaEtapa: EtapaPedido) => ResultadoAcao;
  deletePedido: (id: string) => void;

  // --- Etiquetas NFC -------------------------------------------------------
  adicionarEtiquetasEmEstoque: (quantidade: number) => void;
  gravarEtiqueta: (
    etiquetaId: string,
    dados: { pedidoId: string; linkGravado: string; gravadoPor: string; motivoRegravacao?: string },
  ) => void;
  registrarTesteEtiqueta: (
    etiquetaId: string,
    dados: { resultado: ResultadoTeste; aparelho: string },
  ) => void;
  marcarEtiquetaDefeito: (etiquetaId: string, motivo: string) => void;

  // --- Estoque -------------------------------------------------------------
  addItemEstoque: (dados: Omit<ItemEstoque, "id" | "criadoEm" | "atualizadoEm">) => string;
  updateItemEstoque: (id: string, patch: Partial<ItemEstoque>) => void;
  registrarEntradaEstoque: (itemId: string, quantidade: number, motivo: string) => void;
  registrarPerdaEstoque: (itemId: string, quantidade: number, motivo: string) => void;

  // --- Configurações -------------------------------------------------------
  atualizarCustosUnitarios: (patch: Partial<CustosUnitarios>) => void;
  atualizarMarca: (patch: Partial<Configuracao["marca"]>) => void;
  addPacote: (dados: Omit<Pacote, "id">) => void;
  updatePacote: (id: string, patch: Partial<Pacote>) => void;
  inativarPacote: (id: string) => void;

  // --- Backup ---------------------------------------------------------------
  mesclarBackup: (arquivo: ArquivoBackup) => ResumoMesclagem;
}

function registrarSaida(
  itensEstoque: ItemEstoque[],
  movimentosEstoque: MovimentoEstoque[],
  itemId: string | undefined,
  quantidade: number,
  motivo: string,
  pedidoId: string,
): { itensEstoque: ItemEstoque[]; movimentosEstoque: MovimentoEstoque[] } {
  if (!itemId || quantidade <= 0) return { itensEstoque, movimentosEstoque };
  const agora = agoraISO();
  return {
    itensEstoque: itensEstoque.map((item) =>
      item.id === itemId
        ? { ...item, quantidadeAtual: item.quantidadeAtual - quantidade, atualizadoEm: agora }
        : item,
    ),
    movimentosEstoque: [
      ...movimentosEstoque,
      { id: gerarId(), itemId, data: agora, tipo: "saida", quantidade, motivo, pedidoId },
    ],
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      leads: LEADS_INICIAIS,
      clientes: CLIENTES_INICIAIS,
      pedidos: PEDIDOS_INICIAIS,
      etiquetas: ETIQUETAS_INICIAIS,
      itensEstoque: ITENS_ESTOQUE_INICIAIS,
      movimentosEstoque: MOVIMENTOS_ESTOQUE_INICIAIS,
      configuracao: CONFIGURACAO_INICIAL,

      // ---------------------------------------------------------------- Leads
      addLead: (dados) => {
        const id = gerarId();
        const agora = agoraISO();
        const lead: Lead = {
          ...dados,
          id,
          historicoVisitas: [],
          clienteId: null,
          criadoEm: agora,
          atualizadoEm: agora,
        };
        set((state) => ({ leads: [...state.leads, lead] }));
        return id;
      },

      updateLead: (id, patch) => {
        set((state) => ({
          leads: state.leads.map((lead) =>
            lead.id === id ? { ...lead, ...patch, atualizadoEm: agoraISO() } : lead,
          ),
        }));
      },

      deleteLead: (id) => {
        set((state) => ({ leads: state.leads.filter((lead) => lead.id !== id) }));
      },

      registrarVisitaLead: (leadId, visita) => {
        set((state) => ({
          leads: state.leads.map((lead) =>
            lead.id === leadId
              ? {
                  ...lead,
                  situacao: visita.resultado,
                  dataVisita: visita.data,
                  atendidoPor: visita.atendidoPor,
                  eraDono: visita.eraDono,
                  dataRetorno: visita.dataRetorno,
                  motivoDescarte:
                    visita.resultado === "descartado" ? visita.observacoes || lead.motivoDescarte : lead.motivoDescarte,
                  historicoVisitas: [...lead.historicoVisitas, { ...visita, id: gerarId() }],
                  atualizadoEm: agoraISO(),
                }
              : lead,
          ),
        }));
      },

      converterLeadEmCliente: (leadId, dadosCliente) => {
        const clienteId = get().addCliente({ ...dadosCliente, leadOrigemId: leadId });
        set((state) => ({
          leads: state.leads.map((lead) =>
            lead.id === leadId
              ? { ...lead, situacao: "vendido" as SituacaoLead, clienteId, atualizadoEm: agoraISO() }
              : lead,
          ),
        }));
        return clienteId;
      },

      // ------------------------------------------------------------- Clientes
      addCliente: (dados) => {
        const id = gerarId();
        const agora = agoraISO();
        const cliente: Cliente = { ...dados, id, criadoEm: agora, atualizadoEm: agora };
        set((state) => ({ clientes: [...state.clientes, cliente] }));
        return id;
      },

      updateCliente: (id, patch) => {
        set((state) => ({
          clientes: state.clientes.map((cliente) =>
            cliente.id === id ? { ...cliente, ...patch, atualizadoEm: agoraISO() } : cliente,
          ),
        }));
      },

      deleteCliente: (id) => {
        set((state) => ({ clientes: state.clientes.filter((cliente) => cliente.id !== id) }));
      },

      // -------------------------------------------------------------- Pedidos
      addPedido: (dados) => {
        const state = get();
        const pacote = state.configuracao.pacotes.find((p) => p.id === dados.pacoteId);
        if (!pacote) throw new Error("Pacote não encontrado em Configurações.");

        const id = gerarId();
        const agora = agoraISO();
        const dataVenda = dados.dataVenda ?? agora;
        const dataPrometidaEntrega = somarDias(
          dataVenda,
          state.configuracao.marca.prazoPadraoEntregaDias,
        );

        const pedido: Pedido = {
          id,
          codigo: proximoCodigo("PED", state.pedidos.map((p) => p.codigo)),
          clienteId: dados.clienteId,
          pacoteId: dados.pacoteId,
          numeroPlacas: pacote.numeroPlacas,
          valorCobrado: dados.valorCobrado ?? pacote.preco,
          custoUnitarioSnapshot: custoTotalPorPlaca(state.configuracao.custosUnitarios),
          dataVenda,
          dataPrometidaEntrega,
          etapa: "vendido",
          historicoEtapas: [{ etapa: "vendido", data: agora }],
          etiquetasIds: [],
          dataEntregaReal: null,
          dataRetorno30Dias: null,
          retornoFeito: false,
          pago: false,
          dataPagamento: null,
          leadOrigemId: dados.leadOrigemId ?? null,
          observacoes: dados.observacoes ?? "",
          criadoEm: agora,
          atualizadoEm: agora,
        };

        set((s) => ({ pedidos: [...s.pedidos, pedido] }));
        return id;
      },

      updatePedido: (id, patch) => {
        set((state) => ({
          pedidos: state.pedidos.map((pedido) =>
            pedido.id === id ? { ...pedido, ...patch, atualizadoEm: agoraISO() } : pedido,
          ),
        }));
      },

      avancarEtapaPedido: (id, novaEtapa) => {
        const state = get();
        const pedido = state.pedidos.find((p) => p.id === id);
        if (!pedido) return { ok: false, erro: "Pedido não encontrado." };

        if (novaEtapa === "entregue") {
          const etiquetasDoPedido = state.etiquetas.filter((e) => pedido.etiquetasIds.includes(e.id));
          const faltaTeste =
            etiquetasDoPedido.length === 0 ||
            etiquetasDoPedido.some((e) => e.resultadoTeste !== "aprovado");
          if (faltaTeste) {
            return {
              ok: false,
              erro:
                "Este pedido tem etiqueta sem teste aprovado. Registre o teste dela em Etiquetas NFC antes de marcar como entregue.",
            };
          }
        }

        const agora = agoraISO();
        let { itensEstoque, movimentosEstoque } = state;

        if (novaEtapa === "impresso") {
          const itemFilamento = itensEstoque.find((i) => i.tipo === "filamento_petg");
          const itemPapelQr = itensEstoque.find((i) => i.tipo === "papel_qr");
          const custoFilamentoPorPlaca = state.configuracao.custosUnitarios.filamentoPorPlaca;
          const gramasPorPlaca =
            itemFilamento && itemFilamento.custoUnitario > 0
              ? custoFilamentoPorPlaca / itemFilamento.custoUnitario
              : 0;
          ({ itensEstoque, movimentosEstoque } = registrarSaida(
            itensEstoque,
            movimentosEstoque,
            itemFilamento?.id,
            gramasPorPlaca * pedido.numeroPlacas,
            `Consumo automático — ${pedido.codigo} impresso`,
            pedido.id,
          ));
          ({ itensEstoque, movimentosEstoque } = registrarSaida(
            itensEstoque,
            movimentosEstoque,
            itemPapelQr?.id,
            pedido.numeroPlacas,
            `Consumo automático — ${pedido.codigo} impresso`,
            pedido.id,
          ));
        }

        if (novaEtapa === "entregue") {
          const itemAdesivo = itensEstoque.find((i) => i.tipo === "adesivo_vinil");
          const itemEmbalagem = itensEstoque.find((i) => i.tipo === "embalagem");
          ({ itensEstoque, movimentosEstoque } = registrarSaida(
            itensEstoque,
            movimentosEstoque,
            itemAdesivo?.id,
            pedido.numeroPlacas,
            `Consumo automático — ${pedido.codigo} entregue`,
            pedido.id,
          ));
          ({ itensEstoque, movimentosEstoque } = registrarSaida(
            itensEstoque,
            movimentosEstoque,
            itemEmbalagem?.id,
            pedido.numeroPlacas,
            `Consumo automático — ${pedido.codigo} entregue`,
            pedido.id,
          ));
        }

        const etiquetas =
          novaEtapa === "entregue"
            ? state.etiquetas.map((e) =>
                pedido.etiquetasIds.includes(e.id) ? { ...e, situacao: "entregue" as const } : e,
              )
            : state.etiquetas;

        const dataEntregaReal = novaEtapa === "entregue" ? agora : pedido.dataEntregaReal;
        const dataRetorno30Dias =
          novaEtapa === "entregue"
            ? somarDias(agora, state.configuracao.marca.diasRetornoAcompanhamento)
            : pedido.dataRetorno30Dias;

        set({
          itensEstoque,
          movimentosEstoque,
          etiquetas,
          pedidos: state.pedidos.map((p) =>
            p.id === id
              ? {
                  ...p,
                  etapa: novaEtapa,
                  historicoEtapas: [...p.historicoEtapas, { etapa: novaEtapa, data: agora }],
                  dataEntregaReal,
                  dataRetorno30Dias,
                  pago: novaEtapa === "pago" ? true : p.pago,
                  dataPagamento: novaEtapa === "pago" ? agora : p.dataPagamento,
                  atualizadoEm: agora,
                }
              : p,
          ),
        });

        return { ok: true };
      },

      deletePedido: (id) => {
        set((state) => ({
          pedidos: state.pedidos.filter((p) => p.id !== id),
          etiquetas: state.etiquetas.map((e) => (e.pedidoId === id ? { ...e, pedidoId: null } : e)),
        }));
      },

      // ---------------------------------------------------------- Etiquetas NFC
      adicionarEtiquetasEmEstoque: (quantidade) => {
        const state = get();
        const agora = agoraISO();
        const existentes = state.etiquetas.map((e) => e.codigoInterno);
        const novas: EtiquetaNFC[] = [];
        for (let i = 0; i < quantidade; i++) {
          novas.push({
            id: gerarId(),
            codigoInterno: proximoCodigo("NFC", [...existentes, ...novas.map((n) => n.codigoInterno)]),
            uid: null,
            situacao: "em_estoque",
            pedidoId: null,
            linkGravado: null,
            dataGravacao: null,
            gravadoPor: null,
            resultadoTeste: "nao_testado",
            aparelhoTeste: null,
            dataTeste: null,
            motivoDefeito: null,
            historicoRegravacoes: [],
            criadoEm: agora,
          });
        }
        set({ etiquetas: [...state.etiquetas, ...novas] });
      },

      gravarEtiqueta: (etiquetaId, dados) => {
        const agora = agoraISO();
        set((state) => ({
          etiquetas: state.etiquetas.map((etiqueta) => {
            if (etiqueta.id !== etiquetaId) return etiqueta;
            const regravando = Boolean(etiqueta.linkGravado && etiqueta.linkGravado !== dados.linkGravado);
            return {
              ...etiqueta,
              situacao: "gravada",
              pedidoId: dados.pedidoId,
              linkGravado: dados.linkGravado,
              dataGravacao: agora,
              gravadoPor: dados.gravadoPor,
              resultadoTeste: "nao_testado",
              motivoDefeito: null,
              historicoRegravacoes: regravando
                ? [
                    ...etiqueta.historicoRegravacoes,
                    {
                      id: gerarId(),
                      data: agora,
                      linkAnterior: etiqueta.linkGravado as string,
                      motivo: dados.motivoRegravacao ?? "",
                    },
                  ]
                : etiqueta.historicoRegravacoes,
            };
          }),
          pedidos: state.pedidos.map((pedido) =>
            pedido.id === dados.pedidoId && !pedido.etiquetasIds.includes(etiquetaId)
              ? { ...pedido, etiquetasIds: [...pedido.etiquetasIds, etiquetaId], atualizadoEm: agora }
              : pedido,
          ),
        }));
      },

      registrarTesteEtiqueta: (etiquetaId, dados) => {
        const agora = agoraISO();
        set((state) => ({
          etiquetas: state.etiquetas.map((etiqueta) =>
            etiqueta.id === etiquetaId
              ? {
                  ...etiqueta,
                  resultadoTeste: dados.resultado,
                  aparelhoTeste: dados.aparelho,
                  dataTeste: agora,
                }
              : etiqueta,
          ),
        }));
      },

      marcarEtiquetaDefeito: (etiquetaId, motivo) => {
        set((state) => ({
          etiquetas: state.etiquetas.map((etiqueta) =>
            etiqueta.id === etiquetaId
              ? {
                  ...etiqueta,
                  situacao: "com_defeito",
                  resultadoTeste: "reprovado",
                  dataTeste: agoraISO(),
                  motivoDefeito: motivo,
                }
              : etiqueta,
          ),
        }));
      },

      // -------------------------------------------------------------- Estoque
      addItemEstoque: (dados) => {
        const id = gerarId();
        const agora = agoraISO();
        set((state) => ({
          itensEstoque: [...state.itensEstoque, { ...dados, id, criadoEm: agora, atualizadoEm: agora }],
        }));
        return id;
      },

      updateItemEstoque: (id, patch) => {
        set((state) => ({
          itensEstoque: state.itensEstoque.map((item) =>
            item.id === id ? { ...item, ...patch, atualizadoEm: agoraISO() } : item,
          ),
        }));
      },

      registrarEntradaEstoque: (itemId, quantidade, motivo) => {
        const agora = agoraISO();
        set((state) => ({
          itensEstoque: state.itensEstoque.map((item) =>
            item.id === itemId
              ? { ...item, quantidadeAtual: item.quantidadeAtual + quantidade, atualizadoEm: agora }
              : item,
          ),
          movimentosEstoque: [
            ...state.movimentosEstoque,
            { id: gerarId(), itemId, data: agora, tipo: "entrada", quantidade, motivo, pedidoId: null },
          ],
        }));
      },

      registrarPerdaEstoque: (itemId, quantidade, motivo) => {
        const agora = agoraISO();
        set((state) => ({
          itensEstoque: state.itensEstoque.map((item) =>
            item.id === itemId
              ? { ...item, quantidadeAtual: item.quantidadeAtual - quantidade, atualizadoEm: agora }
              : item,
          ),
          movimentosEstoque: [
            ...state.movimentosEstoque,
            { id: gerarId(), itemId, data: agora, tipo: "perda", quantidade, motivo, pedidoId: null },
          ],
        }));
      },

      // --------------------------------------------------------- Configurações
      atualizarCustosUnitarios: (patch) => {
        set((state) => ({
          configuracao: {
            ...state.configuracao,
            custosUnitarios: { ...state.configuracao.custosUnitarios, ...patch },
          },
        }));
      },

      atualizarMarca: (patch) => {
        set((state) => ({
          configuracao: { ...state.configuracao, marca: { ...state.configuracao.marca, ...patch } },
        }));
      },

      addPacote: (dados) => {
        set((state) => ({
          configuracao: {
            ...state.configuracao,
            pacotes: [...state.configuracao.pacotes, { ...dados, id: gerarId() }],
          },
        }));
      },

      updatePacote: (id, patch) => {
        set((state) => ({
          configuracao: {
            ...state.configuracao,
            pacotes: state.configuracao.pacotes.map((pacote) =>
              pacote.id === id ? { ...pacote, ...patch } : pacote,
            ),
          },
        }));
      },

      inativarPacote: (id) => {
        set((state) => ({
          configuracao: {
            ...state.configuracao,
            pacotes: state.configuracao.pacotes.map((pacote) =>
              pacote.id === id ? { ...pacote, ativo: false } : pacote,
            ),
          },
        }));
      },

      // ------------------------------------------------------------- Backup
      // Mescla, nunca substitui: importar o backup do sócio não pode
      // apagar o que foi cadastrado aqui. A configuração fica de fora de
      // propósito — custo e preço de pacote são idênticos nos dois
      // aparelhos, e mesclá-los poderia desfazer em silêncio um reajuste
      // recém-feito.
      mesclarBackup: (arquivo) => {
        const estado = get();
        const leads = mesclarPorId(estado.leads, arquivo.leads);
        const clientes = mesclarPorId(estado.clientes, arquivo.clientes);
        const pedidos = mesclarPorId(estado.pedidos, arquivo.pedidos);
        const etiquetas = mesclarPorId(estado.etiquetas, arquivo.etiquetas);
        const itensEstoque = mesclarPorId(estado.itensEstoque, arquivo.itensEstoque);
        const movimentosEstoque = mesclarPorId(estado.movimentosEstoque, arquivo.movimentosEstoque);

        set({
          leads: leads.resultado,
          clientes: clientes.resultado,
          pedidos: pedidos.resultado,
          etiquetas: etiquetas.resultado,
          itensEstoque: itensEstoque.resultado,
          movimentosEstoque: movimentosEstoque.resultado,
        });

        return somarResumos([
          leads.resumo,
          clientes.resumo,
          pedidos.resumo,
          etiquetas.resumo,
          itensEstoque.resumo,
          movimentosEstoque.resumo,
        ]);
      },
    }),
    {
      name: "plaquinhas-nfc-dashboard",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
