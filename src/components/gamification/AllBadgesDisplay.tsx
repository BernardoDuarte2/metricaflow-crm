import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Badge as BadgeType } from "@/lib/gamification";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

interface AllBadgesDisplayProps {
  earnedBadges: BadgeType[];
}

const ALL_POSSIBLE_BADGES: BadgeType[] = [
  {
    id: "first_blood",
    name: "Primeira Venda",
    icon: "🎉",
    description: "Fechou sua primeira venda",
    requirement: "1 venda",
    tier: 'bronze',
    category: 'performance'
  },
  {
    id: "closer_bronze",
    name: "Fechador Bronze",
    icon: "🥉",
    description: "Fechou 5 vendas",
    requirement: "5 vendas",
    tier: 'bronze',
    category: 'performance'
  },
  {
    id: "closer_silver",
    name: "Fechador Prata",
    icon: "🥈",
    description: "Fechou 10 vendas",
    requirement: "10 vendas",
    tier: 'silver',
    category: 'performance'
  },
  {
    id: "closer_gold",
    name: "Fechador Ouro",
    icon: "🥇",
    description: "Fechou 25 vendas",
    requirement: "25 vendas",
    tier: 'gold',
    category: 'performance'
  },
  {
    id: "master_closer",
    name: "Fechador Master",
    icon: "🏆",
    description: "Fechou 50 vendas - Elite absoluta",
    requirement: "50 vendas",
    tier: 'platinum',
    category: 'performance'
  },
  {
    id: "sniper",
    name: "Sniper",
    icon: "🎯",
    description: "Taxa de conversão acima de 50%",
    requirement: "50% conversão",
    tier: 'gold',
    category: 'performance'
  },
  {
    id: "surgical_precision",
    name: "Precisão Cirúrgica",
    icon: "🔬",
    description: "Taxa de conversão acima de 75%",
    requirement: "75% conversão",
    tier: 'platinum',
    category: 'performance'
  },
  {
    id: "high_ticket_bronze",
    name: "High Ticket Bronze",
    icon: "💰",
    description: "Vendas acima de R$ 50.000",
    requirement: "R$ 50k",
    tier: 'bronze',
    category: 'value'
  },
  {
    id: "high_ticket_silver",
    name: "High Ticket Prata",
    icon: "💎",
    description: "Vendas acima de R$ 100.000",
    requirement: "R$ 100k",
    tier: 'silver',
    category: 'value'
  },
  {
    id: "high_ticket_gold",
    name: "High Ticket Ouro",
    icon: "💵",
    description: "Vendas acima de R$ 250.000",
    requirement: "R$ 250k",
    tier: 'gold',
    category: 'value'
  },
  {
    id: "money_maker",
    name: "Money Maker",
    icon: "🤑",
    description: "Meio milhão em vendas!",
    requirement: "R$ 500k",
    tier: 'platinum',
    category: 'value'
  },
  {
    id: "communicator",
    name: "Comunicador",
    icon: "💬",
    description: "Fez 10 observações",
    requirement: "10 observações",
    tier: 'bronze',
    category: 'consistency'
  },
  {
    id: "persistent",
    name: "Persistente",
    icon: "💪",
    description: "Enviou 5 propostas",
    requirement: "5 propostas",
    tier: 'bronze',
    category: 'consistency'
  },
  {
    id: "proposal_machine",
    name: "Máquina de Propostas",
    icon: "📋",
    description: "Enviou 20+ propostas",
    requirement: "20 propostas",
    tier: 'silver',
    category: 'consistency'
  },
  {
    id: "active_prospector",
    name: "Prospecção Ativa",
    icon: "🔍",
    description: "Criou 50+ leads",
    requirement: "50 leads",
    tier: 'silver',
    category: 'consistency'
  },
  {
    id: "warrior",
    name: "Guerreiro",
    icon: "⚔️",
    description: "Criou 100+ leads - Incansável",
    requirement: "100 leads",
    tier: 'gold',
    category: 'consistency'
  },
];

export function AllBadgesDisplay({ earnedBadges }: AllBadgesDisplayProps) {
  const getTierColor = (tier?: string) => {
    switch (tier) {
      case 'platinum': return 'border-slate-400 bg-slate-400/10';
      case 'gold': return 'border-yellow-500 bg-yellow-500/10';
      case 'silver': return 'border-gray-400 bg-gray-400/10';
      case 'bronze': return 'border-orange-600 bg-orange-600/10';
      default: return 'border-primary bg-primary/10';
    }
  };

  const earnedBadgeIds = new Set(earnedBadges.map(b => b.id));

  const groupedBadges = ALL_POSSIBLE_BADGES.reduce((acc, badge) => {
    const category = badge.category || 'special';
    if (!acc[category]) acc[category] = [];
    acc[category].push(badge);
    return acc;
  }, {} as Record<string, BadgeType[]>);

  const categoryNames = {
    performance: '🏆 Performance',
    value: '💰 Valor',
    consistency: '📊 Consistência',
    speed: '⚡ Velocidade',
    special: '🌟 Especiais'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Galeria de Badges</CardTitle>
        <p className="text-sm text-muted-foreground">
          {earnedBadges.length} de {ALL_POSSIBLE_BADGES.length} badges conquistados
        </p>
      </CardHeader>
      <CardContent className="space-y-8">
        {Object.entries(groupedBadges).map(([category, badges]) => (
          <div key={category} className="space-y-4">
            <h3 className="text-lg font-semibold">{categoryNames[category as keyof typeof categoryNames]}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {badges.map((badge) => {
                const isEarned = earnedBadgeIds.has(badge.id);
                return (
                  <motion.div
                    key={badge.id}
                    whileHover={{ scale: isEarned ? 1.05 : 1 }}
                    className={`relative p-4 rounded-xl border-2 transition-all ${
                      isEarned 
                        ? getTierColor(badge.tier) + ' cursor-pointer'
                        : 'border-muted bg-muted/30 opacity-50'
                    }`}
                  >
                    {!isEarned && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl backdrop-blur-[2px]">
                        <Lock className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="text-center space-y-2">
                      <div className={`text-5xl ${!isEarned && 'grayscale'}`}>
                        {badge.icon}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{badge.name}</p>
                        {badge.tier && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {badge.tier}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{badge.requirement}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
