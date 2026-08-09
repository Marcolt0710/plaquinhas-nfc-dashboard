import type { Cliente, EtiquetaNFC, ItemEstoque, Lead, Pedido } from "../types";
import { formatBRL } from "./format";

export interface ResultadoBusca {
  id: string;
  /** Rota com o parâmetro que faz a página abrir a ficha direto. */
  destino: string;
  titulo: string;
  /** Linha de apoio: o que identifica o registro além do nome. */
  detalhe: string;
  /** Trecho em fonte monoespaçada — código, UID, link, valor. */
  codigo?: string;
}

export interface GrupoResultado {
  modulo: string;
  itens: ResultadoBusca[];
}

/** Compara ignorando acento e caixa — "acai" acha "Açaí". */
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function contem(campo: string | null | undefined, termo: string): boolean {
  if (!campo) return false;
  return normalizar(campo).includes(termo);
}

const LIMITE_POR_GRUPO = 5;

export interface DadosBusca {
  clientes: Cliente[];
  pedidos: Pedido[];
  leads: Lead[];
  etiquetas: EtiquetaNFC[];
  itensEstoque: ItemEstoque[];
}

/**
 * Busca global sobre os dados já carregados em memória. Procura pelo que
 * a pessoa realmente digitaria na rua: nome do comércio, telefone,
 * código do pedido, UID ou link de uma etiqueta.
 */
export function buscarTudo(termoBruto: string, dados: DadosBusca): GrupoResultado[] {
  const termo = normalizar(termoBruto.trim());
  if (termo.length < 2) return [];

  const nomeCliente = (clienteId: string) =>
    dados.clientes.find((c) => c.id === clienteId)?.nomeEstabelecimento ?? "Cliente removido";

  const grupos: GrupoResultado[] = [
    {
      modulo: "Clientes",
      itens: dados.clientes
        .filter(
          (c) =>
            contem(c.nomeEstabelecimento, termo) ||
            contem(c.nomeResponsavel, termo) ||
            contem(c.telefoneResponsavel, termo) ||
            contem(c.linkEncurtado, termo),
        )
        .slice(0, LIMITE_POR_GRUPO)
        .map((c) => ({
          id: c.id,
          destino: `/clientes?abrir=${c.id}`,
          titulo: c.nomeEstabelecimento,
          detalhe: c.nomeResponsavel || "Sem responsável cadastrado",
          codigo: c.telefoneResponsavel || undefined,
        })),
    },
    {
      modulo: "Pedidos",
      itens: dados.pedidos
        .filter((p) => contem(p.codigo, termo) || contem(nomeCliente(p.clienteId), termo))
        .slice(0, LIMITE_POR_GRUPO)
        .map((p) => ({
          id: p.id,
          destino: `/pedidos?abrir=${p.id}`,
          titulo: nomeCliente(p.clienteId),
          detalhe: `${p.numeroPlacas} ${p.numeroPlacas === 1 ? "placa" : "placas"} · ${formatBRL(p.valorCobrado)}`,
          codigo: p.codigo,
        })),
    },
    {
      modulo: "Prospecção",
      itens: dados.leads
        .filter((l) => contem(l.nomeEstabelecimento, termo) || contem(l.rua, termo))
        .slice(0, LIMITE_POR_GRUPO)
        .map((l) => ({
          id: l.id,
          destino: `/prospeccao?abrir=${l.id}`,
          titulo: l.nomeEstabelecimento,
          detalhe: l.rua,
        })),
    },
    {
      modulo: "Etiquetas NFC",
      itens: dados.etiquetas
        .filter(
          (e) =>
            contem(e.codigoInterno, termo) || contem(e.uid, termo) || contem(e.linkGravado, termo),
        )
        .slice(0, LIMITE_POR_GRUPO)
        .map((e) => ({
          id: e.id,
          destino: `/etiquetas?abrir=${e.id}`,
          titulo: e.codigoInterno,
          detalhe: e.linkGravado ?? "Sem link gravado",
          codigo: e.uid ?? undefined,
        })),
    },
    {
      modulo: "Estoque",
      itens: dados.itensEstoque
        .filter((i) => contem(i.nome, termo) || contem(i.fornecedor, termo))
        .slice(0, LIMITE_POR_GRUPO)
        .map((i) => ({
          id: i.id,
          destino: `/estoque?abrir=${i.id}`,
          titulo: i.nome,
          detalhe: i.fornecedor || "Sem fornecedor cadastrado",
          codigo: `${i.quantidadeAtual} ${i.unidade}`,
        })),
    },
  ];

  return grupos.filter((g) => g.itens.length > 0);
}
