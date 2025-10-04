import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip, Legend, CartesianGrid } from "recharts";

interface ConversionFunnelChartProps {
  data: Array<{ stage: string; count: number; color: string }>;
}

const ConversionFunnelChart = ({ data }: ConversionFunnelChartProps) => {
  const chartConfig = data.reduce((acc, item) => {
    acc[item.stage] = {
      label: item.stage,
      color: item.color,
    };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);

  return (
    <Card className="bg-card border-primary/20 hover:shadow-2xl hover:shadow-accent/20 transition-all duration-500 group overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-success/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardHeader className="relative z-10">
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-accent to-success bg-clip-text text-transparent">
          Funil de Conversão
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 20, right: 80, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                type="number" 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                dataKey="stage" 
                type="category" 
                width={150}
                tick={{ fontSize: 13, fontWeight: 500 }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip 
                content={({ payload }) => {
                  if (!payload?.length) return null;
                  const data = payload[0];
                  const totalLeads = payload[0]?.payload?.totalLeads || data.value;
                  const conversionRate = totalLeads > 0 ? ((data.value as number / totalLeads) * 100).toFixed(1) : '0';
                  
                  return (
                    <div className="bg-card border border-border rounded-lg p-3 shadow-lg min-w-[200px]">
                      <p className="font-semibold text-sm mb-2">{data.payload.stage}</p>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center gap-3">
                          <span className="text-xs text-muted-foreground">Leads:</span>
                          <span className="text-lg font-bold text-accent">{data.value}</span>
                        </div>
                        <div className="flex justify-between items-center gap-3">
                          <span className="text-xs text-muted-foreground">Taxa conversão:</span>
                          <span className="text-sm font-semibold text-success">{conversionRate}%</span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Bar 
                dataKey="count" 
                radius={[0, 8, 8, 0]}
                label={{ 
                  position: 'right', 
                  fontSize: 13, 
                  fontWeight: 600, 
                  fill: 'hsl(var(--foreground))',
                  formatter: (value: number) => `${value} leads`
                }}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        {/* Legenda de cores explicativa */}
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Estágios do Funil:</p>
          <div className="grid grid-cols-2 gap-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-sm" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs font-medium">{item.stage}: {item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversionFunnelChart;
