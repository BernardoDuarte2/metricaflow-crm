import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, CartesianGrid } from "recharts";

interface SalesPerformanceChartProps {
  data: Array<{ vendedor: string; leads: number; convertidos: number; taxa: number }>;
}

const SalesPerformanceChart = ({ data }: SalesPerformanceChartProps) => {
  const chartConfig = {
    leads: { label: "Total de Leads", color: "hsl(var(--chart-1))" },
    convertidos: { label: "Convertidos", color: "hsl(var(--chart-2))" },
  };

  return (
    <Card className="bg-card border-primary/20 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 group overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-success/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardHeader className="relative z-10">
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
          Desempenho por Vendedor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="vendedor" 
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 12, fontWeight: 500 }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip 
                content={({ payload }) => {
                  if (!payload?.length) return null;
                  const vendedorData = payload[0]?.payload;
                  
                  return (
                    <div className="bg-card border border-border rounded-lg p-4 shadow-lg min-w-[220px]">
                      <p className="font-bold text-base mb-3 text-primary">{vendedorData.vendedor}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-sm text-muted-foreground">Total Leads:</span>
                          <span className="text-base font-bold" style={{ color: 'hsl(var(--chart-1))' }}>
                            {vendedorData.leads}
                          </span>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-sm text-muted-foreground">Convertidos:</span>
                          <span className="text-base font-bold" style={{ color: 'hsl(var(--chart-2))' }}>
                            {vendedorData.convertidos}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-border flex justify-between items-center gap-4">
                          <span className="text-sm font-semibold">Taxa Conversão:</span>
                          <span className="text-lg font-bold text-success">
                            {vendedorData.taxa}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Legend 
                verticalAlign="top" 
                height={36}
                iconType="square"
                wrapperStyle={{ fontSize: '13px', fontWeight: 500, paddingBottom: '10px' }}
                formatter={(value) => value === 'leads' ? 'Total de Leads' : 'Leads Convertidos'}
              />
              <Bar 
                dataKey="leads" 
                fill="hsl(var(--chart-1))" 
                radius={[8, 8, 0, 0]}
                label={{ 
                  position: 'top', 
                  fontSize: 11, 
                  fontWeight: 600, 
                  fill: 'hsl(var(--foreground))'
                }}
              />
              <Bar 
                dataKey="convertidos" 
                fill="hsl(var(--chart-2))" 
                radius={[8, 8, 0, 0]}
                label={{ 
                  position: 'top', 
                  fontSize: 11, 
                  fontWeight: 600, 
                  fill: 'hsl(var(--foreground))'
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        {/* Resumo de performance */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {data.slice(0, 4).map((vendedor, index) => (
              <div key={index} className="text-center p-2 rounded-lg bg-muted/50">
                <p className="text-xs font-semibold text-muted-foreground truncate">{vendedor.vendedor}</p>
                <p className="text-lg font-bold text-primary">{vendedor.taxa}%</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesPerformanceChart;
