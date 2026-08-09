import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  titulo: string;
  descricao: string;
  acaoRotulo?: string;
  onAcao?: () => void;
}

// Estado vazio padrão: nunca é só um espaço em branco. Sempre explica o
// que vai aparecer ali e, quando fizer sentido, traz o botão que cria o
// primeiro registro (Fase 2 / Fase 10).
export function EmptyState({ icon: Icon, titulo, descricao, acaoRotulo, onAcao }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-card-hover">
        <Icon size={22} className="text-secondary" strokeWidth={1.75} />
      </div>
      <h2 className="mt-4 text-lg text-primary">{titulo}</h2>
      <p className="mt-2 max-w-sm text-sm text-secondary">{descricao}</p>
      {acaoRotulo ? (
        <button
          type="button"
          onClick={onAcao}
          className="mt-6 rounded-md bg-accent px-4 py-2.5 text-base font-medium text-accent-ink hover:bg-accent-strong"
        >
          {acaoRotulo}
        </button>
      ) : null}
    </div>
  );
}
