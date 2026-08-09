import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PontoSemana } from "./financeiroHelpers";
import { formatBRL } from "../../lib/format";
import { TooltipGrafico } from "./TooltipGrafico";

export function GraficoBarrasSemanal({ dados }: { dados: PontoSemana[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={dados} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="semana"
          tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
          axisLine={{ stroke: "var(--border)" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(valor: number) => formatBRL(valor).replace(",00", "")}
          width={72}
        />
        <Tooltip content={<TooltipGrafico formatarValor={formatBRL} />} cursor={{ fill: "var(--bg-card-hover)" }} />
        <Legend wrapperStyle={{ fontSize: 12, color: "var(--text-secondary)" }} />
        <Bar dataKey="faturamento" name="Faturamento" fill="var(--text-secondary)" radius={[4, 4, 0, 0]} maxBarSize={28} />
        <Bar dataKey="lucro" name="Lucro" fill="var(--accent-green)" radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
