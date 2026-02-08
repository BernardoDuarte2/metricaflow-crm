import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AlertItem {
  label: string;
  count: number;
  url: string;
}

interface MoneyLeakAlertsProps {
  stalledProposals14d: number;
  stalledNegotiations10d: number;
  leadsNoContact3d: number;
  sqlNoFollowUp: number;
}

export const MoneyLeakAlerts = ({
  stalledProposals14d, stalledNegotiations10d,
  leadsNoContact3d, sqlNoFollowUp,
}: MoneyLeakAlertsProps) => {
  const navigate = useNavigate();

  const alerts: AlertItem[] = [
    { label: 'Propostas paradas há +14 dias', count: stalledProposals14d, url: '/leads?status=proposta&stalled_days=14' },
    { label: 'Negociações paradas há +10 dias', count: stalledNegotiations10d, url: '/leads?status=negociacao&stalled_days=10' },
    { label: 'Leads sem contato há +3 dias', count: leadsNoContact3d, url: '/leads?status=novo&no_contact_days=3' },
    { label: 'SQL sem tarefa de follow-up', count: sqlNoFollowUp, url: '/leads?status=qualificado&no_tasks=true' },
  ];

  return (
    <Card className="bg-card border border-red-200/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <CardTitle className="text-lg font-semibold">Onde Estamos Perdendo Dinheiro</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {alerts.map(alert => {
            const hasLeads = alert.count > 0;

            return (
              <button
                key={alert.label}
                onClick={() => hasLeads && navigate(alert.url)}
                disabled={!hasLeads}
                className={`
                  flex items-start gap-3 p-3 rounded-lg border text-left transition-all w-full
                  ${hasLeads 
                    ? 'border-red-200 bg-red-50/50 hover:bg-red-100/70 hover:border-red-300 cursor-pointer hover:shadow-sm' 
                    : 'border-border bg-muted/20 cursor-default opacity-70'
                  }
                `}
              >
                {hasLeads ? (
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${hasLeads ? 'text-red-700' : 'text-muted-foreground'}`}>
                    {hasLeads ? `${alert.count} leads` : 'Nenhum lead nessa condição 👍'}
                  </p>
                  <p className={`text-xs mt-0.5 ${hasLeads ? 'text-red-600/80' : 'text-muted-foreground'}`}>
                    {alert.label}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
