import { useEffect } from "react";
import { useUiStore } from "../store/useUiStore";

/**
 * Registra a ação primária da Topbar para a tela atual. Chame no topo
 * da página; a ação some automaticamente quando a página desmonta.
 * Passe `null` quando a tela ainda não tem ação disponível (ex.
 * estado vazio sem CTA).
 */
export function usePrimaryAction(acao: { rotulo: string; onClick: () => void } | null) {
  const setAcaoPrimaria = useUiStore((state) => state.setAcaoPrimaria);
  const limparAcaoPrimaria = useUiStore((state) => state.limparAcaoPrimaria);

  useEffect(() => {
    if (acao) {
      setAcaoPrimaria(acao);
    } else {
      limparAcaoPrimaria();
    }
    return () => limparAcaoPrimaria();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acao?.rotulo, acao?.onClick]);
}
