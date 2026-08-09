import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  titulo: string;
  onFechar: () => void;
  children: ReactNode;
  largura?: "sm" | "md" | "lg";
}

const LARGURAS: Record<NonNullable<ModalProps["largura"]>, string> = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-2xl",
};

// Modal genérico centralizado, fecha com Esc ou clique no fundo.
// Reaproveitado por todos os formulários de criação/edição do projeto.
export function Modal({ titulo, onFechar, children, largura = "md" }: ModalProps) {
  useEffect(() => {
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === "Escape") onFechar();
    }
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [onFechar]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center md:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
    >
      <button
        type="button"
        aria-label="Fechar"
        onClick={onFechar}
        className="absolute inset-0 bg-black/60"
      />
      <div
        className={`relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-lg border border-border bg-card pb-[env(safe-area-inset-bottom)] md:m-4 md:rounded-lg md:pb-0 ${LARGURAS[largura]}`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg text-primary">{titulo}</h2>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onFechar}
            className="rounded-md p-1.5 text-secondary hover:bg-card-hover hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        {/* overscroll-contain: rolar até o fim do modal não pode
            arrastar a página atrás junto, que é o comportamento padrão
            e fica visível no celular. */}
        <div className="overflow-y-auto overscroll-contain px-5 py-5">{children}</div>
      </div>
    </div>
  );
}
