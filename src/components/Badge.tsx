import type { ReactNode } from "react";

export type BadgeTone =
  | "neutro"
  | "neutroClaro"
  | "verde"
  | "verdeSolido"
  | "amarelo"
  | "vermelho"
  | "vermelhoSuave";

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutro: "bg-card-hover text-secondary",
  neutroClaro: "bg-card-hover text-primary",
  verde: "bg-accent-tint text-accent",
  verdeSolido: "bg-accent text-accent-ink",
  amarelo: "bg-attention-tint text-attention",
  vermelho: "bg-alert-tint text-alert",
  vermelhoSuave: "bg-card-hover text-alert/70",
};

interface BadgeProps {
  tone: BadgeTone;
  children: ReactNode;
  className?: string;
}

// Crachá de status reutilizável — ver docs/fase-1-design-system.md §4/§5
// para quando usar cada tom. O verde é raro de propósito.
export function Badge({ tone, children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${TONE_CLASSES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
