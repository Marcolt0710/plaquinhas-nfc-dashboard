interface TooltipItem {
  name?: string;
  value?: number | string;
  color?: string;
}

interface TooltipGraficoProps {
  active?: boolean;
  label?: string;
  payload?: TooltipItem[];
  formatarValor?: (valor: number) => string;
}

// Tooltip padrão dos gráficos do Financeiro, no estilo cartão escuro
// dos tokens da Fase 1 (recharts não aceita classes Tailwind direto
// no tooltip, então isso fica como componente controlado).
export function TooltipGrafico({ active, label, payload, formatarValor }: TooltipGraficoProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-none">
      {label ? <p className="mb-1 text-secondary">{label}</p> : null}
      {payload.map((item, indice) => (
        <p key={indice} className="flex items-center gap-2 text-primary">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
          {item.name}:{" "}
          <span className="font-mono">
            {typeof item.value === "number" && formatarValor ? formatarValor(item.value) : item.value}
          </span>
        </p>
      ))}
    </div>
  );
}
