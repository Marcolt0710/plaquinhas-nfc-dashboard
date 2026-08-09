import { Wallet } from "lucide-react";
import { EmptyState } from "../components/EmptyState";

export default function Financeiro() {
  return (
    <EmptyState
      icon={Wallet}
      titulo="Os números aparecem depois da primeira venda paga"
      descricao="Faturamento, custo e lucro são calculados a partir dos pedidos marcados como pagos. Nada aparece aqui até a primeira venda ser fechada e paga — nenhum valor é estimado ou inventado."
    />
  );
}
