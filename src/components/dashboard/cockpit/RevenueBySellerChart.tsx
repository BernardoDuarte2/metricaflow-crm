import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
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
  "hsl(25, 100%, 50%)",
  "hsl(210, 70%, 55%)",
  "hsl(142, 70%, 45%)",
  "hsl(280, 60%, 55%)",
  "hsl(38, 90%, 50%)",
  "hsl(340, 70%, 55%)",
  "hsl(180, 60%, 45%)",
  "hsl(15, 80%, 55%)",
];

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`;
  return `R$ ${value.toFixed(0)}`;
};

interface AggregatedSeller {
  name: string;
  total: number;
  color: string;
  monthlyBreakdown: { month: string; value: number }[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;

  const seller: AggregatedSeller = payload[0]?.payload;
  if (!seller) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-2xl min-w-[200px]">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seller.color }} />
        <p className="text-sm font-semibold text-foreground">{seller.name}</p>
      </div>
      <div className="text-lg font-bold text-foreground mb-3">
        R$ {seller.total.toLocaleString("pt-BR")}
      </div>
      {seller.monthlyBreakdown.length > 0 && (
        <div className="border-t border-border pt-2 space-y-1">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Por mês</p>
          {seller.monthlyBreakdown.map((m) => (
            <div key={m.month} className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">{m.month}</span>
              <span className="text-xs font-medium text-foreground tabular-nums">
                R$ {m.value.toLocaleString("pt-BR")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CustomBarLabel = ({ x, y, width, height, value }: any) => {
  if (!value) return null;
  return (
    <text
      x={x + width + 8}
      y={y + height / 2}
      fill="hsl(var(--muted-foreground))"
      fontSize={11}
      fontWeight={600}
      dominantBaseline="middle"
    >
      {formatCurrency(value)}
    </text>
  );
};

export function RevenueBySellerChart({
  data,
  sellers,
  title = "Receita por Vendedor",
}: RevenueBySellerChartProps) {
  const aggregatedData = useMemo(() => {
    if (!data?.length || !sellers?.length) return [];

    return sellers
      .map((seller, index) => {
        const monthlyBreakdown = data
          .map((row) => ({
            month: row.month as string,
            value: Number(row[seller.name]) || 0,
          }))
          .filter((m) => m.value > 0);

        const total = monthlyBreakdown.reduce((sum, m) => sum + m.value, 0);

        return {
          name: seller.name,
          total,
          color: seller.color || CHART_COLORS[index % CHART_COLORS.length],
          monthlyBreakdown,
        } as AggregatedSeller;
      })
      .sort((a, b) => b.total - a.total);
  }, [data, sellers]);

  if (!aggregatedData.length) {
    return (
      <div className="rounded-xl bg-card border border-border overflow-hidden h-full">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10">
            <DollarSign className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
        <div className="h-[320px] flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Nenhum dado disponível</p>
        </div>
      </div>
    );
  }

  const chartHeight = Math.max(280, aggregatedData.length * 44);
  const maxTotal = aggregatedData[0]?.total || 0;

  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden h-full shadow-sm hover:shadow-md transition-shadow">
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10">
            <DollarSign className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wide">{title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Ranking de receita acumulada por vendedor</p>
          </div>
        </div>
      </div>

      <div className="p-4" style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={aggregatedData}
            layout="vertical"
            margin={{ top: 5, right: 80, left: 5, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={formatCurrency}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              domain={[0, maxTotal * 1.15]}
            />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
              width={100}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted) / 0.3)" }} />
            <Bar
              dataKey="total"
              radius={[0, 6, 6, 0]}
              barSize={28}
              label={<CustomBarLabel />}
            >
              {aggregatedData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
