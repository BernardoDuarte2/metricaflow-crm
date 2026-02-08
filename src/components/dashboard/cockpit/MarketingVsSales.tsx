import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

interface SourceItem {
  source: string;
  count: number;
  color: string;
}

interface MarketingVsSalesProps {
  sourceData: SourceItem[];
  marketingConversionRate: number;
  salesConversionRate: number;
}

const SALES_BENCHMARK = 18;

export const MarketingVsSales = ({ sourceData, marketingConversionRate, salesConversionRate }: MarketingVsSalesProps) => {
  const isAboveBenchmark = salesConversionRate >= SALES_BENCHMARK;
  const barColors = ['hsl(215, 70%, 55%)', 'hsl(195, 80%, 50%)', 'hsl(255, 60%, 60%)', 'hsl(170, 70%, 45%)', 'hsl(38, 90%, 50%)', 'hsl(340, 70%, 55%)'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Marketing */}
      <Card className="bg-card border">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            <CardTitle className="text-base font-semibold">Marketing</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">Leads por origem</p>
        </CardHeader>
        <CardContent>
          {sourceData.length > 0 ? (
            <>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sourceData.slice(0, 6)} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                    <XAxis dataKey="source" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={50} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(var(--border))' }} 
                      formatter={(value: number) => [value, 'Leads']}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {sourceData.slice(0, 6).map((_, index) => (
                        <Cell key={index} fill={barColors[index % barColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-muted-foreground mt-3 border-t pt-3">
                Marketing converteu <span className="font-semibold text-foreground">{marketingConversionRate.toFixed(1)}%</span> dos leads em SQL no período.
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">Sem dados de origem no período</p>
          )}
        </CardContent>
      </Card>

      {/* Vendas */}
      <Card className="bg-card border">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <CardTitle className="text-base font-semibold">Vendas</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">SQL → Fechado</p>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center pt-4">
          <div className="text-center space-y-3">
            <p className={`text-5xl font-bold ${isAboveBenchmark ? 'text-emerald-600' : 'text-red-500'}`}>
              {salesConversionRate.toFixed(1)}%
            </p>
            <p className="text-sm text-muted-foreground">Taxa de conversão SQL → Fechado</p>
            <div className={`flex items-center justify-center gap-2 text-sm font-medium ${isAboveBenchmark ? 'text-emerald-600' : 'text-red-500'}`}>
              {isAboveBenchmark ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span>{isAboveBenchmark ? 'Acima' : 'Abaixo'} da média saudável ({SALES_BENCHMARK}%)</span>
            </div>
          </div>
          <div className="w-full mt-6 border-t pt-3">
            <p className="text-xs text-muted-foreground">
              Vendas está <span className={`font-semibold ${isAboveBenchmark ? 'text-emerald-600' : 'text-red-500'}`}>
                {isAboveBenchmark ? 'acima' : 'abaixo'}
              </span> da média saudável ({SALES_BENCHMARK}%).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
