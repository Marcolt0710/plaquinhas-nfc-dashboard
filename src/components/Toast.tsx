import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { useUiStore } from "../store/useUiStore";

const DURACAO_MS = 3000;

// Aviso de sucesso global, no mesmo verbo do botão que disparou a ação
// (Fase 10, item 5) — ex. botão "Gravar" -> toast "Etiqueta gravada".
// Renderizado uma vez em AppShell; qualquer lugar do app chama
// mostrarToast() (src/store/useUiStore.ts) para exibi-lo.
export function Toast() {
  const toast = useUiStore((state) => state.toast);
  const limparToast = useUiStore((state) => state.limparToast);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(limparToast, DURACAO_MS);
    return () => clearTimeout(timer);
  }, [toast, limparToast]);

  if (!toast) return null;

  // key remonta o elemento a cada toast novo, para a entrada tocar de
  // novo em vez de o texto trocar sem aviso. A centralização horizontal
  // vive dentro do keyframe .anim-toast, não numa classe translate —
  // senão a animação sobrescreveria o transform e o toast sairia do
  // centro ao entrar.
  return (
    <div
      role="status"
      aria-live="polite"
      key={toast.id}
      className="anim-toast fixed bottom-20 left-1/2 z-50 flex items-center gap-2 rounded-md border border-accent/30 bg-card px-4 py-3 text-sm text-primary shadow-none md:bottom-6"
    >
      <CheckCircle2 size={16} aria-hidden="true" className="shrink-0 text-accent" />
      {toast.mensagem}
    </div>
  );
}
