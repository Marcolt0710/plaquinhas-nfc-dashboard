import { itemAbaixoDoMinimo, percentualNivel } from "./estoqueHelpers";

interface NivelBarraProps {
  quantidadeAtual: number;
  quantidadeMinima: number;
}

export function NivelBarra({ quantidadeAtual, quantidadeMinima }: NivelBarraProps) {
  const abaixoDoMinimo = itemAbaixoDoMinimo({ quantidadeAtual, quantidadeMinima });
  const percentual = percentualNivel({ quantidadeAtual, quantidadeMinima });

  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-card-hover">
      <div
        className={`h-full rounded-full ${abaixoDoMinimo ? "bg-attention" : "bg-accent"}`}
        style={{ width: `${percentual}%` }}
      />
    </div>
  );
}
