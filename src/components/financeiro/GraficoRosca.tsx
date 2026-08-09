import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { FatiaPacote } from "./financeiroHelpers";
import { TooltipGrafico } from "./TooltipGrafico";

// Paleta categórica dedicada a este gráfico — deliberadamente fora do
// verde de destaque da Fase 1 (que continua raro no resto da UI).
// Tentamos primeiro variar só a opacidade do verde, mas isso falha o
// validador de acessibilidade do skill de dataviz (scripts/validate_palette.js):
// mesma matiz em opacidades diferentes não é distinguível por daltonismo
// (deuteranopia/protanopia colapsam a matiz, sobra só luminosidade) e o
// tom mais apagado nem sequer bate 3:1 de contraste com o fundo do cartão.
// Estas 4 cores foram validadas com `validate_palette.js ... --mode dark
// --surface #15181B --pairs all`: todos os testes passam.
const CORES = ["#3987e5", "#d95926", "#199e70", "#8b939b"];

export function GraficoRosca({ dados }: { dados: FatiaPacote[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={dados}
          dataKey="quantidade"
          nameKey="nome"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={2}
          stroke="var(--bg-card)"
          strokeWidth={2}
          isAnimationActive={false}
        >
          {dados.map((entrada, indice) => (
            <Cell key={entrada.nome} fill={CORES[indice % CORES.length]} />
          ))}
        </Pie>
        <Tooltip content={<TooltipGrafico />} />
        <Legend wrapperStyle={{ fontSize: 12, color: "var(--text-secondary)" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
