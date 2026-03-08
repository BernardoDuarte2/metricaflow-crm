import { AlertTriangle, DollarSign, TrendingDown, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  type: 'money' | 'bottleneck' | 'performance' | 'stale';
  title: string;
  message: string;
  value?: number;
}

interface AlertPanelProps {
  alerts: Alert[];
}

const alertConfig = {
  money: {
    icon: DollarSign,
    bgColor: "bg-destructive/8",
    borderColor: "border-destructive/25",
    iconBg: "bg-destructive/15",
    iconColor: "text-destructive",
    valueBg: "bg-destructive",
  },
  bottleneck: {
    icon: AlertTriangle,
    bgColor: "bg-warning/8",
    borderColor: "border-warning/25",
    iconBg: "bg-warning/15",
    iconColor: "text-warning",
    valueBg: "bg-warning",
  },
  performance: {
    icon: TrendingDown,
    bgColor: "bg-destructive/8",
    borderColor: "border-destructive/25",
    iconBg: "bg-destructive/15",
    iconColor: "text-destructive",
    valueBg: "bg-destructive",
  },
  stale: {
    icon: Clock,
    bgColor: "bg-muted/50",
    borderColor: "border-border",
    iconBg: "bg-muted",
    iconColor: "text-muted-foreground",
    valueBg: "bg-muted-foreground",
  }
};

export const AlertPanel = ({ alerts }: AlertPanelProps) => {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-5 py-3 border-b border-border flex items-center gap-2">
        <div className="p-1.5 rounded-md bg-primary/10">
          <AlertCircle className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">
          Alertas Inteligentes
        </h3>
        <span className="ml-auto px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          {alerts.length}
        </span>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-5">
        {alerts.slice(0, 4).map((alert) => {
          const config = alertConfig[alert.type];
          const Icon = config.icon;
          
          return (
            <div
              key={alert.id}
              className={cn(
                "relative rounded-xl p-4 border transition-all duration-300",
                "hover:shadow-md cursor-pointer",
                config.bgColor,
                config.borderColor,
              )}
            >
              {/* Icon */}
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center mb-3",
                config.iconBg
              )}>
                <Icon className={cn("h-5 w-5", config.iconColor)} strokeWidth={1.5} />
              </div>

              {/* Content */}
              <h4 className="text-sm font-semibold text-foreground mb-1">
                {alert.title}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {alert.message}
              </p>

              {/* Value Badge */}
              {alert.value !== undefined && (
                <div className={cn(
                  "absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold text-white",
                  config.valueBg
                )}>
                  {alert.type === 'money' 
                    ? `R$ ${alert.value.toLocaleString('pt-BR')}`
                    : alert.value
                  }
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
