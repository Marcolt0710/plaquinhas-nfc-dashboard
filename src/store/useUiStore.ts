import { create } from "zustand";

interface AcaoPrimaria {
  rotulo: string;
  onClick: () => void;
}

interface Toast {
  id: number;
  mensagem: string;
}

interface UiState {
  acaoPrimaria: AcaoPrimaria | null;
  setAcaoPrimaria: (acao: AcaoPrimaria) => void;
  limparAcaoPrimaria: () => void;

  toast: Toast | null;
  mostrarToast: (mensagem: string) => void;
  limparToast: () => void;
}

// Estado de UI efêmero (não persiste). Guarda a ação primária que a
// tela atual registrou para o botão da Topbar — cada página chama
// usePrimaryAction (ver src/lib/usePrimaryAction.ts) para se anunciar —
// e o aviso de sucesso mais recente, mostrado pelo componente Toast em
// AppShell (Fase 10, item 5): "aviso de sucesso ao salvar, com o mesmo
// verbo do botão".
export const useUiStore = create<UiState>((set) => ({
  acaoPrimaria: null,
  setAcaoPrimaria: (acao) => set({ acaoPrimaria: acao }),
  limparAcaoPrimaria: () => set({ acaoPrimaria: null }),

  toast: null,
  mostrarToast: (mensagem) => set({ toast: { id: Date.now(), mensagem } }),
  limparToast: () => set({ toast: null }),
}));

/** Chame de qualquer lugar (fora de componente também) para mostrar um toast de sucesso. */
export function mostrarToast(mensagem: string) {
  useUiStore.getState().mostrarToast(mensagem);
}
