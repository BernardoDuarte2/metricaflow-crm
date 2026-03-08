import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DollarSign } from "lucide-react";

interface RevenueBySellerData {
  month: string;
  [sellerName: string]: number | string;
}

interface SellerInfo {
  name: string;
  color: string;
}

interface RevenueBySellerChartProps {
  data: RevenueBySellerData[];
  sellers: SellerInfo[];
  title?: string;
}

const CHART_COLORS = [
  "hsl(25, 100%, 50%)",   // primary orange
  "hsl(210, 70%, 55%)",   // blue
  "hsl(142, 70%, 45%)",   // green
  "hsl(280, 60%, 55%)",   // purple
  "hsl(38, 90%, 50%)",    // amber
  "hsl(340, 70%, 55%)",   // rose
  "hsl(180, 60%, 45%)",   // teal
  "hsl(15, 80%, 55%)",    // coral
];

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`;
  return `R$ ${value.toFixed(0)}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  const total = payload.reduce((sum: number, p: any) => sum + (Number(p.value) || 0), 0);

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-2xl min-w-[180px]">
      <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">{label}</p>
      <div className="space-y-2">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-white/70">{entry.name}</span>
            </div>
            <span className="text-xs font-semibold text-white tabular-nums">
              R$ {Number(entry.value).toLocaleString("pt-BR")}
            </span>
          </div>
        ))}
      </div>
      {payload.length > 1 && (
        <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-white/50">Total</span>
          <span className="text-sm font-bold text-white tabular-nums">
            R$ {total.toLocaleString("pt-BR")}
          </span>
        </div>
      )}
    </div>
  );
};

export function RevenueBySellerChart({
  data,
  sellers,
  title = "Receita por Vendedor",
}: RevenueBySellerChartProps) {
  const sellerColors = useMemo(() => {
    return sellers.map((seller, index) => ({
      ...seller,
      color: seller.color || CHART_COLORS[index % CHART_COLORS.length],
    }));
  }, [sellers]);

  if (!data || data.length === 0 || sellers.length === 0) {
    return (
      <div className="rounded-xl bg-card border border-border overflow-hidden h-full">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10">
            <DollarSign className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
        <div className="h-[320px] flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Nenhum dado disponivel</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden h-full shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10">
            <DollarSign className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wide">{title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Receita mensal acumulada por vendedor</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-4 h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              {sellerColors.map((seller, i) => (
                <linearGradient key={`grad-${i}`} id={`grad-${seller.name.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={seller.color} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={seller.color} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              tickFormatter={formatCurrency}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              width={55}
            />
            <Tooltip content={<CustomTooltip />} />
            {sellerColors.map((seller) => (
              <Area
                key={seller.name}
                type="monotone"
                dataKey={seller.name}
                stroke={seller.color}
                strokeWidth={2}
                fill={`url(#grad-${seller.name.replace(/\s/g, '')})`}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="px-5 py-3 border-t border-border flex items-center justify-center gap-5 flex-wrap">
        {sellerColors.map((seller) => (
          <div key={seller.name} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seller.color }} />
            <span className="text-xs text-muted-foreground">{seller.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
