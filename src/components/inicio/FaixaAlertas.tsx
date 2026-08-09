import { useNavigate } from "react-router-dom";
import { ChevronRight, PackageX, Repeat2, TriangleAlert } from "lucide-react";

export interface AlertaInicio {
  chave: string;
  texto: string;
  rota: string;
  icone: "atraso" | "estoque" | "retorno";
}

const ICONES = {
  atraso: TriangleAlert,
  estoque: PackageX,
  retorno: Repeat2,
};

// Faixa de alertas do topo da Início — só existe quando há algo real
// para mostrar (Fase 8: "se não houver nada urgente, não invente
// urgência"). Cada linha é clicável e leva direto para o módulo.
export function FaixaAlertas({ alertas }: { alertas: AlertaInicio[] }) {
  const navigate = useNavigate();
  if (alertas.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {alertas.map((alerta) => {
        const Icone = ICONES[alerta.icone];
        return (
          <button
            key={alerta.chave}
            type="button"
            onClick={() => navigate(alerta.rota)}
            className="flex w-full items-center justify-between gap-3 rounded-lg border border-alert/30 bg-alert-tint px-4 py-3 text-left hover:border-alert/50"
          >
            <span className="flex min-w-0 items-center gap-2.5 text-sm text-alert">
              <Icone size={16} className="shrink-0" />
              <span className="min-w-0">{alerta.texto}</span>
            </span>
            <ChevronRight size={16} className="shrink-0 text-alert" />
          </button>
        );
      })}
    </div>
  );
}
