import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Abre a ficha apontada por `?abrir=<id>` na URL e limpa o parâmetro em
 * seguida.
 *
 * A limpeza importa: sem ela, fechar o painel deixaria o parâmetro na
 * URL e qualquer re-render reabriria a ficha — a pessoa não conseguiria
 * fechar. Também deixa a URL limpa para o próximo compartilhamento.
 *
 * Usado pela busca global, que navega para `/pedidos?abrir=<id>` em vez
 * de só levar para o módulo e obrigar a procurar de novo.
 */
export function useAbrirPorParametro(abrir: (id: string) => void) {
  const [params, setParams] = useSearchParams();
  const id = params.get("abrir");

  useEffect(() => {
    if (!id) return;
    abrir(id);
    const restantes = new URLSearchParams(params);
    restantes.delete("abrir");
    setParams(restantes, { replace: true });
    // Depende só do id: incluir `abrir` ou `params` re-dispararia o
    // efeito a cada render, reabrindo o painel sem parar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
}
