import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Users, Target } from "lucide-react";

interface SellerRevenueDetail {
  name: string;
  revenue: number;
  deals: number;
  avgTicket: number;
}

interface LeadsConversionDetail {
  status: string;
  count: number;
  percentage: number;
}

interface DrilldownData {
  type: 'revenue' | 'leads';
  month: string;
  revenueDetails?: SellerRevenueDetail[];
  leadsDetails?: {
    totalLeads: number;
    closedLeads: number;
    conversionRate: number;
    byStatus: LeadsConversionDetail[];
  };
}

interface ChartDrilldownDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: DrilldownData | null;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
  }).format(value);
};

export function ChartDrilldownDialog({ open, onOpenChange, data }: ChartDrilldownDialogProps) {
  if (!data) return null;

  const isRevenueType = data.type === 'revenue';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-cockpit-card border-cockpit-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-cockpit-foreground">
            {isRevenueType ? (
              <>
                <DollarSign className="h-5 w-5 text-cockpit-accent" />
                Detalhes de Receita - {data.month}
              </>
            ) : (
              <>
                <Users className="h-5 w-5 text-cockpit-accent" />
                Detalhes de Leads - {data.month}
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {isRevenueType && data.revenueDetails && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-cockpit-background/50 rounded-lg p-3 text-center">
                <p className="text-xs text-cockpit-muted">Total Receita</p>
                <p className="text-lg font-bold text-cockpit-accent">
                  {formatCurrency(data.revenueDetails.reduce((sum, s) => sum + s.revenue, 0))}
                </p>
              </div>
              <div className="bg-cockpit-background/50 rounded-lg p-3 text-center">
                <p className="text-xs text-cockpit-muted">Total Vendas</p>
                <p className="text-lg font-bold text-cockpit-foreground">
                  {data.revenueDetails.reduce((sum, s) => sum + s.deals, 0)}
                </p>
              </div>
              <div className="bg-cockpit-background/50 rounded-lg p-3 text-center">
                <p className="text-xs text-cockpit-muted">Ticket Médio</p>
                <p className="text-lg font-bold text-cockpit-foreground">
                  {formatCurrency(
                    data.revenueDetails.reduce((sum, s) => sum + s.revenue, 0) /
                    Math.max(data.revenueDetails.reduce((sum, s) => sum + s.deals, 0), 1)
                  )}
                </p>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow className="border-cockpit-border">
                  <TableHead className="text-cockpit-muted">Vendedor</TableHead>
                  <TableHead className="text-cockpit-muted text-right">Receita</TableHead>
                  <TableHead className="text-cockpit-muted text-right">Vendas</TableHead>
                  <TableHead className="text-cockpit-muted text-right">Ticket Médio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.revenueDetails
                  .sort((a, b) => b.revenue - a.revenue)
                  .map((seller, index) => (
                    <TableRow key={seller.name} className="border-cockpit-border">
                      <TableCell className="font-medium text-cockpit-foreground">
                        <div className="flex items-center gap-2">
                          {index === 0 && <Badge className="bg-yellow-500/20 text-yellow-500 text-xs">🥇</Badge>}
                          {index === 1 && <Badge className="bg-gray-400/20 text-gray-400 text-xs">🥈</Badge>}
                          {index === 2 && <Badge className="bg-orange-500/20 text-orange-500 text-xs">🥉</Badge>}
                          {seller.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-cockpit-accent font-medium">
                        {formatCurrency(seller.revenue)}
                      </TableCell>
                      <TableCell className="text-right text-cockpit-foreground">
                        {seller.deals}
                      </TableCell>
                      <TableCell className="text-right text-cockpit-muted">
                        {formatCurrency(seller.avgTicket)}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        )}

        {!isRevenueType && data.leadsDetails && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-500/10 rounded-lg p-3 text-center">
                <p className="text-xs text-cockpit-muted">Total Leads</p>
                <p className="text-lg font-bold text-blue-500">
                  {data.leadsDetails.totalLeads}
                </p>
              </div>
              <div className="bg-emerald-500/10 rounded-lg p-3 text-center">
                <p className="text-xs text-cockpit-muted">Leads Fechados</p>
                <p className="text-lg font-bold text-emerald-500">
                  {data.leadsDetails.closedLeads}
                </p>
              </div>
              <div className="bg-orange-500/10 rounded-lg p-3 text-center">
                <p className="text-xs text-cockpit-muted">Taxa Conversão</p>
                <p className="text-lg font-bold text-orange-500">
                  {data.leadsDetails.conversionRate.toFixed(1)}%
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-cockpit-foreground mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Distribuição por Status
              </h4>
              <div className="space-y-2">
                {data.leadsDetails.byStatus.map((status) => (
                  <div key={status.status} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-cockpit-foreground capitalize">{status.status}</span>
                        <span className="text-cockpit-muted">{status.count} ({status.percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="h-2 bg-cockpit-background rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{ 
                            width: `${status.percentage}%`,
                            backgroundColor: status.status === 'ganho' 
                              ? 'hsl(142, 70%, 45%)' 
                              : status.status === 'perdido' 
                                ? 'hsl(0, 70%, 50%)' 
                                : 'hsl(215, 70%, 55%)'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-cockpit-background/50 rounded-lg">
              <TrendingUp className="h-4 w-4 text-cockpit-accent" />
              <p className="text-sm text-cockpit-muted">
                Em <span className="text-cockpit-foreground font-medium">{data.month}</span>, 
                {' '}{data.leadsDetails.closedLeads} de {data.leadsDetails.totalLeads} leads foram convertidos
                {data.leadsDetails.conversionRate >= 20 
                  ? ' - ótima performance! 🎉' 
                  : data.leadsDetails.conversionRate >= 10 
                    ? ' - performance razoável.' 
                    : ' - há espaço para melhorias.'}
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export type { DrilldownData, SellerRevenueDetail, LeadsConversionDetail };
