import { Plus } from "lucide-react";
import { useLocation } from "react-router-dom";
import { TELAS } from "../lib/nav";
import { useUiStore } from "../store/useUiStore";
import { BuscaGlobal } from "../components/BuscaGlobal";

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
        <BuscaGlobal />
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
