import { Nfc } from "lucide-react";
import { EmptyState } from "../components/EmptyState";

export default function Etiquetas() {
  return (
    <EmptyState
      icon={Nfc}
      titulo="Nenhuma etiqueta cadastrada ainda"
      descricao="Cada etiqueta gravada guarda o link do cliente e o histórico de teste — é o registro que sustenta o suporte depois da entrega. Sem ele, um link perdido não tem como ser recuperado."
      acaoRotulo="Gravar etiqueta"
    />
  );
}
