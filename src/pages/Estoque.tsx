import { Boxes } from "lucide-react";
import { EmptyState } from "../components/EmptyState";

export default function Estoque() {
  return (
    <EmptyState
      icon={Boxes}
      titulo="Nenhum item de estoque cadastrado ainda"
      descricao="Cadastre etiquetas NFC, adesivo vinil, papel do QR, filamento PETG e embalagens para acompanhar quantidade e saber quando repor."
      acaoRotulo="Novo item"
    />
  );
}
