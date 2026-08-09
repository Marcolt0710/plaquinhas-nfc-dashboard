import type { Cliente, ItemEstoque, Pacote, Pedido } from "../../types";
import { chaveDoMes, chaveDoMesAnterior, inicioDaSemana } from "../../lib/date";

// Custo do pedido = custo por placa congelado na venda × número de
// placas. Nunca usa o custo atual de Configurações — só o snapshot.
export function custoDoPedido(pedido: Pedido): number {
  return pedido.custoUnitarioSnapshot * pedido.numeroPlacas;
}

export function lucroDoPedido(pedido: Pedido): number {
  return pedido.valorCobrado - custoDoPedido(pedido);
}

export function pedidosPagos(pedidos: Pedido[]): Pedido[] {
  return pedidos.filter((p) => p.pago);
}

export function pedidosAReceber(pedidos: Pedido[]): Pedido[] {
  return pedidos.filter((p) => p.etapa === "entregue" && !p.pago);
}

function pagosNoMes(pedidos: Pedido[], chaveMes: string): Pedido[] {
  return pedidosPagos(pedidos).filter(
    (p) => p.dataPagamento && chaveDoMes(p.dataPagamento) === chaveMes,
  );
}

export interface ResumoMes {
  faturamento: number;
  custo: number;
  lucro: number;
  margem: number;
  numeroPedidos: number;
}

export function resumoDoMes(pedidos: Pedido[], chaveMes: string): ResumoMes {
  const doMes = pagosNoMes(pedidos, chaveMes);
  const faturamento = doMes.reduce((soma, p) => soma + p.valorCobrado, 0);
  const custo = doMes.reduce((soma, p) => soma + custoDoPedido(p), 0);
  const lucro = faturamento - custo;
  return {
    faturamento,
    custo,
    lucro,
    margem: faturamento > 0 ? (lucro / faturamento) * 100 : 0,
    numeroPedidos: doMes.length,
  };
}

/** Variação percentual entre dois valores — null quando a base é 0 (sem comparação possível). */
export function variacaoPercentual(atual: number, anterior: number): number | null {
  if (anterior === 0) return null;
  return ((atual - anterior) / anterior) * 100;
}

// Ticket médio histórico (não só do mês) — mais estável com poucos
// pedidos por mês, que é o caso normal de um negócio ainda pequeno.
export function ticketMedioHistorico(pedidos: Pedido[]): number {
  const pagos = pedidosPagos(pedidos);
  if (pagos.length === 0) return 0;
  return pagos.reduce((soma, p) => soma + p.valorCobrado, 0) / pagos.length;
}

// Estoque parado é dinheiro parado: soma de quantidade × custo
// unitário de cada item cadastrado (etiquetas NFC entram à parte, via
// state.etiquetas, não como ItemEstoque — ver Fase 6).
export function investimentoEmEstoque(itensEstoque: ItemEstoque[]): number {
  return itensEstoque.reduce((soma, item) => soma + item.quantidadeAtual * item.custoUnitario, 0);
}

export interface LucroPorPacote {
  pacoteId: string;
  nome: string;
  quantidade: number;
  lucro: number;
}

export function lucroPorPacote(pedidos: Pedido[], pacotes: Pacote[]): LucroPorPacote[] {
  const mapa = new Map<string, LucroPorPacote>();
  for (const pedido of pedidosPagos(pedidos)) {
    const pacote = pacotes.find((p) => p.id === pedido.pacoteId);
    const nome = pacote?.nome ?? "Pacote removido";
    const atual = mapa.get(pedido.pacoteId) ?? { pacoteId: pedido.pacoteId, nome, quantidade: 0, lucro: 0 };
    atual.quantidade += 1;
    atual.lucro += lucroDoPedido(pedido);
    mapa.set(pedido.pacoteId, atual);
  }
  return Array.from(mapa.values()).sort((a, b) => b.lucro - a.lucro);
}

export interface PontoSemana {
  semana: string; // rótulo curto, ex. "04/08"
  faturamento: number;
  lucro: number;
}

// Últimas N semanas (padrão 8), a partir de hoje, com faturamento e
// lucro somados por semana — só pedidos pagos.
export function serieSemanal(pedidos: Pedido[], numeroSemanas = 8): PontoSemana[] {
  const hoje = new Date();
  const semanas: { chave: string; rotulo: string }[] = [];
  for (let i = numeroSemanas - 1; i >= 0; i--) {
    const referencia = new Date(hoje);
    referencia.setDate(referencia.getDate() - i * 7);
    const inicio = new Date(inicioDaSemana(referencia.toISOString()));
    const chave = inicio.toISOString().slice(0, 10);
    const rotulo = `${String(inicio.getDate()).padStart(2, "0")}/${String(inicio.getMonth() + 1).padStart(2, "0")}`;
    semanas.push({ chave, rotulo });
  }

  const pagos = pedidosPagos(pedidos);
  return semanas.map(({ chave, rotulo }) => {
    const doPeriodo = pagos.filter((p) => {
      if (!p.dataPagamento) return false;
      return inicioDaSemana(p.dataPagamento).slice(0, 10) === chave;
    });
    return {
      semana: rotulo,
      faturamento: doPeriodo.reduce((soma, p) => soma + p.valorCobrado, 0),
      lucro: doPeriodo.reduce((soma, p) => soma + lucroDoPedido(p), 0),
    };
  });
}

export interface FatiaPacote {
  nome: string;
  quantidade: number;
}

export function distribuicaoPorPacote(pedidos: Pedido[], pacotes: Pacote[]): FatiaPacote[] {
  return lucroPorPacote(pedidos, pacotes).map(({ nome, quantidade }) => ({ nome, quantidade }));
}

export interface PontoClientes {
  mes: string; // "AAAA-MM"
  rotulo: string;
  total: number;
}

// Contagem cumulativa de clientes por mês de cadastro (criadoEm) — uma
// linha crescente mostra o ritmo de aquisição ao longo do tempo.
export function evolucaoClientes(clientes: Cliente[]): PontoClientes[] {
  if (clientes.length === 0) return [];
  const ordenados = [...clientes].sort((a, b) => a.criadoEm.localeCompare(b.criadoEm));
  const porMes = new Map<string, number>();
  for (const cliente of ordenados) {
    const chave = chaveDoMes(cliente.criadoEm);
    porMes.set(chave, (porMes.get(chave) ?? 0) + 1);
  }
  const mesesOrdenados = Array.from(porMes.keys()).sort();
  let acumulado = 0;
  return mesesOrdenados.map((mes) => {
    acumulado += porMes.get(mes) ?? 0;
    const [ano, mesNumero] = mes.split("-");
    return { mes, rotulo: `${mesNumero}/${ano.slice(2)}`, total: acumulado };
  });
}

export { chaveDoMes, chaveDoMesAnterior };
