// Modelo de dados central da aplicação.
// Ver docs/fase-0-arquitetura.md para o racional de cada campo.

export type ISODateString = string;

// ---------------------------------------------------------------------------
// Prospecção
// ---------------------------------------------------------------------------

export type CategoriaLead =
  | "barbearia"
  | "salao_beleza"
  | "pet_shop"
  | "lanchonete"
  | "padaria"
  | "estetica"
  | "oficina"
  | "otica"
  | "acai"
  | "hamburgueria"
  | "odontologia"
  | "restaurante"
  | "outros";

export const CATEGORIAS_LEAD: { value: CategoriaLead; label: string }[] = [
  { value: "barbearia", label: "Barbearia" },
  { value: "salao_beleza", label: "Salão de beleza" },
  { value: "pet_shop", label: "Pet shop" },
  { value: "lanchonete", label: "Lanchonete" },
  { value: "padaria", label: "Padaria" },
  { value: "estetica", label: "Estética" },
  { value: "oficina", label: "Oficina" },
  { value: "otica", label: "Ótica" },
  { value: "acai", label: "Açaí" },
  { value: "hamburgueria", label: "Hamburgueria" },
  { value: "odontologia", label: "Odontologia" },
  { value: "restaurante", label: "Restaurante" },
  { value: "outros", label: "Outros" },
];

export type SituacaoLead =
  | "a_visitar"
  | "visitado"
  | "interessado"
  | "vendido"
  | "descartado";

export const SITUACOES_LEAD: { value: SituacaoLead; label: string }[] = [
  { value: "a_visitar", label: "A visitar" },
  { value: "visitado", label: "Visitado" },
  { value: "interessado", label: "Interessado" },
  { value: "vendido", label: "Vendido" },
  { value: "descartado", label: "Descartado" },
];

export interface VisitaLead {
  id: string;
  data: ISODateString;
  resultado: SituacaoLead;
  atendidoPor: string | null;
  eraDono: boolean | null;
  proximaAcao: string | null;
  dataRetorno: ISODateString | null;
  observacoes: string;
}

export interface ReferenciaVizinho {
  nome: string;
  notaGoogle: number;
  numeroAvaliacoes: number;
}

export interface Lead {
  id: string;
  nomeEstabelecimento: string;
  endereco: string;
  rua: string;
  categoria: CategoriaLead;
  notaGoogle: number | null;
  numeroAvaliacoes: number | null;
  vizinhoReferencia: ReferenciaVizinho | null;
  situacao: SituacaoLead;
  dataVisita: ISODateString | null;
  atendidoPor: string | null;
  eraDono: boolean | null;
  motivoDescarte: string | null;
  dataRetorno: ISODateString | null;
  observacoes: string;
  historicoVisitas: VisitaLead[];
  clienteId: string | null;
  criadoEm: ISODateString;
  atualizadoEm: ISODateString;
}

// ---------------------------------------------------------------------------
// Clientes
// ---------------------------------------------------------------------------

export interface Cliente {
  id: string;
  nomeEstabelecimento: string;
  nomeResponsavel: string;
  telefoneResponsavel: string;
  endereco: string;
  linkAvaliacaoGoogle: string;
  linkEncurtado: string;
  dataPrimeiroPedido: ISODateString | null;
  indicadoPorClienteId: string | null;
  leadOrigemId: string | null;
  observacoes: string;
  criadoEm: ISODateString;
  atualizadoEm: ISODateString;
}

// ---------------------------------------------------------------------------
// Pedidos
// ---------------------------------------------------------------------------

export type EtapaPedido =
  | "vendido"
  | "link_criado"
  | "arte_pronta"
  | "impresso"
  | "nfc_gravado"
  | "testado"
  | "entregue"
  | "pago";

export const ETAPAS_PEDIDO: { value: EtapaPedido; label: string }[] = [
  { value: "vendido", label: "Vendido" },
  { value: "link_criado", label: "Link criado" },
  { value: "arte_pronta", label: "Arte pronta" },
  { value: "impresso", label: "Impresso" },
  { value: "nfc_gravado", label: "NFC gravado" },
  { value: "testado", label: "Testado" },
  { value: "entregue", label: "Entregue" },
  { value: "pago", label: "Pago" },
];

export interface HistoricoEtapa {
  etapa: EtapaPedido;
  data: ISODateString;
}

export interface Pedido {
  id: string;
  codigo: string;
  clienteId: string;
  pacoteId: string;
  numeroPlacas: number;
  valorCobrado: number;
  custoUnitarioSnapshot: number;
  dataVenda: ISODateString;
  dataPrometidaEntrega: ISODateString;
  etapa: EtapaPedido;
  historicoEtapas: HistoricoEtapa[];
  etiquetasIds: string[];
  dataEntregaReal: ISODateString | null;
  dataRetorno30Dias: ISODateString | null;
  retornoFeito: boolean;
  pago: boolean;
  dataPagamento: ISODateString | null;
  leadOrigemId: string | null;
  observacoes: string;
  criadoEm: ISODateString;
  atualizadoEm: ISODateString;
}

// ---------------------------------------------------------------------------
// Etiquetas NFC
// ---------------------------------------------------------------------------

export type SituacaoEtiqueta = "em_estoque" | "gravada" | "entregue" | "com_defeito";

export const SITUACOES_ETIQUETA: { value: SituacaoEtiqueta; label: string }[] = [
  { value: "em_estoque", label: "Em estoque" },
  { value: "gravada", label: "Gravada" },
  { value: "entregue", label: "Entregue" },
  { value: "com_defeito", label: "Com defeito" },
];

export type ResultadoTeste = "aprovado" | "reprovado" | "nao_testado";

export interface RegravacaoEtiqueta {
  id: string;
  data: ISODateString;
  linkAnterior: string;
  motivo: string;
}

export interface EtiquetaNFC {
  id: string;
  codigoInterno: string;
  uid: string | null;
  situacao: SituacaoEtiqueta;
  pedidoId: string | null;
  linkGravado: string | null;
  dataGravacao: ISODateString | null;
  gravadoPor: string | null;
  resultadoTeste: ResultadoTeste;
  aparelhoTeste: string | null;
  dataTeste: ISODateString | null;
  motivoDefeito: string | null;
  historicoRegravacoes: RegravacaoEtiqueta[];
  criadoEm: ISODateString;
}

// ---------------------------------------------------------------------------
// Estoque
// ---------------------------------------------------------------------------

export type TipoItemEstoque =
  | "etiqueta_nfc"
  | "adesivo_vinil"
  | "papel_qr"
  | "filamento_petg"
  | "embalagem";

export const TIPOS_ITEM_ESTOQUE: { value: TipoItemEstoque; label: string; unidade: string }[] = [
  { value: "etiqueta_nfc", label: "Etiqueta NFC NTAG213", unidade: "un" },
  { value: "adesivo_vinil", label: "Adesivo vinil base", unidade: "un" },
  { value: "papel_qr", label: "Papel adesivo para o QR", unidade: "un" },
  { value: "filamento_petg", label: "Filamento PETG", unidade: "g" },
  { value: "embalagem", label: "Embalagens", unidade: "un" },
];

export interface ItemEstoque {
  id: string;
  nome: string;
  tipo: TipoItemEstoque;
  unidade: "un" | "g";
  quantidadeAtual: number;
  quantidadeMinima: number;
  custoUnitario: number;
  fornecedor: string;
  prazoReposicaoDias: number;
  criadoEm: ISODateString;
  atualizadoEm: ISODateString;
}

export type TipoMovimentoEstoque = "entrada" | "saida" | "perda" | "ajuste";

export interface MovimentoEstoque {
  id: string;
  itemId: string;
  data: ISODateString;
  tipo: TipoMovimentoEstoque;
  quantidade: number;
  motivo: string;
  pedidoId: string | null;
}

// ---------------------------------------------------------------------------
// Configurações
// ---------------------------------------------------------------------------

export interface Pacote {
  id: string;
  nome: string;
  numeroPlacas: number;
  preco: number;
  ativo: boolean;
}

export interface CustosUnitarios {
  filamentoPorPlaca: number;
  etiquetaNfc: number;
  adesivoBase: number;
  etiquetaQr: number;
  energiaPorImpressao: number;
  embalagem: number;
  taxaPerdaPercentual: number;
}

export interface Socio {
  nome: string;
  telefone: string;
  email: string;
}

export interface Configuracao {
  custosUnitarios: CustosUnitarios;
  pacotes: Pacote[];
  marca: {
    nome: string;
    socios: Socio[];
    prazoPadraoEntregaDias: number;
    diasRetornoAcompanhamento: number;
  };
}
