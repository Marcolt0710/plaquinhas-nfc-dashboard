import { Download } from "lucide-react";

interface BotaoExportarCsvProps {
  onExportar: () => void;
  className?: string;
}

// Botão padrão de "Exportar CSV" — mesmo estilo em todas as telas de
// listagem que oferecem exportação (Fase 10, item 8).
export function BotaoExportarCsv({ onExportar, className = "" }: BotaoExportarCsvProps) {
  return (
    <button
      type="button"
      onClick={onExportar}
      className={`flex shrink-0 items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium text-secondary hover:border-border-strong hover:text-primary ${className}`}
    >
      <Download size={15} /> Exportar CSV
    </button>
  );
}
