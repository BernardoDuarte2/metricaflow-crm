import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, Target, DollarSign, CheckCircle } from "lucide-react";

interface ScoreCardProps {
  title: string;
  value: string;
  previousValue: number;
  currentValue: number;
  prefix?: string;
  icon: React.ElementType;
}

const ScoreCard = ({ title, value, previousValue, currentValue, icon: Icon }: ScoreCardProps) => {
  const changePercent = previousValue > 0 
    ? (((currentValue - previousValue) / previousValue) * 100) 
    : currentValue > 0 ? 100 : 0;
  const isPositive = changePercent >= 0;

  return (
    <Card className="bg-card border hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className="text-2xl lg:text-3xl font-bold text-foreground">{value}</p>
            {previousValue > 0 || currentValue > 0 ? (
              <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{isPositive ? '+' : ''}{changePercent.toFixed(1)}% vs período anterior</span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Sem dados anteriores</p>
            )}
          </div>
          <div className="p-2.5 rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface BusinessScoreCardsProps {
  totalLeads: number;
  previousTotalLeads: number;
  sqlCount: number;
  previousSqlCount: number;
  openOpportunitiesValue: number;
  previousOpenOpportunitiesValue: number;
  totalConvertedValue: number;
  previousConvertedValue: number;
}

export const BusinessScoreCards = ({
  totalLeads, previousTotalLeads,
  sqlCount, previousSqlCount,
  openOpportunitiesValue, previousOpenOpportunitiesValue,
  totalConvertedValue, previousConvertedValue,
}: BusinessScoreCardsProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <ScoreCard
        title="Leads no Período"
        value={totalLeads.toLocaleString('pt-BR')}
        currentValue={totalLeads}
        previousValue={previousTotalLeads}
        icon={Users}
      />
      <ScoreCard
        title="SQL Gerados"
        value={sqlCount.toLocaleString('pt-BR')}
        currentValue={sqlCount}
        previousValue={previousSqlCount}
        icon={Target}
      />
      <ScoreCard
        title="Oportunidades (R$)"
        value={`R$ ${openOpportunitiesValue.toLocaleString('pt-BR')}`}
        currentValue={openOpportunitiesValue}
        previousValue={previousOpenOpportunitiesValue}
        prefix="R$ "
        icon={DollarSign}
      />
      <ScoreCard
        title="Receita Fechada (R$)"
        value={`R$ ${totalConvertedValue.toLocaleString('pt-BR')}`}
        currentValue={totalConvertedValue}
        previousValue={previousConvertedValue}
        prefix="R$ "
        icon={CheckCircle}
      />
    </div>
  );
};
