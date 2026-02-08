import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface FunnelStage {
  stage: string;
  count: number;
  avgDays: number;
}

interface UnifiedFunnelProps {
  stages: FunnelStage[];
}

const getHealthColor = (avgDays: number, stageName: string) => {
  const thresholds: Record<string, { ok: number; warn: number }> = {
    'Leads': { ok: 3, warn: 7 },
    'MQL': { ok: 5, warn: 10 },
    'SQL': { ok: 5, warn: 10 },
    'Proposta': { ok: 7, warn: 14 },
    'Negociação': { ok: 10, warn: 20 },
    'Fechado': { ok: 999, warn: 999 },
  };
  const t = thresholds[stageName] || { ok: 5, warn: 10 };
  if (avgDays <= t.ok) return { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' };
  if (avgDays <= t.warn) return { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' };
  return { bg: 'bg-red-50 border-red-200', text: 'text-red-700', dot: 'bg-red-500' };
};

export const UnifiedFunnel = ({ stages }: UnifiedFunnelProps) => {
  const maxCount = Math.max(...stages.map(s => s.count), 1);

  return (
    <Card className="bg-card border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Funil End-to-End</CardTitle>
        <p className="text-xs text-muted-foreground">Leads → MQL → SQL → Proposta → Negociação → Fechado</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-stretch gap-2">
          {stages.map((stage, index) => {
            const health = getHealthColor(stage.avgDays, stage.stage);
            const widthPercent = Math.max(20, (stage.count / maxCount) * 100);
            const nextStage = stages[index + 1];
            const conversionRate = nextStage && stage.count > 0
              ? ((nextStage.count / stage.count) * 100).toFixed(0)
              : null;

            return (
              <div key={stage.stage} className="flex items-center gap-1 flex-1 min-w-0">
                <div
                  className={`flex-1 rounded-lg border p-3 transition-all hover:shadow-sm ${health.bg}`}
                  style={{ minWidth: 0 }}
                >
                  <p className="text-xs font-semibold text-foreground truncate">{stage.stage}</p>
                  <p className="text-xl font-bold text-foreground mt-1">{stage.count}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <div className={`h-2 w-2 rounded-full ${health.dot}`} />
                    <span className={`text-[10px] font-medium ${health.text}`}>
                      {stage.stage === 'Fechado' ? 'Concluído' : `${stage.avgDays}d parado`}
                    </span>
                  </div>
                  {/* Mini bar */}
                  <div className="mt-2 h-1 bg-muted/30 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${health.dot}`}
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </div>
                {index < stages.length - 1 && (
                  <div className="hidden lg:flex flex-col items-center px-0.5">
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    {conversionRate && (
                      <span className="text-[9px] font-medium text-muted-foreground mt-0.5">{conversionRate}%</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
