import { BarChart3 } from "lucide-react";

interface SourceData {
  name: string;
  leads: number;
  converted: number;
  conversionRate: number;
}

interface SourceConversionChartProps {
  data: SourceData[];
  title?: string;
}

const getBarColor = (rate: number) => {
  if (rate >= 20) return "hsl(142, 70%, 45%)";
  if (rate >= 10) return "hsl(25, 100%, 50%)";
  return "hsl(38, 90%, 50%)";
};

const getBadgeStyle = (rate: number) => {
  if (rate >= 20) return "bg-green-500/15 text-green-400 border-green-500/20";
  if (rate >= 10) return "bg-primary/15 text-primary border-primary/20";
  return "bg-amber-500/15 text-amber-400 border-amber-500/20";
};

export const SourceConversionChart = ({
  data,
  title = "Conversão por Fonte",
}: SourceConversionChartProps) => {
  const maxLeads = Math.max(...data.map((d) => d.leads), 1);

  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden h-full shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10">
            <BarChart3 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wide">{title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Performance de conversão por origem
            </p>
          </div>
        </div>
      </div>

      {/* Horizontal Bars */}
      <div className="px-5 py-4 space-y-4">
        {data.map((item) => {
          const barWidth = (item.leads / maxLeads) * 100;
          const convertedWidth = item.leads > 0 ? (item.converted / item.leads) * 100 : 0;
          const rate = item.leads > 0 ? ((item.converted / item.leads) * 100) : 0;

          return (
            <div key={item.name} className="group">
              {/* Label row */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-foreground">{item.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    {item.converted}/{item.leads}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${getBadgeStyle(rate)}`}
                  >
                    {rate.toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Bar track */}
              <div className="relative h-3 rounded-full bg-muted/50 overflow-hidden">
                {/* Total leads bar (background) */}
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-muted-foreground/10 transition-all duration-500"
                  style={{ width: `${barWidth}%` }}
                />
                {/* Converted bar (foreground) */}
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 group-hover:brightness-110"
                  style={{
                    width: `${(convertedWidth / 100) * barWidth}%`,
                    backgroundColor: getBarColor(rate),
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer legend */}
      <div className="px-5 py-3 border-t border-border flex items-center justify-center gap-6">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-1.5 rounded-full bg-muted-foreground/10" />
          <span className="text-[10px] text-muted-foreground">Total Leads</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-1.5 rounded-full bg-green-500" />
          <span className="text-[10px] text-muted-foreground">Convertidos</span>
        </div>
      </div>
    </div>
  );
};
