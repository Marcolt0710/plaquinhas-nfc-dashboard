import { Plus, Search } from "lucide-react";
import { useLocation } from "react-router-dom";
import { TELAS } from "../lib/nav";
import { useUiStore } from "../store/useUiStore";

// Barra superior: título da tela atual, busca global e ação primária,
// que muda conforme a rota (Fase 2). Cada página registra sua própria
// ação via usePrimaryAction — a Topbar só exibe o que foi registrado.
export function Topbar() {
  const { pathname } = useLocation();
  const tela = TELAS[pathname] ?? { titulo: "" };
  const acaoPrimaria = useUiStore((state) => state.acaoPrimaria);

  return (
    <header className="flex flex-col gap-3 border-b border-border bg-page px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8 md:py-5">
      <h1 className="text-xl text-primary">{tela.titulo}</h1>
      <div className="flex items-center gap-3">
        <div className="relative flex-1 md:w-72">
          <Search
            size={16}
            strokeWidth={1.75}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
          />
          <input
            type="search"
            placeholder="Buscar clientes, pedidos, etiquetas..."
            className="w-full rounded-sm border border-border bg-input py-2 pl-9 pr-3 text-sm text-primary placeholder:text-secondary focus:border-accent focus:outline-none"
          />
        </div>
        {acaoPrimaria ? (
          <button
            type="button"
            onClick={acaoPrimaria.onClick}
            aria-label={acaoPrimaria.rotulo}
            className="flex shrink-0 items-center gap-1.5 rounded-md bg-accent px-3.5 py-2 text-sm font-medium text-accent-ink hover:bg-accent-strong md:px-4 md:py-2.5 md:text-base"
          >
            <Plus size={16} strokeWidth={2} />
            <span className="hidden sm:inline">{acaoPrimaria.rotulo}</span>
          </button>
        ) : null}
      </div>
    </header>
  );
}
