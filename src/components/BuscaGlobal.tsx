import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { buscarTudo, type ResultadoBusca } from "../lib/busca";

// md:left-auto md:right-0 — no desktop o painel é mais largo que o campo,
// e o campo fica colado na borda direita da barra: ancorado à esquerda,
// o excesso vazava 64px para fora da tela (medido: scrollWidth 1504 numa
// viewport de 1440). Ancorado à direita, ele cresce para dentro.
const CLASSES_PAINEL =
  "anim-surgir absolute left-0 right-0 top-full z-50 mt-1.5 max-h-[70vh] overflow-y-auto overscroll-contain rounded-md border border-border bg-card py-1 md:left-auto md:right-0 md:w-96";

export function BuscaGlobal() {
  const navigate = useNavigate();
  const clientes = useAppStore((s) => s.clientes);
  const pedidos = useAppStore((s) => s.pedidos);
  const leads = useAppStore((s) => s.leads);
  const etiquetas = useAppStore((s) => s.etiquetas);
  const itensEstoque = useAppStore((s) => s.itensEstoque);

  const [termo, setTermo] = useState("");
  const [aberto, setAberto] = useState(false);
  const [indiceAtivo, setIndiceAtivo] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const grupos = useMemo(
    () => buscarTudo(termo, { clientes, pedidos, leads, etiquetas, itensEstoque }),
    [termo, clientes, pedidos, leads, etiquetas, itensEstoque],
  );

  // Lista achatada: a navegação por seta atravessa os grupos como se
  // fossem uma lista só, que é como a pessoa enxerga.
  const planos = useMemo(() => grupos.flatMap((g) => g.itens), [grupos]);

  useEffect(() => setIndiceAtivo(0), [termo]);

  // Fecha ao clicar fora.
  useEffect(() => {
    function aoClicar(evento: MouseEvent) {
      if (!containerRef.current?.contains(evento.target as Node)) setAberto(false);
    }
    document.addEventListener("mousedown", aoClicar);
    return () => document.removeEventListener("mousedown", aoClicar);
  }, []);

  function abrir(resultado: ResultadoBusca) {
    navigate(resultado.destino);
    setTermo("");
    setAberto(false);
  }

  function aoTeclar(evento: React.KeyboardEvent) {
    if (evento.key === "Escape") {
      setAberto(false);
      (evento.target as HTMLInputElement).blur();
      return;
    }
    if (planos.length === 0) return;
    if (evento.key === "ArrowDown") {
      evento.preventDefault();
      setIndiceAtivo((i) => (i + 1) % planos.length);
    } else if (evento.key === "ArrowUp") {
      evento.preventDefault();
      setIndiceAtivo((i) => (i - 1 + planos.length) % planos.length);
    } else if (evento.key === "Enter") {
      evento.preventDefault();
      const alvo = planos[indiceAtivo];
      if (alvo) abrir(alvo);
    }
  }

  const mostrarPainel = aberto && termo.trim().length >= 2;
  let contadorGlobal = -1;

  return (
    <div ref={containerRef} className="relative flex-1 md:w-72">
      <Search
        size={16}
        strokeWidth={1.75}
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
      />
      <input
        id="busca-global"
        type="search"
        role="combobox"
        aria-expanded={mostrarPainel}
        aria-controls="resultados-busca"
        aria-label="Buscar clientes, pedidos e etiquetas"
        placeholder="Buscar clientes, pedidos, etiquetas…"
        title="Atalho: tecle / para focar aqui de qualquer tela"
        autoComplete="off"
        spellCheck={false}
        value={termo}
        onChange={(e) => {
          setTermo(e.target.value);
          setAberto(true);
        }}
        onFocus={() => setAberto(true)}
        onKeyDown={aoTeclar}
        className="w-full rounded-sm border border-border bg-input py-2 pl-9 pr-9 text-sm text-primary placeholder:text-secondary focus:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-page"
      />
      {termo ? (
        <button
          type="button"
          aria-label="Limpar busca"
          onClick={() => {
            setTermo("");
            document.getElementById("busca-global")?.focus();
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-secondary hover:text-primary"
        >
          <X size={14} aria-hidden="true" />
        </button>
      ) : (
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-border px-1.5 py-0.5 font-mono text-xs text-secondary sm:inline-block">
          /
        </kbd>
      )}

      {mostrarPainel && (
        <div
          id="resultados-busca"
          role="listbox"
          className={CLASSES_PAINEL}
        >
          {planos.length === 0 ? (
            <p className="px-3 py-4 text-sm text-secondary">
              Nada encontrado para “{termo.trim()}”. A busca cobre nome de cliente e de comércio,
              código de pedido, telefone, UID e link de etiqueta.
            </p>
          ) : (
            grupos.map((grupo) => (
              <div key={grupo.modulo}>
                <p className="px-3 pb-1 pt-2 text-xs uppercase tracking-wide text-secondary">
                  {grupo.modulo}
                </p>
                {grupo.itens.map((item) => {
                  contadorGlobal += 1;
                  const ativo = contadorGlobal === indiceAtivo;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="option"
                      aria-selected={ativo}
                      onClick={() => abrir(item)}
                      onMouseEnter={() => setIndiceAtivo(planos.indexOf(item))}
                      className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left ${
                        ativo ? "bg-card-hover" : ""
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-primary">{item.titulo}</span>
                        <span className="block truncate text-xs text-secondary">{item.detalhe}</span>
                      </span>
                      {item.codigo ? (
                        <span className="num shrink-0 font-mono text-xs text-secondary">
                          {item.codigo}
                        </span>
                      ) : null}
                    </button>
                  );
                })
                }
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
