import { v4 as uuidv4 } from "uuid";

export function gerarId(): string {
  return uuidv4();
}

/**
 * Próximo código sequencial de um prefixo (ex. "PED-0007"), calculado a
 * partir do maior número já usado — não do tamanho da lista, para não
 * repetir código depois de uma exclusão.
 */
export function proximoCodigo(prefixo: string, existentes: string[]): string {
  const maiorNumero = existentes.reduce((maior, codigo) => {
    const partes = codigo.split("-");
    const numero = Number(partes[partes.length - 1]);
    return Number.isFinite(numero) && numero > maior ? numero : maior;
  }, 0);
  const proximo = maiorNumero + 1;
  return `${prefixo}-${String(proximo).padStart(4, "0")}`;
}
