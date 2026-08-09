interface CartaoNumeroGrandeProps {
  rotulo: string;
  valor: string;
  nota?: string;
  tom?: "primary" | "accent" | "alert";
}

const COR_TOM = {
  primary: "text-primary",
  accent: "text-accent",
  alert: "text-alert",
};

// Os quatro números da Início usam text-3xl/peso 700 — a escala máxima
// da Fase 1, reservada a estes indicadores (ver docs/fase-1-design-system.md §2).
// tom="accent" só deve ser passado quando o valor é genuinamente positivo
// (R$ 0,00 não é positivo) — verde raro continua raro mesmo aqui.
export function CartaoNumeroGrande({ rotulo, valor, nota, tom = "primary" }: CartaoNumeroGrandeProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wide text-secondary">{rotulo}</p>
      <p className={`mt-1 font-mono text-3xl ${COR_TOM[tom]}`}>{valor}</p>
      {nota ? <p className="mt-1 text-xs text-secondary">{nota}</p> : null}
    </div>
  );
}
