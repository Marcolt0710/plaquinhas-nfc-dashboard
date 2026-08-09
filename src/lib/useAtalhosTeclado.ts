import { useEffect } from "react";
import { useUiStore } from "../store/useUiStore";

const CAMPOS_DE_TEXTO = new Set(["INPUT", "TEXTAREA", "SELECT"]);

function focoEstaEmCampoDeTexto(): boolean {
  const ativo = document.activeElement;
  if (!ativo) return false;
  if (CAMPOS_DE_TEXTO.has(ativo.tagName)) return true;
  return (ativo as HTMLElement).isContentEditable === true;
}

// Atalhos de teclado das ações mais usadas (Fase 10, item 9):
// "/" foca a busca global da Topbar; "n" dispara a ação primária da
// tela atual (o mesmo botão verde da Topbar). Esc já fecha modais,
// tratado localmente em cada um. Desativado enquanto o foco estiver
// num campo de texto, para não atrapalhar quem está digitando.
export function useAtalhosTeclado() {
  const acaoPrimaria = useUiStore((state) => state.acaoPrimaria);

  useEffect(() => {
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.metaKey || evento.ctrlKey || evento.altKey) return;
      if (focoEstaEmCampoDeTexto()) return;

      if (evento.key === "/") {
        const campoBusca = document.getElementById("busca-global") as HTMLInputElement | null;
        if (campoBusca) {
          evento.preventDefault();
          campoBusca.focus();
        }
        return;
      }

      if (evento.key === "n" && acaoPrimaria) {
        evento.preventDefault();
        acaoPrimaria.onClick();
      }
    }

    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [acaoPrimaria]);
}
