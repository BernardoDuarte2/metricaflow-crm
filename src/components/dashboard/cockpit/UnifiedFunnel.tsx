import { cn } from "@/lib/utils";
import { Clock, TrendingDown, ArrowRight } from "lucide-react";

interface FunnelStage {
  name: string;
  value: number;
  avgStaleDays?: number;
  estimatedValue?: number;
}

interface UnifiedFunnelProps {
  stages: FunnelStage[];
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
  if (avgDays >= crit) return { color: 'text-red-400', dot: 'bg-red-500', label: 'Crítico' };
  if (avgDays >= warn) return { color: 'text-yellow-400', dot: 'bg-yellow-500', label: 'Atenção' };
  return { color: 'text-emerald-400', dot: 'bg-emerald-500', label: 'Saudável' };
};

const stageDescriptions: Record<string, string> = {
  'Leads': 'Novos contatos captados por marketing ou prospecção.',
  'MQL': 'Leads qualificados pelo marketing com perfil validado.',
  'SQL': 'Leads aceitos pelo time comercial para abordagem.',
  'Proposta': 'Propostas enviadas aguardando retorno do cliente.',
  'Negociação': 'Negociação ativa de termos e condições.',
  'Fechado': 'Deals fechados — receita confirmada.',
};

// Blue gradient — darkest at top, lighter at bottom (continuous feel)
const stageColors = [
  { bg: 'hsl(210, 80%, 28%)', border: 'hsl(210, 80%, 38%)' },
  { bg: 'hsl(212, 75%, 34%)', border: 'hsl(212, 75%, 44%)' },
  { bg: 'hsl(215, 70%, 40%)', border: 'hsl(215, 70%, 50%)' },
  { bg: 'hsl(215, 65%, 48%)', border: 'hsl(215, 65%, 56%)' },
  { bg: 'hsl(212, 60%, 55%)', border: 'hsl(212, 60%, 63%)' },
  { bg: 'hsl(210, 55%, 62%)', border: 'hsl(210, 55%, 70%)' },
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

  const firstValue = stages[0]?.value || 0;
  const lastValue = stages[stages.length - 1]?.value || 0;
  const totalConversion = firstValue > 0 ? ((lastValue / firstValue) * 100).toFixed(1) : '0.0';
  const count = stages.length;

  // Width percentages: linear taper from 100% (top) to 38% (bottom)
  const maxW = 100;
  const minW = 38;
  const widths = stages.map((_, i) => maxW - ((maxW - minW) / (count - 1)) * i);

  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Conversão total:</span>
          <span className="font-bold text-primary">{totalConversion}%</span>
        </div>
      </div>

      {/* Funnel body */}
      <div className="p-6 flex gap-0">
        {/* LEFT: Funnel shape */}
        <div className="flex flex-col items-center gap-0" style={{ width: '40%', flexShrink: 0 }}>
          {stages.map((stage, i) => {
            const topW = widths[i];
            const bottomW = i < count - 1 ? widths[i + 1] : widths[i] * 0.85;

            // ClipPath: taper from topW to bottomW within the element
            // Element is rendered at topW%, so clipPath percentages are relative to element
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
                {/* Shine */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 40%, transparent 65%)',
                  }}
                />
                {/* Content */}
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
                  {/* Description */}
                  <p className="text-[10px] text-muted-foreground leading-tight flex-1 min-w-0 line-clamp-2">
                    {stageDescriptions[stage.name] || ''}
                  </p>

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
