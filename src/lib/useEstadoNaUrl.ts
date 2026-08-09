import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Um pedaço de estado de tela que vive na URL em vez de em useState.
 *
 * Por que isso importa aqui: filtro de rua, situação e busca definem o
 * que a pessoa está olhando. Guardados só em memória, eles somem ao
 * recarregar e não dá para mandar a visão para o sócio. Na URL, "os
 * leads a visitar da R. dos Alecrins" vira um link.
 *
 * O valor padrão nunca é escrito na URL — só o que difere dele. Assim a
 * URL fica curta e legível, em vez de carregar todo filtro em branco.
 */
// NoInfer no padrão: sem isso, useEstadoNaUrl("q", "") infere T como o
// tipo literal "" em vez de string, e qualquer setBusca("texto") vira
// erro de tipo. Com NoInfer, T sai do parâmetro de tipo explícito (ou
// de string, por omissão) e o padrão só precisa ser compatível.
export function useEstadoNaUrl<T extends string = string>(
  chave: string,
  padrao: NoInfer<T>,
): [T, (valor: T) => void] {
  const [params, setParams] = useSearchParams();
  const valor = (params.get(chave) as T) ?? padrao;

  const definir = useCallback(
    (novo: T) => {
      setParams(
        (atuais) => {
          const proximos = new URLSearchParams(atuais);
          if (novo === padrao) proximos.delete(chave);
          else proximos.set(chave, novo);
          return proximos;
        },
        // replace: filtrar não é navegação — sem isso cada tecla digitada
        // na busca viraria uma entrada no histórico e o botão "voltar"
        // do navegador ficaria inutilizável.
        { replace: true },
      );
    },
    [chave, padrao, setParams],
  );

  return [valor, definir];
}
