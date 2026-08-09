// Exportação de listas para CSV — para os sócios não ficarem presos ao
// sistema (Fase 10). Sem biblioteca externa: o formato é simples o
// suficiente (separador vírgula, aspas só quando o valor precisa).

function celulaCsv(valor: unknown): string {
  const texto = valor === null || valor === undefined ? "" : String(valor);
  if (texto.includes(",") || texto.includes('"') || texto.includes("\n")) {
    return `"${texto.replace(/"/g, '""')}"`;
  }
  return texto;
}

/**
 * Gera um CSV a partir de uma lista de linhas (cada linha é um objeto
 * rótulo->valor, já formatado como o usuário deve ver) e dispara o
 * download no navegador.
 */
export function exportarCsv(nomeArquivo: string, linhas: Record<string, unknown>[]) {
  if (linhas.length === 0) return;

  const colunas = Object.keys(linhas[0]);
  const cabecalho = colunas.map(celulaCsv).join(",");
  const corpo = linhas.map((linha) => colunas.map((coluna) => celulaCsv(linha[coluna])).join(","));
  // BOM no início para o Excel em pt-BR abrir com acentuação correta.
  const conteudo = "﻿" + [cabecalho, ...corpo].join("\r\n");

  const blob = new Blob([conteudo], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo.endsWith(".csv") ? nomeArquivo : `${nomeArquivo}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
