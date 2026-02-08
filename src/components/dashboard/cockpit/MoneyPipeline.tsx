import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

interface MoneyPipelineProps {
  proposalsValue: number;
  negotiationsValue: number;
  closedValue: number;
  monthlyGoal: number;
}

const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR')}`;

export const MoneyPipeline = ({ proposalsValue, negotiationsValue, closedValue, monthlyGoal }: MoneyPipelineProps) => {
  const pipelineTotal = proposalsValue + negotiationsValue;
  const goalCoverage = monthlyGoal > 0 ? pipelineTotal / monthlyGoal : 0;
  const maxValue = Math.max(proposalsValue, negotiationsValue, closedValue, 1);

  const bars = [
    { label: 'Propostas', value: proposalsValue, color: 'bg-violet-500' },
    { label: 'Negociação', value: negotiationsValue, color: 'bg-amber-500' },
    { label: 'Fechados', value: closedValue, color: 'bg-emerald-500' },
  ];

  return (
    <Card className="bg-card border">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-semibold">Pipeline de Dinheiro</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {bars.map(bar => (
          <div key={bar.label} className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-foreground">{bar.label}</span>
              <span className="text-sm font-bold text-foreground">{formatCurrency(bar.value)}</span>
            </div>
            <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${bar.color} transition-all duration-500`}
                style={{ width: `${Math.max(2, (bar.value / maxValue) * 100)}%` }}
              />
            </div>
          </div>
        ))}

        <div className="border-t pt-3 mt-4">
          {monthlyGoal > 0 ? (
            <p className="text-xs text-muted-foreground">
              {goalCoverage >= 1 ? (
                <>Pipeline atual cobre <span className="font-semibold text-emerald-600">{goalCoverage.toFixed(1)}x</span> a meta mensal.</>
              ) : (
                <span className="text-red-500 font-medium">
                  ⚠️ Pipeline insuficiente para a meta do próximo mês ({(goalCoverage * 100).toFixed(0)}% da meta).
                </span>
              )}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Defina uma meta mensal para ver a cobertura do pipeline.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
