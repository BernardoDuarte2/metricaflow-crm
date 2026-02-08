import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AlertTriangle, Clock, MessageSquareOff, ListX, ArrowRight } from "lucide-react";

interface MoneyLeakAlert {
  id: string;
  icon: 'proposals' | 'negotiations' | 'no_contact' | 'no_followup';
  title: string;
  count: number;
  url: string;
}

interface MoneyLeakAlertsProps {
  stalledProposals?: number;
  stalledNegotiations?: number;
  noContactLeads?: number;
  noFollowUpLeads?: number;
}

const alertIcons = {
  proposals: Clock,
  negotiations: AlertTriangle,
  no_contact: MessageSquareOff,
  no_followup: ListX,
};

const alertColors = {
  proposals: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/25',
    icon: 'text-red-400',
    badge: 'bg-red-500/20 text-red-400',
    hover: 'hover:border-red-500/40 hover:shadow-[0_0_15px_hsl(0_70%_50%/0.1)]',
  },
  negotiations: {
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/25',
    icon: 'text-orange-400',
    badge: 'bg-orange-500/20 text-orange-400',
    hover: 'hover:border-orange-500/40 hover:shadow-[0_0_15px_hsl(30_80%_50%/0.1)]',
  },
  no_contact: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/25',
    icon: 'text-amber-400',
    badge: 'bg-amber-500/20 text-amber-400',
    hover: 'hover:border-amber-500/40 hover:shadow-[0_0_15px_hsl(45_80%_50%/0.1)]',
  },
  no_followup: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/25',
    icon: 'text-rose-400',
    badge: 'bg-rose-500/20 text-rose-400',
    hover: 'hover:border-rose-500/40 hover:shadow-[0_0_15px_hsl(350_70%_50%/0.1)]',
  },
};

export const MoneyLeakAlerts = ({
  stalledProposals = 0,
  stalledNegotiations = 0,
  noContactLeads = 0,
  noFollowUpLeads = 0,
}: MoneyLeakAlertsProps) => {
  const navigate = useNavigate();

  const alerts: MoneyLeakAlert[] = [
    {
      id: 'stalled-proposals',
      icon: 'proposals',
      title: 'Propostas paradas há +14 dias',
      count: stalledProposals,
      url: '/leads?status=proposta&stalled_days=14',
    },
    {
      id: 'stalled-negotiations',
      icon: 'negotiations',
      title: 'Negociações paradas há +10 dias',
      count: stalledNegotiations,
      url: '/leads?status=negociacao&stalled_days=10',
    },
    {
      id: 'no-contact',
      icon: 'no_contact',
      title: 'Leads sem contato há +3 dias',
      count: noContactLeads,
      url: '/leads?no_contact_days=3',
    },
    {
      id: 'no-followup',
      icon: 'no_followup',
      title: 'SQL sem tarefa de follow-up',
      count: noFollowUpLeads,
      url: '/leads?status=qualificado&no_tasks=true',
    },
  ];

  const activeAlerts = alerts.filter(a => a.count > 0);

  if (activeAlerts.length === 0) return null;

  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-red-500/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-500/10 animate-pulse">
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Onde estamos perdendo dinheiro agora
            </h3>
            <p className="text-xs text-muted-foreground">
              {activeAlerts.length} alerta{activeAlerts.length > 1 ? 's' : ''} ativo{activeAlerts.length > 1 ? 's' : ''} — clique para agir
            </p>
          </div>
        </div>
      </div>

      {/* Alert cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4">
        {alerts.map((alert) => {
          const colors = alertColors[alert.icon];
          const Icon = alertIcons[alert.icon];
          const isActive = alert.count > 0;

          return (
            <button
              key={alert.id}
              onClick={() => isActive && navigate(alert.url)}
              disabled={!isActive}
              className={cn(
                "relative text-left rounded-xl p-4 border transition-all duration-300 group",
                isActive
                  ? cn(colors.bg, colors.border, colors.hover, "cursor-pointer hover:translate-y-[-2px]")
                  : "bg-muted/30 border-border/50 opacity-50 cursor-default"
              )}
            >
              {/* Icon + badge */}
              <div className="flex items-center justify-between mb-3">
                <div className={cn("p-2 rounded-lg", isActive ? colors.bg : "bg-muted")}>
                  <Icon className={cn("h-4 w-4", isActive ? colors.icon : "text-muted-foreground")} />
                </div>
                {isActive && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>

              {/* Count */}
              <div className={cn(
                "text-2xl font-extrabold mb-1",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}>
                {alert.count}
              </div>

              {/* Title */}
              <p className="text-xs text-muted-foreground leading-tight">
                {alert.title}
              </p>

              {/* Critical pulse */}
              {isActive && alert.count >= 5 && (
                <div className="absolute top-3 right-3 w-2.5 h-2.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-60 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};