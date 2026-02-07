import { useState } from "react";
import { TrendingUp, TrendingDown, Minus, DollarSign, Users, Percent, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ComparisonMetric {
  label: string;
  current: number;
  previous: number;
  format?: 'currency' | 'percent' | 'number' | 'days';
  icon: React.ElementType;
}

type CompareMode = 'month' | 'year';

interface MonthlyComparisonCardProps {
  metrics: ComparisonMetric[];
  currentPeriod: string;
  previousPeriod: string;
  onCompareModeChange?: (mode: CompareMode, params: { month1?: string; month2?: string; year1?: string; year2?: string }) => void;
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
const YEARS = Array.from({ length: 5 }, (_, i) => ({
  value: String(currentYear - i),
  label: String(currentYear - i),
}));

export const MonthlyComparisonCard = ({
  metrics,
  currentPeriod,
  previousPeriod,
  onCompareModeChange,
}: MonthlyComparisonCardProps) => {
  const [compareMode, setCompareMode] = useState<CompareMode>('month');
  const [selectedMonth1, setSelectedMonth1] = useState(String(new Date().getMonth() + 1));
  const [selectedMonth2, setSelectedMonth2] = useState(String(Math.max(new Date().getMonth(), 1)));
  const [selectedYear1, setSelectedYear1] = useState(String(currentYear));
  const [selectedYear2, setSelectedYear2] = useState(String(currentYear - 1));

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

  const getTrendIcon = (change: number, isNegativeGood?: boolean) => {
    if (Math.abs(change) < 1) return Minus;
    if (isNegativeGood) {
      return change < 0 ? TrendingUp : TrendingDown;
    }
    return change > 0 ? TrendingUp : TrendingDown;
  };

  const getTrendColor = (change: number, isNegativeGood?: boolean) => {
    if (Math.abs(change) < 1) return "text-muted-foreground";
    if (isNegativeGood) {
      return change < 0 ? "text-success" : "text-destructive";
    }
    return change > 0 ? "text-success" : "text-destructive";
  };

  const handleModeChange = (mode: CompareMode) => {
    setCompareMode(mode);
    onCompareModeChange?.(mode, {
      month1: selectedMonth1,
      month2: selectedMonth2,
      year1: selectedYear1,
      year2: selectedYear2,
    });
  };

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
          <h3 className="text-sm font-semibold text-foreground">
            Comparativo Mensal
          </h3>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* Mode selector */}
            <div className="flex items-center rounded-lg border border-border overflow-hidden text-xs">
              <button
                onClick={() => handleModeChange('month')}
                className={cn(
                  "px-3 py-1.5 transition-colors",
                  compareMode === 'month' 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-card text-muted-foreground hover:bg-muted"
                )}
              >
                Mês x Mês
              </button>
              <button
                onClick={() => handleModeChange('year')}
                className={cn(
                  "px-3 py-1.5 transition-colors",
                  compareMode === 'year' 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-card text-muted-foreground hover:bg-muted"
                )}
              >
                Ano x Ano
              </button>
            </div>

            {/* Period selectors */}
            {compareMode === 'month' ? (
              <div className="flex items-center gap-1.5 text-xs">
                <Select value={selectedMonth1} onValueChange={setSelectedMonth1}>
                  <SelectTrigger className="h-7 w-[100px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map(m => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-muted-foreground">vs</span>
                <Select value={selectedMonth2} onValueChange={setSelectedMonth2}>
                  <SelectTrigger className="h-7 w-[100px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map(m => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs">
                <Select value={selectedYear1} onValueChange={setSelectedYear1}>
                  <SelectTrigger className="h-7 w-[80px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map(y => (
                      <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-muted-foreground">vs</span>
                <Select value={selectedYear2} onValueChange={setSelectedYear2}>
                  <SelectTrigger className="h-7 w-[80px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map(y => (
                      <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* Period badges */}
        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
          <span className="px-2 py-1 rounded bg-primary/10 text-primary font-medium">
            {periodLabels.current}
          </span>
          <span>vs</span>
          <span className="px-2 py-1 rounded bg-muted text-muted-foreground">
            {periodLabels.previous}
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => {
            const change = getChange(metric.current, metric.previous);
            const isNegativeGood = metric.format === 'days';
            const TrendIcon = getTrendIcon(change, isNegativeGood);
            const trendColor = getTrendColor(change, isNegativeGood);
            const Icon = metric.icon;

            return (
              <div 
                key={index}
                className="p-4 rounded-lg bg-muted/30 border border-border/50"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-md bg-primary/10">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    {metric.label}
                  </span>
                </div>

                <div className="mb-2">
                  <span className="text-xl font-bold text-foreground">
                    {formatValue(metric.current, metric.format)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    vs {formatValue(metric.previous, metric.format)}
                  </span>
                  <div className={cn(
                    "flex items-center gap-1 text-xs font-medium",
                    trendColor
                  )}>
                    <TrendIcon className="h-3 w-3" />
                    <span>{Math.abs(change).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
