import { create } from "zustand";

interface AcaoPrimaria {
  rotulo: string;
  onClick: () => void;
}

interface UiState {
  acaoPrimaria: AcaoPrimaria | null;
  setAcaoPrimaria: (acao: AcaoPrimaria) => void;
  limparAcaoPrimaria: () => void;
}

// Estado de UI efêmero (não persiste). Guarda a ação primária que a
// tela atual registrou para o botão da Topbar — cada página chama
// usePrimaryAction (ver src/lib/usePrimaryAction.ts) para se anunciar.
export const useUiStore = create<UiState>((set) => ({
  acaoPrimaria: null,
  setAcaoPrimaria: (acao) => set({ acaoPrimaria: acao }),
  limparAcaoPrimaria: () => set({ acaoPrimaria: null }),
}));
