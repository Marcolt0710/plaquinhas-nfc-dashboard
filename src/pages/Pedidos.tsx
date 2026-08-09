import { ClipboardList } from "lucide-react";
import { EmptyState } from "../components/EmptyState";

export default function Pedidos() {
  return (
    <EmptyState
      icon={ClipboardList}
      titulo="Nenhum pedido registrado ainda"
      descricao="Cada venda vira um pedido, que passa por etapas de produção — do link criado até a entrega e o pagamento. Registre o primeiro para acompanhar o quadro."
      acaoRotulo="Novo pedido"
    />
  );
}
