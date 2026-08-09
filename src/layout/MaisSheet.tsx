import { NavLink } from "react-router-dom";
import { X } from "lucide-react";
import { MOBILE_MAIS_ITEMS } from "../lib/nav";

interface MaisSheetProps {
  aberto: boolean;
  onFechar: () => void;
}

// Folha "Mais" do celular: reúne as seções que não cabem na barra
// inferior (Etiquetas NFC, Estoque, Financeiro, Configurações).
export function MaisSheet({ aberto, onFechar }: MaisSheetProps) {
  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        type="button"
        aria-label="Fechar menu"
        onClick={onFechar}
        className="absolute inset-0 bg-black/60"
      />
      <div className="absolute inset-x-0 bottom-0 rounded-t-lg border-t border-border bg-card p-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-lg text-primary">Mais opções</span>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onFechar}
            className="rounded-md p-1.5 text-secondary hover:bg-card-hover hover:text-primary"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex flex-col gap-1">
          {MOBILE_MAIS_ITEMS.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onFechar}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-3 text-base ${
                  isActive ? "bg-accent-tint text-accent" : "text-primary hover:bg-card-hover"
                }`
              }
            >
              <Icon size={20} strokeWidth={1.75} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
