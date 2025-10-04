import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TrendingUp, Users, DollarSign, Target } from "lucide-react";

interface Lead {
  status: string;
  estimated_value: number | null;
}

interface LeadStatsProps {
  leads: Lead[];
  period: string;
}

const statusLabels: Record<string, string> = {
  novo: "Novos",
  contato_feito: "Contato Feito",
  proposta: "Proposta",
  negociacao: "Em Negociação",
  ganho: "Ganhos",
  perdido: "Perdidos",
};

export const LeadStats = ({ leads, period }: LeadStatsProps) => {
  const stats = {
    total: leads.length,
    novo: leads.filter((l) => l.status === "novo").length,
    contato_feito: leads.filter((l) => l.status === "contato_feito").length,
    proposta: leads.filter((l) => l.status === "proposta").length,
    negociacao: leads.filter((l) => l.status === "negociacao").length,
    ganho: leads.filter((l) => l.status === "ganho").length,
    perdido: leads.filter((l) => l.status === "perdido").length,
    valorTotal: leads.reduce((sum, l) => sum + (l.estimated_value || 0), 0),
  };

  const conversionRate = stats.total > 0 
    ? ((stats.ganho / stats.total) * 100).toFixed(1) 
    : "0.0";

  const getPeriodLabel = () => {
    if (period === "all") return "Todos os períodos";
    if (period === "this-month") return format(new Date(), "MMMM/yyyy", { locale: ptBR });
    if (period === "last-month") {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      return format(lastMonth, "MMMM/yyyy", { locale: ptBR });
    }
    if (period === "last-3-months") return "Últimos 3 meses";
    return period;
  };

  return (
    <div className="bg-muted/50 rounded-lg p-6 space-y-4">
      {/* Header com período */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold capitalize">{getPeriodLabel()}</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span className="font-medium">{stats.total} leads</span>
        </div>
      </div>

      {/* Estatísticas principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card de Valor Total */}
        <div className="bg-card rounded-lg p-4 border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <DollarSign className="h-4 w-4" />
            <span className="text-xs font-medium">Valor Estimado</span>
          </div>
          <p className="text-2xl font-bold">
            R$ {stats.valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Card de Taxa de Conversão */}
        <div className="bg-card rounded-lg p-4 border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Target className="h-4 w-4" />
            <span className="text-xs font-medium">Taxa de Conversão</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{conversionRate}%</p>
        </div>

        {/* Card de Ganhos */}
        <div className="bg-card rounded-lg p-4 border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <span className="text-xs font-medium">🟢 Ganhos</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.ganho}</p>
        </div>

        {/* Card de Em Negociação */}
        <div className="bg-card rounded-lg p-4 border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <span className="text-xs font-medium">🟠 Em Negociação</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">{stats.negociacao}</p>
        </div>
      </div>

      {/* Breakdown por status */}
      <div className="flex flex-wrap gap-3 text-sm pt-2 border-t">
        {stats.novo > 0 && (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            {stats.novo} {statusLabels.novo}
          </span>
        )}
        {stats.contato_feito > 0 && (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
            {stats.contato_feito} {statusLabels.contato_feito}
          </span>
        )}
        {stats.proposta > 0 && (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            {stats.proposta} {statusLabels.proposta}
          </span>
        )}
        {stats.perdido > 0 && (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            {stats.perdido} {statusLabels.perdido}
          </span>
        )}
      </div>
    </div>
  );
};
