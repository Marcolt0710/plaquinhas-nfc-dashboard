import { useEffect, useState } from "react";

/** Mostra uma mensagem de sucesso por alguns segundos após salvar. */
export function useMensagemSucesso() {
  const [mensagem, setMensagem] = useState<string | null>(null);

  useEffect(() => {
    if (!mensagem) return;
    const id = setTimeout(() => setMensagem(null), 3000);
    return () => clearTimeout(id);
  }, [mensagem]);

  return { mensagem, mostrar: setMensagem };
}
