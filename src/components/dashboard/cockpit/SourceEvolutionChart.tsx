import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
} from "recharts";

interface SourceInfo {
  name: string;
  color: string;
}

interface SourceEvolutionChartProps {
  data: Record<string, any>[];
  sources: SourceInfo[];
  title?: string;
}

const MiniTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-md shadow-lg px-2.5 py-1.5 text-xs">
      <span className="text-muted-foreground">{label}: </span>
      <span className="font-semibold text-foreground tabular-nums">{payload[0]?.value ?? 0}</span>
    </div>
  );
};

const getTrend = (values: number[]) => {
  if (values.length < 2) return { direction: "stable" as const, pct: 0 };
  const last = values[values.length - 1];
  const prev = values[values.length - 2];
  if (prev === 0 && last === 0) return { direction: "stable" as const, pct: 0 };
  if (prev === 0) return { direction: "up" as const, pct: 100 };
  const pct = Math.round(((last - prev) / prev) * 100);
  if (pct > 0) return { direction: "up" as const, pct };
  if (pct < 0) return { direction: "down" as const, pct: Math.abs(pct) };
  return { direction: "stable" as const, pct: 0 };
};

export const SourceEvolutionChart = ({
  data,
  sources,
  title = "Evolução Mensal por Fonte",
}: SourceEvolutionChartProps) => {
  // Build per-source data
  const sourceRows = sources.map((source) => {
    const values = data.map((d) => (d[source.name] as number) || 0);
    const total = values.reduce((s, v) => s + v, 0);
    const trend = getTrend(values);
    const chartData = data.map((d) => ({
      month: d.month,
      value: (d[source.name] as number) || 0,
    }));
    return { ...source, values, total, trend, chartData };
  });

  const maxTotal = Math.max(...sourceRows.map((s) => s.total), 1);

  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden h-full shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wide">
              {title}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tendência de leads por canal de origem
            </p>
          </div>
        </div>
      </div>

      {/* Source rows */}
      <div className="px-5 py-4 space-y-4">
        {sourceRows.map((source) => {
          const TrendIcon =
            source.trend.direction === "up"
              ? TrendingUp
              : source.trend.direction === "down"
              ? TrendingDown
              : Minus;
          const trendColor =
            source.trend.direction === "up"
              ? "text-green-500"
              : source.trend.direction === "down"
              ? "text-red-400"
              : "text-muted-foreground";

          return (
            <div key={source.name} className="group">
              {/* Label row */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: source.color }}
                  />
                  <span className="text-xs font-medium text-foreground">
                    {source.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    {source.total} leads
                  </span>
                  <div className={`flex items-center gap-0.5 ${trendColor}`}>
                    <TrendIcon className="h-3 w-3" />
                    <span className="text-[10px] font-semibold tabular-nums">
                      {source.trend.pct}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Mini bar chart per source */}
              <div className="h-[36px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={source.chartData}
                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                  >
                    <XAxis dataKey="month" hide />
                    <Tooltip
                      content={<MiniTooltip />}
                      cursor={{ fill: "hsl(var(--muted) / 0.2)" }}
                    />
                    <Bar
                      dataKey="value"
                      fill={source.color}
                      radius={[2, 2, 0, 0]}
                      maxBarSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer with months */}
      <div className="px-5 py-2.5 border-t border-border flex items-center justify-between">
        {data.map((d) => (
          <span
            key={d.month}
            className="text-[9px] text-muted-foreground tabular-nums"
          >
            {d.month}
          </span>
        ))}
      </div>
    </div>
  );
};
