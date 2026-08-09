import type { ReactNode } from "react";

interface CartaoIndicadorProps {
  rotulo: string;
  valor: string;
  variacao?: { texto: string; positiva: boolean } | null;
  nota?: string;
  children?: ReactNode;
}

// Cartão de indicador padrão do Financeiro: rótulo pequeno, valor
// grande em mono, variação opcional (verde/vermelho conforme sinal).
export function CartaoIndicador({ rotulo, valor, variacao, nota, children }: CartaoIndicadorProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wide text-secondary">{rotulo}</p>
      <p className="mt-1 truncate font-mono text-2xl text-primary">{valor}</p>
      {variacao ? (
        <p className={`mt-1 text-xs ${variacao.positiva ? "text-accent" : "text-alert"}`}>{variacao.texto}</p>
      ) : nota ? (
        <p className="mt-1 text-xs text-secondary">{nota}</p>
      ) : null}
      {children}
    </div>
  );
}
