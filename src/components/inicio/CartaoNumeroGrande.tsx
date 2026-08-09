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

// Fio superior: 2px da cor do tom, só quando o valor tem carga (verde
// para positivo, vermelho para alerta). No tom neutro ele fica na cor
// de borda e some — é o que evita que os quatro cartões pareçam
// igualmente importantes quando não são.
const COR_FIO = {
  primary: "bg-border",
  accent: "bg-accent",
  alert: "bg-alert",
};

// Os quatro números da Início usam text-3xl/peso 700 — a escala máxima
// da Fase 1, reservada a estes indicadores (ver docs/fase-1-design-system.md §2).
// tom="accent" só deve ser passado quando o valor é genuinamente positivo
// (R$ 0,00 não é positivo) — verde raro continua raro mesmo aqui.
export function CartaoNumeroGrande({ rotulo, valor, nota, tom = "primary" }: CartaoNumeroGrandeProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className={`h-0.5 w-full ${COR_FIO[tom]}`} aria-hidden="true" />
      <div className="p-4">
        <p className="text-xs uppercase tracking-wide text-secondary">{rotulo}</p>
        {/* tabular-nums via .num: sem isso os dígitos mudam de largura e
            os quatro números não alinham entre si na grade. */}
        <p className={`num mt-1.5 truncate font-mono text-3xl ${COR_TOM[tom]}`}>{valor}</p>
        {nota ? <p className="mt-1 text-xs text-secondary">{nota}</p> : null}
      </div>
    </div>
  );
}
