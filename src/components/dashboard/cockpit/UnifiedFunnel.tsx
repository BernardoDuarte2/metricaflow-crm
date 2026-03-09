import { cn } from "@/lib/utils";
import { Clock, TrendingDown, ArrowRight, Timer, Zap } from "lucide-react";

interface FunnelStage {
  name: string;
  value: number;
  avgStaleDays?: number;
  estimatedValue?: number;
}

interface VelocityData {
  stage: string;
  avgDays: number;
  idealDays: number;
}

interface UnifiedFunnelProps {
  stages: FunnelStage[];
  velocityData?: VelocityData[];
  title?: string;
}

const getHealthStatus = (avgDays: number, stageName: string) => {
  const thresholds: Record<string, [number, number]> = {
    'Leads': [3, 7],
    'MQL': [5, 10],
    'SQL': [5, 10],
    'Proposta': [7, 14],
    'Negociação': [7, 14],
    'Fechado': [Infinity, Infinity],
  };
  const [warn, crit] = thresholds[stageName] || [7, 14];
  if (avgDays >= crit) return { color: 'text-destructive', dot: 'bg-destructive', label: 'Crítico' };
  if (avgDays >= warn) return { color: 'text-warning', dot: 'bg-warning', label: 'Atenção' };
  return { color: 'text-success', dot: 'bg-success', label: 'Saudável' };
};

const getVelocityStatus = (ratio: number) => {
  if (ratio <= 1) return { textColor: "text-success", label: "Rápido" };
  if (ratio <= 1.5) return { textColor: "text-warning", label: "Normal" };
  return { textColor: "text-destructive", label: "Lento" };
};

// Blue gradient — darkest at top, lighter at bottom
const stageColors = [
  { bg: 'hsl(210, 80%, 28%)', border: 'hsl(210, 80%, 38%)' },
  { bg: 'hsl(212, 75%, 34%)', border: 'hsl(212, 75%, 44%)' },
  { bg: 'hsl(215, 70%, 40%)', border: 'hsl(215, 70%, 50%)' },
  { bg: 'hsl(215, 65%, 48%)', border: 'hsl(215, 65%, 56%)' },
  { bg: 'hsl(212, 60%, 55%)', border: 'hsl(212, 60%, 63%)' },
  { bg: 'hsl(210, 55%, 62%)', border: 'hsl(210, 55%, 70%)' },
];

export const UnifiedFunnel = ({ stages, velocityData, title = "Funil End-to-End" }: UnifiedFunnelProps) => {
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

  const firstValue = stages[0]?.value || 0;
  const lastValue = stages[stages.length - 1]?.value || 0;
  const totalConversion = firstValue > 0 ? ((lastValue / firstValue) * 100).toFixed(1) : '0.0';
  const count = stages.length;

  // Width percentages: linear taper from 100% (top) to 38% (bottom)
  const maxW = 100;
  const minW = 38;
  const widths = stages.map((_, i) => maxW - ((maxW - minW) / (count - 1)) * i);

  // Velocity totals
  const totalAvgDays = velocityData?.reduce((sum, item) => sum + (item?.avgDays || 0), 0) || 0;
  const totalIdealDays = velocityData?.reduce((sum, item) => sum + (item?.idealDays || 0), 0) || 0;
  const overallRatio = totalIdealDays > 0 ? totalAvgDays / totalIdealDays : 1;
  const overallStatus = getVelocityStatus(overallRatio);

  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>Conversão total: <span className="font-bold text-primary">{totalConversion}%</span></span>
          {velocityData && velocityData.length > 0 && (
            <span className={cn("font-semibold px-2 py-0.5 rounded-full text-[10px]",
              overallStatus.textColor,
              overallStatus.textColor === "text-success" ? "bg-success/10" :
              overallStatus.textColor === "text-warning" ? "bg-warning/10" : "bg-destructive/10"
            )}>
              <Timer className="h-3 w-3 inline mr-0.5 -mt-0.5" />
              {totalAvgDays}d ciclo
            </span>
          )}
        </div>
      </div>

      {/* Funnel body */}
      <div className="p-6 flex gap-0">
        {/* LEFT: Funnel shape */}
        <div className="flex flex-col items-center gap-0" style={{ width: '40%', flexShrink: 0 }}>
          {stages.map((stage, i) => {
            const topW = widths[i];
            const bottomW = i < count - 1 ? widths[i + 1] : widths[i] * 0.85;
            const insetBottomLeft = ((topW - bottomW) / topW / 2) * 100;
            const insetBottomRight = 100 - insetBottomLeft;

            return (
              <div
                key={stage.name}
                className="flex items-center justify-center relative"
                style={{
                  width: `${topW}%`,
                  height: '54px',
                  background: stageColors[i % stageColors.length].bg,
                  clipPath: `polygon(0% 0%, 100% 0%, ${insetBottomRight}% 100%, ${insetBottomLeft}% 100%)`,
                  marginTop: i === 0 ? 0 : '-1px',
                }}
              >
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 40%, transparent 65%)',
                  }}
                />
                <div className="relative z-10 flex items-center gap-2 px-3">
                  <span className="text-xs font-bold text-white drop-shadow-sm whitespace-nowrap">
                    {stage.name}
                  </span>
                  <span className="text-sm font-extrabold text-white drop-shadow-sm">
                    {stage.value}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT: Info sidebars */}
        <div className="flex-1 flex flex-col gap-0 pl-2">
          {stages.map((stage, i) => {
            const conversionFromPrev = i > 0 && stages[i - 1].value > 0
              ? ((stage.value / stages[i - 1].value) * 100).toFixed(1)
              : null;

            const health = stage.avgStaleDays !== undefined
              ? getHealthStatus(stage.avgStaleDays, stage.name)
              : null;

            const color = stageColors[i % stageColors.length];

            return (
              <div
                key={stage.name}
                className="flex items-center gap-0"
                style={{ height: '54px', marginTop: i === 0 ? 0 : '-1px' }}
              >
                {/* Connector line */}
                <div className="w-5 flex items-center flex-shrink-0">
                  <div
                    className="w-full border-t-2 border-dashed"
                    style={{ borderColor: color.border }}
                  />
                </div>

                {/* Info card */}
                <div
                  className="flex-1 flex items-center rounded-md px-3 py-1.5 gap-3 border h-full"
                  style={{
                    background: `${color.bg}10`,
                    borderColor: `${color.border}35`,
                    borderLeft: `3px solid ${color.bg}`,
                  }}
                >
                  {/* Conversion badge */}
                  {conversionFromPrev !== null && (
                    <div
                      className="flex items-center gap-1 text-[10px] font-bold whitespace-nowrap px-1.5 py-0.5 rounded"
                      style={{ color: color.bg, background: `${color.bg}15` }}
                    >
                      <ArrowRight className="h-2.5 w-2.5" />
                      {conversionFromPrev}%
                    </div>
                  )}

                  {/* Health indicator */}
                  {health && stage.name !== 'Fechado' && (
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <div className={cn("w-1.5 h-1.5 rounded-full", health.dot)} />
                      <Clock className={cn("h-3 w-3", health.color)} />
                      <span className={cn("text-[10px] font-semibold", health.color)}>
                        {Math.round(stage.avgStaleDays || 0)}d
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Velocity inline section */}
      {velocityData && velocityData.length > 0 && (
        <div className="px-5 pb-4">
          <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span className="font-semibold">Velocidade por Etapa</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {velocityData.map((item, index) => {
              if (!item) return null;
              const ratio = item.avgDays / (item.idealDays || 1);
              const status = getVelocityStatus(ratio);
              return (
                <div key={item.stage || index} className="bg-muted/40 rounded-lg px-3 py-2.5">
                  <p className="text-[10px] text-muted-foreground font-medium truncate mb-1">
                    {item.stage}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className={cn("text-sm font-bold", status.textColor)}>
                      {item.avgDays}d
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      / {item.idealDays}d
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="px-5 py-3 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between gap-4 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span>Saudável</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-warning" />
              <span>Atenção</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-destructive" />
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
