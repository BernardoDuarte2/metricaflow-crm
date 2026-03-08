import { Target, TrendingUp, AlertTriangle, CheckCircle, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface GoalHeroCardProps {
  goal: number;
  achieved: number;
  periodLabel?: string;
}

export const GoalHeroCard = ({ goal, achieved, periodLabel }: GoalHeroCardProps) => {
  const percentage = goal > 0 ? (achieved / goal) * 100 : 0;
  const gap = Math.max(goal - achieved, 0);

  const daysRemaining = useMemo(() => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    let count = 0;
    const current = new Date(now);
    current.setDate(current.getDate() + 1);
    while (current <= lastDay) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) count++;
      current.setDate(current.getDate() + 1);
    }
    return Math.max(count, 1);
  }, []);

  const dailyPace = gap > 0 ? gap / daysRemaining : 0;

  const getStatusConfig = () => {
    if (percentage >= 100) return { 
      label: "Meta Batida! 🎉", 
      icon: CheckCircle, 
      color: "text-success", 
      bg: "bg-success/10",
    };
    if (percentage >= 75) return { 
      label: "No Caminho", 
      icon: TrendingUp, 
      color: "text-primary", 
      bg: "bg-primary/10",
    };
    if (percentage >= 50) return { 
      label: "Atenção", 
      icon: AlertTriangle, 
      color: "text-warning", 
      bg: "bg-warning/10",
    };
    return { 
      label: "Risco", 
      icon: AlertTriangle, 
      color: "text-destructive", 
      bg: "bg-destructive/10",
    };
  };

  const status = getStatusConfig();
  const StatusIcon = status.icon;

  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden">
      {/* Top accent — solid coral */}
      <div className="h-1 bg-primary" />

      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Meta vs Realizado</h2>
              <p className="text-xs text-muted-foreground">
                {periodLabel || 'Faturamento do mês'}
              </p>
            </div>
          </div>
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold",
            status.bg, status.color
          )}>
            <StatusIcon className="h-4 w-4" />
            <span>{status.label}</span>
          </div>
        </div>

        {/* Main metrics row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="text-center md:text-left">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Meta Mensal</p>
            <p className="text-2xl lg:text-3xl font-bold text-foreground">
              R$ {goal.toLocaleString('pt-BR')}
            </p>
          </div>

          <div className="text-center md:text-left">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Realizado</p>
            <p className="text-2xl lg:text-3xl font-bold text-success">
              R$ {achieved.toLocaleString('pt-BR')}
            </p>
          </div>

          <div className="text-center md:text-left">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Falta para a Meta</p>
            <p className={cn(
              "text-2xl lg:text-3xl font-bold",
              gap === 0 ? "text-success" : "text-warning"
            )}>
              {gap === 0 ? "✓ Batida!" : `R$ ${gap.toLocaleString('pt-BR')}`}
            </p>
          </div>

          <div className="text-center md:text-left">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Ritmo Necessário</p>
            <div className="flex items-baseline gap-1.5">
              <p className={cn(
                "text-2xl lg:text-3xl font-bold",
                dailyPace > (goal / 22) ? "text-destructive" : "text-primary"
              )}>
                R$ {dailyPace.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
              </p>
              <span className="text-xs text-muted-foreground">/dia útil</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Progresso: {percentage.toFixed(1)}%
            </span>
            <span className="text-sm text-muted-foreground">
              {daysRemaining} dias úteis restantes
            </span>
          </div>
          <div className="relative">
            <Progress 
              value={Math.min(percentage, 100)} 
              className="h-4"
            />
            {percentage > 100 && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-bold text-success">
                <Zap className="h-3 w-3" />
                {percentage.toFixed(0)}%
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};