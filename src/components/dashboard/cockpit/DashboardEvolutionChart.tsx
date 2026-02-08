import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp } from "lucide-react";

interface MonthlyData {
  month: string;
  totalLeads: number;
  closedLeads: number;
  conversionRate: number;
}

interface DashboardEvolutionChartProps {
  data: MonthlyData[];
}

export const DashboardEvolutionChart = ({ data }: DashboardEvolutionChartProps) => {
  if (!data || data.length === 0) return null;

  return (
    <Card className="bg-card border">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base font-semibold">Evolução no Tempo</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">Leads gerados (Marketing) vs Leads fechados (Vendas)</p>
      </CardHeader>
      <CardContent>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 15, left: -10, bottom: 5 }}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ 
                  fontSize: 12, 
                  borderRadius: 8, 
                  border: '1px solid hsl(var(--border))',
                  backgroundColor: 'hsl(var(--card))',
                }}
              />
              <Legend
                iconType="line"
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              />
              <Line
                type="monotone"
                dataKey="totalLeads"
                name="Leads Gerados"
                stroke="hsl(215, 70%, 55%)"
                strokeWidth={2}
                dot={{ r: 3, fill: 'hsl(215, 70%, 55%)' }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="closedLeads"
                name="Leads Fechados"
                stroke="hsl(142, 70%, 45%)"
                strokeWidth={2}
                dot={{ r: 3, fill: 'hsl(142, 70%, 45%)' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
