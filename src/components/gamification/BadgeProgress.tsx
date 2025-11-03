import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BadgeProgress as BadgeProgressType } from "@/lib/gamification";
import { motion } from "framer-motion";

interface BadgeProgressProps {
  progress: BadgeProgressType;
}

export function BadgeProgress({ progress }: BadgeProgressProps) {
  const getTierColor = (tier?: string) => {
    switch (tier) {
      case 'platinum': return 'text-slate-400';
      case 'gold': return 'text-yellow-500';
      case 'silver': return 'text-gray-400';
      case 'bronze': return 'text-orange-600';
      default: return 'text-primary';
    }
  };

  const formatValue = (value: number, badgeId: string) => {
    if (badgeId.includes('high_ticket') || badgeId.includes('money')) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
      }).format(value);
    }
    return value.toString();
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-4xl"
            >
              {progress.badge.icon}
            </motion.div>
            <div>
              <h3 className="text-lg font-bold">{progress.badge.name}</h3>
              <p className="text-sm text-muted-foreground">{progress.badge.description}</p>
            </div>
          </div>
          {progress.badge.tier && (
            <Badge variant="outline" className={getTierColor(progress.badge.tier)}>
              {progress.badge.tier}
            </Badge>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-bold">
              {formatValue(progress.current, progress.badge.id)} / {formatValue(progress.required, progress.badge.id)}
            </span>
          </div>
          <Progress value={progress.percentage} className="h-3" />
          <div className="text-right">
            <motion.span
              key={progress.percentage}
              initial={{ scale: 1.5, color: "rgb(139, 92, 246)" }}
              animate={{ scale: 1, color: "currentColor" }}
              className="text-sm font-bold text-primary"
            >
              {progress.percentage.toFixed(0)}%
            </motion.span>
          </div>
        </div>

        {/* Remaining */}
        {progress.current < progress.required && (
          <p className="text-xs text-muted-foreground text-center">
            Faltam{" "}
            <span className="font-bold text-foreground">
              {formatValue(progress.required - progress.current, progress.badge.id)}
            </span>{" "}
            para desbloquear
          </p>
        )}
      </div>
    </Card>
  );
}
