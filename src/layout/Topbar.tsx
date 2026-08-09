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
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
          />
          <input
            id="busca-global"
            type="search"
            aria-label="Buscar clientes, pedidos e etiquetas"
            placeholder="Buscar clientes, pedidos, etiquetas…"
            title="Atalho: tecle / para focar aqui de qualquer tela"
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-sm border border-border bg-input py-2 pl-9 pr-9 text-sm text-primary placeholder:text-secondary focus:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-page"
          />
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-border px-1.5 py-0.5 font-mono text-xs text-secondary sm:inline-block">
            /
          </kbd>
        </div>
        {acaoPrimaria ? (
          <button
            type="button"
            onClick={acaoPrimaria.onClick}
            aria-label={acaoPrimaria.rotulo}
            title={`Atalho: tecle n`}
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
