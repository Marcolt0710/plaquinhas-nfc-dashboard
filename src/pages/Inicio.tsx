import { Footprints } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";

export default function Inicio() {
  const navigate = useNavigate();
  return (
    <EmptyState
      icon={Footprints}
      titulo="Tudo pronto para começar"
      descricao="Assim que você cadastrar leads, pedidos e etiquetas, esta tela reúne o que precisa de atenção hoje: entregas, retornos e alertas de estoque."
      acaoRotulo="Ir para Prospecção"
      onAcao={() => navigate("/prospeccao")}
    />
  );
}
