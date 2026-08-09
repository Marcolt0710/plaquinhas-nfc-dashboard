import type {
  Cliente,
  Configuracao,
  EtiquetaNFC,
  ItemEstoque,
  Lead,
  MovimentoEstoque,
  Pedido,
} from "../types";

export const VERSAO_BACKUP = 1;

export interface ArquivoBackup {
  versao: number;
  geradoEm: string;
  leads: Lead[];
  clientes: Cliente[];
  pedidos: Pedido[];
  etiquetas: EtiquetaNFC[];
  itensEstoque: ItemEstoque[];
  movimentosEstoque: MovimentoEstoque[];
  configuracao: Configuracao;
}

export interface ResumoMesclagem {
  adicionados: number;
  atualizados: number;
  mantidos: number;
}

type ComId = { id: string };
type ComAtualizacao = ComId & { atualizadoEm?: string };

/**
 * Mescla duas listas por id.
 *
 * Regra: registro que só existe no arquivo é adicionado. Registro que
 * existe nos dois é resolvido pela data de atualização, e o mais recente
 * vence. Registro sem `atualizadoEm` (etiqueta, movimento de estoque)
 * nunca sobrescreve o local — não há como saber qual é o mais novo, e
 * apagar um registro de gravação de etiqueta por engano é justamente o
 * dano que este sistema existe para evitar.
 */
export function mesclarPorId<T extends ComAtualizacao>(
  locais: T[],
  doArquivo: T[],
): { resultado: T[]; resumo: ResumoMesclagem } {
  const porId = new Map(locais.map((item) => [item.id, item]));
  const resumo: ResumoMesclagem = { adicionados: 0, atualizados: 0, mantidos: 0 };

  for (const entrante of doArquivo) {
    const local = porId.get(entrante.id);
    if (!local) {
      porId.set(entrante.id, entrante);
      resumo.adicionados += 1;
      continue;
    }
    if (entrante.atualizadoEm && local.atualizadoEm && entrante.atualizadoEm > local.atualizadoEm) {
      porId.set(entrante.id, entrante);
      resumo.atualizados += 1;
    } else {
      resumo.mantidos += 1;
    }
  }

  return { resultado: [...porId.values()], resumo };
}

export function somarResumos(resumos: ResumoMesclagem[]): ResumoMesclagem {
  return resumos.reduce(
    (soma, r) => ({
      adicionados: soma.adicionados + r.adicionados,
      atualizados: soma.atualizados + r.atualizados,
      mantidos: soma.mantidos + r.mantidos,
    }),
    { adicionados: 0, atualizados: 0, mantidos: 0 },
  );
}

/** Valida o arquivo antes de deixar qualquer dado entrar na store. */
export function validarBackup(bruto: unknown): { ok: true; dados: ArquivoBackup } | { ok: false; erro: string } {
  if (typeof bruto !== "object" || bruto === null) {
    return { ok: false, erro: "O arquivo não é um backup válido — o conteúdo não é um objeto JSON." };
  }
  const dados = bruto as Partial<ArquivoBackup>;
  if (typeof dados.versao !== "number") {
    return {
      ok: false,
      erro: "O arquivo não tem versão de backup. Use um arquivo gerado pelo próprio botão de backup.",
    };
  }
  if (dados.versao > VERSAO_BACKUP) {
    return {
      ok: false,
      erro: `O arquivo foi gerado por uma versão mais nova do sistema (versão ${dados.versao}). Atualize esta instalação antes de importar.`,
    };
  }
  const listas: (keyof ArquivoBackup)[] = [
    "leads",
    "clientes",
    "pedidos",
    "etiquetas",
    "itensEstoque",
    "movimentosEstoque",
  ];
  for (const chave of listas) {
    if (!Array.isArray(dados[chave])) {
      return { ok: false, erro: `O arquivo está incompleto: falta a lista "${chave}".` };
    }
  }
  return { ok: true, dados: dados as ArquivoBackup };
}

export function baixarBackup(dados: Omit<ArquivoBackup, "versao" | "geradoEm">) {
  const arquivo: ArquivoBackup = { versao: VERSAO_BACKUP, geradoEm: new Date().toISOString(), ...dados };
  const blob = new Blob([JSON.stringify(arquivo, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const dia = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `backup-plaquinhas-${dia}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
