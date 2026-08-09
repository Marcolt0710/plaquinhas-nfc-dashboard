import { useNavigate } from "react-router-dom";
import { ChevronRight, PackageX, Repeat2, TriangleAlert } from "lucide-react";

export interface AlertaInicio {
  chave: string;
  texto: string;
  rota: string;
  icone: "atraso" | "estoque" | "retorno";
  // Cor por severidade, conforme docs/fase-1-design-system.md: vermelho é
  // atraso/defeito/exclusão; estoque baixo e retorno vencendo são
  // amarelos (precisam de atenção, não são uma falha em curso).
  severidade: "alerta" | "atencao";
}

const ICONES = {
  atraso: TriangleAlert,
  estoque: PackageX,
  retorno: Repeat2,
};

const CLASSES_SEVERIDADE = {
  alerta: {
    borda: "border-alert/30 hover:border-alert/50",
    fundo: "bg-alert-tint",
    texto: "text-alert",
  },
  atencao: {
    borda: "border-attention/30 hover:border-attention/50",
    fundo: "bg-attention-tint",
    texto: "text-attention",
  },
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
        const cores = CLASSES_SEVERIDADE[alerta.severidade];
        return (
          <button
            key={alerta.chave}
            type="button"
            onClick={() => navigate(alerta.rota)}
            className={`flex w-full items-center justify-between gap-3 rounded-lg border ${cores.borda} ${cores.fundo} px-4 py-3 text-left`}
          >
            <span className={`flex min-w-0 items-center gap-2.5 text-sm ${cores.texto}`}>
              <Icone size={16} className="shrink-0" />
              <span className="min-w-0">{alerta.texto}</span>
            </span>
            <ChevronRight size={16} className={`shrink-0 ${cores.texto}`} />
          </button>
        );
      })}
    </div>
  );
}
