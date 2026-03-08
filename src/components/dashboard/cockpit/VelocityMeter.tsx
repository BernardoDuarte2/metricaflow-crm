import { Timer, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

// Navy blue gradient matching UnifiedFunnel
const stageGradients = [
  'linear-gradient(135deg, hsl(210, 80%, 28%), hsl(210, 80%, 38%))',
  'linear-gradient(135deg, hsl(212, 75%, 34%), hsl(212, 75%, 44%))',
  'linear-gradient(135deg, hsl(215, 70%, 40%), hsl(215, 70%, 50%))',
  'linear-gradient(135deg, hsl(215, 65%, 48%), hsl(215, 65%, 56%))',
];

interface VelocityData {
  stage: string;
  avgDays: number;
  idealDays: number;
}

interface VelocityMeterProps {
  data: VelocityData[];
  title?: string;
}

export const VelocityMeter = ({ 
  data = [], 
  title = "Velocidade do Funil" 
}: VelocityMeterProps) => {
  
  const getStatusInfo = (ratio: number) => {
    if (ratio <= 1) return {
      color: "bg-success",
      textColor: "text-success",
      label: "Rápido",
    };
    if (ratio <= 1.5) return {
      color: "bg-warning",
      textColor: "text-warning",
      label: "Normal",
    };
    return {
      color: "bg-destructive",
      textColor: "text-destructive",
      label: "Lento",
    };
  };

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl bg-card border border-border overflow-hidden h-full shadow-sm">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
        <div className="p-8 text-center text-muted-foreground">
          <p className="text-sm">Nenhum dado disponível</p>
        </div>
      </div>
    );
  }

  const totalAvgDays = data.reduce((sum, item) => sum + (item?.avgDays || 0), 0);
  const totalIdealDays = data.reduce((sum, item) => sum + (item?.idealDays || 0), 0);
  const overallRatio = totalIdealDays > 0 ? totalAvgDays / totalIdealDays : 1;
  const overallStatus = getStatusInfo(overallRatio);

  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden h-full shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10">
            <Timer className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground tracking-wide">
            {title}
          </h3>
        </div>
        <span className={cn(
          "text-xs font-semibold px-2.5 py-1 rounded-full",
          overallStatus.textColor,
          overallStatus.textColor === "text-success" ? "bg-success/10" :
          overallStatus.textColor === "text-warning" ? "bg-warning/10" : "bg-destructive/10"
        )}>
          {overallStatus.label}
        </span>
      </div>

      {/* Velocity Items */}
      <div className="p-5 space-y-4">
        {data.map((item, index) => {
          if (!item) return null;
          
          const avgDays = item.avgDays || 0;
          const idealDays = item.idealDays || 1;
          const ratio = avgDays / idealDays;
          const status = getStatusInfo(ratio);
          const progressPercent = Math.min((avgDays / (idealDays * 2)) * 100, 100);

          return (
            <div key={item.stage || index} className="group">
              {/* Stage Header */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {item.stage}
                </span>
                <div className="flex items-center gap-3">
                  <span className={cn("text-sm font-bold", status.textColor)}>
                    {avgDays} dias
                  </span>
                  <span className="text-xs text-muted-foreground">
                    / ideal: {idealDays}d
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                {/* Ideal marker */}
                <div className="absolute top-0 bottom-0 w-0.5 bg-muted-foreground/30 z-10" style={{ left: '50%' }} />
                
                {/* Progress */}
                <div 
                  className="h-full rounded-full transition-all duration-700"
                  style={{ 
                    width: `${progressPercent}%`,
                    background: stageGradients[index % stageGradients.length],
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Summary */}
      <div className="px-5 py-4 bg-muted/30 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className={cn("h-4 w-4", overallStatus.textColor)} />
            <span className="text-xs text-muted-foreground">Ciclo médio total</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("text-sm font-bold", overallStatus.textColor)}>
              {totalAvgDays} dias
            </span>
            <span className="text-xs text-muted-foreground">
              (ideal: {totalIdealDays}d)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
