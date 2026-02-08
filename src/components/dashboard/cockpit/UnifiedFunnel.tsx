import { cn } from "@/lib/utils";
import { ArrowDown, Clock } from "lucide-react";

interface FunnelStage {
  name: string;
  value: number;
  avgStaleDays?: number;
}

interface UnifiedFunnelProps {
  stages: FunnelStage[];
  title?: string;
}

const getHealthStatus = (avgDays: number, stageName: string) => {
  // Thresholds vary by stage
  const thresholds: Record<string, [number, number]> = {
    'Leads': [3, 7],
    'MQL': [5, 10],
    'SQL': [5, 10],
    'Proposta': [7, 14],
    'Negociação': [7, 14],
    'Fechado': [Infinity, Infinity],
  };
  const [warn, crit] = thresholds[stageName] || [7, 14];
  if (avgDays >= crit) return { color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30', dot: 'bg-red-500', label: 'Crítico' };
  if (avgDays >= warn) return { color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', dot: 'bg-yellow-500', label: 'Atenção' };
  return { color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', dot: 'bg-emerald-500', label: 'Saudável' };
};

// Blue gradient shades for funnel stages (darkest at top, lighter at bottom)
const stageColors = [
  'from-[hsl(210,80%,30%)] to-[hsl(210,75%,35%)]',  // Leads - darkest navy
  'from-[hsl(215,75%,38%)] to-[hsl(215,70%,43%)]',  // MQL
  'from-[hsl(220,70%,45%)] to-[hsl(220,65%,50%)]',  // SQL
  'from-[hsl(215,65%,52%)] to-[hsl(215,60%,57%)]',  // Proposta
  'from-[hsl(210,60%,58%)] to-[hsl(210,55%,63%)]',  // Negociação
  'from-[hsl(205,55%,63%)] to-[hsl(205,50%,68%)]',  // Fechado - lightest
];

export const UnifiedFunnel = ({ stages, title = "Funil End-to-End" }: UnifiedFunnelProps) => {
  if (!stages || stages.length === 0) {
    return (
      <div className="rounded-xl bg-card border border-border overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
        <div className="p-8 text-center text-muted-foreground">
          <p className="text-sm">Nenhum dado disponível</p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...stages.map(s => s.value), 1);
  const firstValue = stages[0]?.value || 0;
  const lastValue = stages[stages.length - 1]?.value || 0;
  const totalConversion = firstValue > 0 ? ((lastValue / firstValue) * 100).toFixed(1) : '0.0';

  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[hsl(215,70%,55%)]" />
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Conversão total:</span>
          <span className="font-bold text-[hsl(215,70%,55%)]">{totalConversion}%</span>
        </div>
      </div>

      {/* Funnel body - Visual trapezoid shape */}
      <div className="p-6 flex flex-col items-center gap-0">
        {stages.map((stage, index) => {
          // Width shrinks progressively to create funnel shape
          const widthPercent = maxValue > 0
            ? Math.max(25, (stage.value / maxValue) * 100)
            : 100;

          const conversionFromPrev = index > 0 && stages[index - 1].value > 0
            ? ((stage.value / stages[index - 1].value) * 100).toFixed(1)
            : null;

          const health = stage.avgStaleDays !== undefined
            ? getHealthStatus(stage.avgStaleDays, stage.name)
            : null;

          return (
            <div key={stage.name} className="w-full flex flex-col items-center">
              {/* Conversion arrow between stages */}
              {conversionFromPrev !== null && (
                <div className="flex items-center gap-2 py-1.5 z-10">
                  <ArrowDown className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {conversionFromPrev}%
                  </span>
                </div>
              )}

              {/* Stage bar - trapezoid shape */}
              <div
                className={cn(
                  "relative flex items-center justify-between px-5 py-3.5 rounded-md transition-all duration-500",
                  "bg-gradient-to-r shadow-sm",
                  stageColors[index % stageColors.length],
                )}
                style={{
                  width: `${widthPercent}%`,
                  clipPath: index < stages.length - 1
                    ? 'polygon(2% 0%, 98% 0%, 96% 100%, 4% 100%)'
                    : 'polygon(4% 0%, 96% 0%, 92% 100%, 8% 100%)',
                }}
              >
                {/* Stage name + value */}
                <div className="flex items-center gap-3 z-10">
                  <p className="text-sm font-bold text-white drop-shadow-sm">{stage.name}</p>
                </div>
                <div className="flex items-center gap-3 z-10">
                  <span className="text-lg font-extrabold text-white drop-shadow-sm">
                    {stage.value}
                  </span>
                  {/* Health indicator */}
                  {health && stage.name !== 'Fechado' && (
                    <div className={cn(
                      "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold",
                      health.bg, health.border, "border"
                    )}>
                      <div className={cn("w-1.5 h-1.5 rounded-full", health.dot)} />
                      <Clock className={cn("h-3 w-3", health.color)} />
                      <span className={health.color}>
                        {Math.round(stage.avgStaleDays || 0)}d
                      </span>
                    </div>
                  )}
                </div>

                {/* Inner shine effect */}
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 50%)',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="px-5 py-3 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between gap-4 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Saudável</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span>Atenção</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span>Crítico</span>
            </div>
          </div>
          <span className="font-medium">
            {firstValue} → {lastValue} leads
          </span>
        </div>
      </div>
    </div>
  );
};