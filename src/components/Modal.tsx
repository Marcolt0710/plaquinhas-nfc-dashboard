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
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onFechar}
        className="absolute inset-0 bg-black/60"
      />
      <div
        className={`relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-lg border border-border bg-card md:m-4 md:rounded-lg ${LARGURAS[largura]}`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg text-primary">{titulo}</h2>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onFechar}
            className="rounded-md p-1.5 text-secondary hover:bg-card-hover hover:text-primary"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>
  );
}
