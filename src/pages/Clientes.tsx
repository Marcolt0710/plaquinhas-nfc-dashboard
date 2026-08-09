import { Users } from "lucide-react";
import { EmptyState } from "../components/EmptyState";

export default function Clientes() {
  return (
    <EmptyState
      icon={Users}
      titulo="Nenhum cliente cadastrado ainda"
      descricao="Um cliente aparece aqui quando um lead vira venda, ou quando alguém chega pronto para comprar por indicação. Cadastre o primeiro para começar o histórico."
      acaoRotulo="Novo cliente"
    />
  );
}
