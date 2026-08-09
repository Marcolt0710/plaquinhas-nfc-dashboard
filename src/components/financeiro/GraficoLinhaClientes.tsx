import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { PontoClientes } from "./financeiroHelpers";
import { TooltipGrafico } from "./TooltipGrafico";

export function GraficoLinhaClientes({ dados }: { dados: PontoClientes[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={dados} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="rotulo"
          tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
          axisLine={{ stroke: "var(--border)" }}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={32}
        />
        <Tooltip content={<TooltipGrafico />} cursor={{ stroke: "var(--border-strong)" }} />
        <Line
          type="monotone"
          dataKey="total"
          name="Clientes"
          stroke="var(--accent-green)"
          strokeWidth={2}
          dot={{ r: 3, fill: "var(--accent-green)", strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
