import { Trophy, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SalesRepData {
  id: string;
  name: string;
  avatar?: string;
  leads: number;
  convertedLeads: number;
  conversionRate: number;
  revenue: number;
  averageTicket: number;
  avgCloseTime: number;
  meetings: number;
  tasks: number;
  observations: number;
  goalProgress?: number;
  trend?: number;
}

interface SalesRepDetailedPanelProps {
  data: SalesRepData[];
  title?: string;
}

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`;
  return `R$ ${value.toFixed(0)}`;
};

export const SalesRepDetailedPanel = ({
  data,
  title = "Performance do Time",
}: SalesRepDetailedPanelProps) => {
  const sortedData = [...data].sort((a, b) => b.revenue - a.revenue);
  const maxRevenue = sortedData.length > 0 ? sortedData[0].revenue : 0;

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl bg-card border border-border overflow-hidden shadow-sm h-full">
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10">
              <Trophy className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          </div>
        </div>
        <div className="p-8 text-center text-muted-foreground">
          <p className="text-sm">Nenhum dado disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10">
            <Trophy className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground tracking-wide">{title}</h3>
        </div>
        <span className="text-xs text-muted-foreground">{sortedData.length} vendedores</span>
      </div>

      {/* List */}
      <div className="divide-y divide-border overflow-y-auto flex-1">
        {sortedData.map((member, index) => {
          const progressWidth = maxRevenue > 0 ? (member.revenue / maxRevenue) * 100 : 0;

          return (
            <div
              key={member.id}
              className="px-4 py-3 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                {/* Rank */}
                <span className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                  index === 0 && "bg-warning/20 text-warning",
                  index === 1 && "bg-muted-foreground/20 text-muted-foreground",
                  index === 2 && "bg-accent/20 text-accent-foreground",
                  index > 2 && "bg-muted text-muted-foreground"
                )}>
                  {index + 1}
                </span>

                {/* Avatar */}
                <Avatar className="h-7 w-7 border border-border shrink-0">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                    {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                {/* Name + trend */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">
                      {member.name.split(' ').slice(0, 2).join(' ')}
                    </p>
                    {member.trend !== undefined && (
                      <span className={cn(
                        "flex items-center gap-0.5 text-[10px] font-medium shrink-0",
                        member.trend >= 0 ? "text-success" : "text-destructive"
                      )}>
                        {member.trend >= 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                        {Math.abs(member.trend)}%
                      </span>
                    )}
                  </div>

                  {/* Revenue bar */}
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-700"
                        style={{ width: `${progressWidth}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-foreground tabular-nums shrink-0">
                      {formatCurrency(member.revenue)}
                    </span>
                  </div>
                </div>

                {/* Key stats */}
                <div className="hidden sm:flex items-center gap-3 shrink-0">
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground">Conv.</p>
                    <p className={cn(
                      "text-xs font-bold",
                      member.conversionRate >= 20 ? "text-success" :
                      member.conversionRate >= 10 ? "text-warning" : "text-destructive"
                    )}>
                      {member.conversionRate.toFixed(0)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground">Ciclo</p>
                    <p className={cn(
                      "text-xs font-medium",
                      member.avgCloseTime <= 10 ? "text-success" :
                      member.avgCloseTime <= 20 ? "text-warning" : "text-destructive"
                    )}>
                      {member.avgCloseTime}d
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground">Leads</p>
                    <p className="text-xs font-medium text-foreground">
                      {member.convertedLeads}/{member.leads}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
