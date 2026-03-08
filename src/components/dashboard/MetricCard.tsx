import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: "up" | "down";
}

const MetricCard = ({
  title,
  value,
  icon: Icon,
  description,
}: MetricCardProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : value;
  const isNumeric = !isNaN(numericValue);

  useEffect(() => {
    if (isNumeric) {
      let start = 0;
      const end = numericValue;
      const duration = 1000;
      const increment = end / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setDisplayValue(end);
          clearInterval(timer);
        } else {
          setDisplayValue(start);
        }
      }, 16);
      
      return () => clearInterval(timer);
    }
  }, [numericValue, isNumeric]);

  const formattedValue = isNumeric 
    ? typeof value === 'string' && value.includes('%')
      ? `${displayValue.toFixed(1)}%`
      : typeof value === 'string' && value.includes('R$')
      ? `R$ ${Math.round(displayValue).toLocaleString('pt-BR')}`
      : Math.round(displayValue).toLocaleString('pt-BR')
    : value;

  return (
    <Card className="bg-card border-border hover:border-muted-foreground/30 transition-colors duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {title}
            </p>
            <p className="text-3xl font-bold text-foreground">
              {formattedValue}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" strokeWidth={2} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;