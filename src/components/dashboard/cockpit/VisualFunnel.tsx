import { cn } from "@/lib/utils";

interface FunnelStage {
  name: string;
  value: number;
}

interface VisualFunnelProps {
  stages: FunnelStage[];
  title: string;
  colorScheme?: 'blue' | 'green';
}

export const VisualFunnel = ({ stages, title, colorScheme = 'blue' }: VisualFunnelProps) => {
  const maxValue = stages.length > 0 ? stages[0].value : 1;

  const getColor = (index: number, total: number) => {
    if (colorScheme === 'blue') {
      const colors = [
        'bg-[hsl(215,70%,55%)]',
        'bg-[hsl(225,65%,55%)]',
        'bg-[hsl(235,60%,55%)]',
        'bg-[hsl(245,55%,55%)]',
      ];
      return colors[index % colors.length];
    }
    const colors = [
      'bg-[hsl(142,55%,45%)]',
      'bg-[hsl(152,50%,42%)]',
      'bg-[hsl(162,45%,40%)]',
      'bg-[hsl(172,40%,38%)]',
    ];
    return colors[index % colors.length];
  };

  const getTextColor = () => 'text-white';

  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-3 h-3 rounded-full",
            colorScheme === 'blue' ? 'bg-[hsl(215,70%,55%)]' : 'bg-[hsl(142,55%,45%)]'
          )} />
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
      </div>

      {/* Funnel body */}
      <div className="p-5 flex flex-col items-center gap-1">
        {stages.map((stage, index) => {
          const widthPercent = maxValue > 0
            ? Math.max(30, (stage.value / maxValue) * 100)
            : 100;

          const conversionFromPrev = index > 0 && stages[index - 1].value > 0
            ? ((stage.value / stages[index - 1].value) * 100).toFixed(1)
            : null;

          return (
            <div key={stage.name} className="w-full flex flex-col items-center">
              {/* Conversion arrow */}
              {conversionFromPrev !== null && (
                <div className="flex items-center gap-1.5 py-1">
                  <div className="h-px w-4 bg-border" />
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {conversionFromPrev}%
                  </span>
                  <div className="h-px w-4 bg-border" />
                </div>
              )}

              {/* Stage bar (trapezoid-like) */}
              <div
                className={cn(
                  "relative flex items-center justify-center py-3 px-4 rounded-lg transition-all duration-500",
                  getColor(index, stages.length),
                  getTextColor()
                )}
                style={{
                  width: `${widthPercent}%`,
                  clipPath: index < stages.length - 1
                    ? 'polygon(2% 0%, 98% 0%, 95% 100%, 5% 100%)'
                    : 'polygon(5% 0%, 95% 0%, 90% 100%, 10% 100%)',
                }}
              >
                <div className="text-center z-10">
                  <p className="text-sm font-bold drop-shadow-sm">{stage.name}</p>
                  <p className="text-lg font-extrabold drop-shadow-sm">{stage.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer - total conversion */}
      {stages.length >= 2 && stages[0].value > 0 && (
        <div className="px-5 py-3 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Conversão total</span>
            <span className={cn(
              "font-bold",
              colorScheme === 'blue' ? 'text-[hsl(215,70%,55%)]' : 'text-[hsl(142,55%,45%)]'
            )}>
              {((stages[stages.length - 1].value / stages[0].value) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
