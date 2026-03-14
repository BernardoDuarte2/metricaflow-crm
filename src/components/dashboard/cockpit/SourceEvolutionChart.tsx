import { TrendingUp } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  const total = payload.reduce((sum: number, e: any) => sum + (e.value || 0), 0);

  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3 min-w-[180px]">
      <p className="text-xs font-semibold text-foreground mb-2 border-b border-border pb-1.5">{label}</p>
      <div className="space-y-1.5">
        {payload
          .sort((a: any, b: any) => b.value - a.value)
          .map((entry: any) => (
            <div key={entry.dataKey} className="flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-muted-foreground font-medium">{entry.dataKey}</span>
              </div>
              <span className="font-semibold text-foreground tabular-nums">{entry.value}</span>
            </div>
          ))}
      </div>
      <div className="mt-2 pt-1.5 border-t border-border flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-medium">Total</span>
        <span className="font-bold text-foreground tabular-nums">{total}</span>
      </div>
    </div>
  );
};

export const SourceEvolutionChart = ({
  data,
  sources,
  title = "Evolução Mensal por Fonte",
}: SourceEvolutionChartProps) => {
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

      {/* Legend */}
      <div className="px-5 pt-4 pb-1 flex flex-wrap gap-x-4 gap-y-1.5">
        {sources.map((source) => (
          <div key={source.name} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: source.color }}
            />
            <span className="text-[11px] font-medium text-muted-foreground">{source.name}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="px-4 py-2 h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              {sources.map((source) => (
                <linearGradient key={source.name} id={`gradient-${source.name.replace(/\s/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={source.color} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={source.color} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              width={30}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            {sources.map((source) => (
              <Area
                key={source.name}
                type="monotone"
                dataKey={source.name}
                stroke={source.color}
                strokeWidth={2.5}
                fill={`url(#gradient-${source.name.replace(/\s/g, '-')})`}
                dot={{ fill: source.color, strokeWidth: 2, stroke: "hsl(var(--card))", r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: "hsl(var(--background))" }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
