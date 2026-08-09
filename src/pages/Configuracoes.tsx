import { Settings } from "lucide-react";
import { EmptyState } from "../components/EmptyState";

export default function Configuracoes() {
  return (
    <EmptyState
      icon={Settings}
      titulo="Configurações ainda não definidas"
      descricao="Custos por placa, pacotes e dados da marca alimentam os cálculos do resto do sistema. Configure antes de registrar o primeiro pedido, para o lucro já sair certo desde a primeira venda."
      acaoRotulo="Configurar agora"
    />
  );
}
