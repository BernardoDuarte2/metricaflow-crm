import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Minus, DollarSign, Users, Percent, Timer, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

type CompareMode = 'month' | 'year';

interface MonthlyComparisonCardProps {
  userRole: string;
  userId: string;
}

const MONTHS = [
  { value: '1', label: 'Janeiro' },
  { value: '2', label: 'Fevereiro' },
  { value: '3', label: 'Março' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Maio' },
  { value: '6', label: 'Junho' },
  { value: '7', label: 'Julho' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
];

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;
const YEARS = Array.from({ length: 5 }, (_, i) => ({
  value: String(currentYear - i),
  label: String(currentYear - i),
}));

const getDateRange = (mode: CompareMode, month: string, year: string) => {
  if (mode === 'month') {
    const m = parseInt(month);
    const y = parseInt(year);
    const start = new Date(y, m - 1, 1).toISOString();
    const end = new Date(y, m, 0, 23, 59, 59).toISOString();
    return { start, end };
  }
  const y = parseInt(year);
  const start = new Date(y, 0, 1).toISOString();
  const end = new Date(y, 11, 31, 23, 59, 59).toISOString();
  return { start, end };
};

const fetchPeriodStats = async (startDate: string, endDate: string, userRole: string, userId: string) => {
  const { data, error } = await supabase.functions.invoke('get-dashboard-stats', {
    body: {
      start_date: startDate,
      end_date: endDate,
      user_role: userRole,
      user_id: userId,
    },
  });
  if (error) throw error;
  return data?.stats || data;
};

const formatValue = (value: number, format?: string) => {
  switch (format) {
    case 'currency':
      return `R$ ${value.toLocaleString('pt-BR')}`;
    case 'percent':
      return `${value.toFixed(1)}%`;
    case 'days':
      return `${value} dias`;
    default:
      return value.toLocaleString('pt-BR');
  }
};

const getChange = (current: number, previous: number) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

export const MonthlyComparisonCard = ({ userRole, userId }: MonthlyComparisonCardProps) => {
  const [compareMode, setCompareMode] = useState<CompareMode>('month');
  const [selectedMonth1, setSelectedMonth1] = useState(String(currentMonth));
  const [selectedMonth2, setSelectedMonth2] = useState(String(Math.max(currentMonth - 1, 1)));
  const [selectedYear1, setSelectedYear1] = useState(String(currentYear));
  const [selectedYear2, setSelectedYear2] = useState(String(currentYear - 1));

  // For month mode, both use the same year (current)
  const periodA = useMemo(() => getDateRange(compareMode, selectedMonth1, compareMode === 'month' ? selectedYear1 : selectedYear1), [compareMode, selectedMonth1, selectedYear1]);
  const periodB = useMemo(() => getDateRange(compareMode, selectedMonth2, compareMode === 'month' ? selectedYear1 : selectedYear2), [compareMode, selectedMonth2, selectedYear1, selectedYear2]);

  const { data: statsA, isLoading: loadingA } = useQuery({
    queryKey: ['comparison-stats-a', compareMode, selectedMonth1, selectedYear1],
    queryFn: () => fetchPeriodStats(periodA.start, periodA.end, userRole, userId),
    staleTime: 1000 * 60 * 5,
  });

  const { data: statsB, isLoading: loadingB } = useQuery({
    queryKey: ['comparison-stats-b', compareMode, selectedMonth2, compareMode === 'month' ? selectedYear1 : selectedYear2],
    queryFn: () => fetchPeriodStats(periodB.start, periodB.end, userRole, userId),
    staleTime: 1000 * 60 * 5,
  });

  const isLoading = loadingA || loadingB;

  const metrics = useMemo(() => {
    if (!statsA || !statsB) return [];
    return [
      { label: 'Leads', current: statsA.totalLeads || 0, previous: statsB.totalLeads || 0, format: 'number' as const, icon: Users },
      { label: 'Vendas', current: statsA.wonLeads || 0, previous: statsB.wonLeads || 0, format: 'number' as const, icon: CheckCircle },
      { label: 'Conversão', current: parseFloat(statsA.conversionRate) || 0, previous: parseFloat(statsB.conversionRate) || 0, format: 'percent' as const, icon: Percent },
      { label: 'Ciclo', current: statsA.avgTimeInFunnel || 0, previous: statsB.avgTimeInFunnel || 0, format: 'days' as const, icon: Timer },
    ];
  }, [statsA, statsB]);

  const getPeriodLabels = () => {
    if (compareMode === 'month') {
      const m1 = MONTHS.find(m => m.value === selectedMonth1)?.label || '';
      const m2 = MONTHS.find(m => m.value === selectedMonth2)?.label || '';
      return { current: m1, previous: m2 };
    }
    return { current: selectedYear1, previous: selectedYear2 };
  };

  const periodLabels = getPeriodLabels();

  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-foreground">Comparativo Mensal</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center rounded-lg border border-border overflow-hidden text-xs">
              <button
                onClick={() => setCompareMode('month')}
                className={cn(
                  "px-3 py-1.5 transition-colors",
                  compareMode === 'month' ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"
                )}
              >
                Mês x Mês
              </button>
              <button
                onClick={() => setCompareMode('year')}
                className={cn(
                  "px-3 py-1.5 transition-colors",
                  compareMode === 'year' ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"
                )}
              >
                Ano x Ano
              </button>
            </div>

            {compareMode === 'month' ? (
              <div className="flex items-center gap-1.5 text-xs">
                <Select value={selectedMonth1} onValueChange={setSelectedMonth1}>
                  <SelectTrigger className="h-7 w-[100px] text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MONTHS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <span className="text-muted-foreground">vs</span>
                <Select value={selectedMonth2} onValueChange={setSelectedMonth2}>
                  <SelectTrigger className="h-7 w-[100px] text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MONTHS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs">
                <Select value={selectedYear1} onValueChange={setSelectedYear1}>
                  <SelectTrigger className="h-7 w-[80px] text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {YEARS.map(y => <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <span className="text-muted-foreground">vs</span>
                <Select value={selectedYear2} onValueChange={setSelectedYear2}>
                  <SelectTrigger className="h-7 w-[80px] text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {YEARS.map(y => <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
          <span className="px-2 py-1 rounded bg-primary/10 text-primary font-medium">{periodLabels.current}</span>
          <span>vs</span>
          <span className="px-2 py-1 rounded bg-muted text-muted-foreground">{periodLabels.previous}</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-5">
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="p-4 rounded-lg bg-muted/30 border border-border/50 space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-7 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric, index) => {
              const change = getChange(metric.current, metric.previous);
              const isNegativeGood = metric.format === 'days';
              const TrendIcon = Math.abs(change) < 1 ? Minus : (isNegativeGood ? (change < 0 ? TrendingUp : TrendingDown) : (change > 0 ? TrendingUp : TrendingDown));
              const trendColor = Math.abs(change) < 1 ? "text-muted-foreground" : (isNegativeGood ? (change < 0 ? "text-success" : "text-destructive") : (change > 0 ? "text-success" : "text-destructive"));
              const Icon = metric.icon;

              return (
                <div key={index} className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 rounded-md bg-primary/10">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">{metric.label}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-xl font-bold text-foreground">{formatValue(metric.current, metric.format)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">vs {formatValue(metric.previous, metric.format)}</span>
                    <div className={cn("flex items-center gap-1 text-xs font-medium", trendColor)}>
                      <TrendIcon className="h-3 w-3" />
                      <span>{Math.abs(change).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
