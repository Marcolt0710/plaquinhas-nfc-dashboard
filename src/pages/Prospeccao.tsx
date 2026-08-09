import { Footprints } from "lucide-react";
import { EmptyState } from "../components/EmptyState";

export default function Prospeccao() {
  return (
    <EmptyState
      icon={Footprints}
      titulo="Nenhum lead cadastrado ainda"
      descricao="Aqui você acompanha o roteiro de porta fria: comércios visitados, o que responderam e quando voltar. Comece cadastrando o primeiro comércio do seu roteiro."
      acaoRotulo="Novo lead"
    />
  );
}
