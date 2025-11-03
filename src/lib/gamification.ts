// Funções auxiliares para sistema de gamificação

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  requirement: string;
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  category?: 'performance' | 'speed' | 'consistency' | 'value' | 'special';
}

export interface BadgeProgress {
  badge: Badge;
  current: number;
  required: number;
  percentage: number;
}

export interface UserStats {
  totalPoints: number;
  leadsCreated: number;
  proposalsSent: number;
  salesClosed: number;
  observations: number;
  totalSalesValue: number;
  conversionRate: number;
}

// Calcular estatísticas do usuário nos últimos 30 dias
export function calculateUserStats(events: any[]): UserStats {
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  const recentEvents = events.filter(
    (e) => new Date(e.created_at) > last30Days
  );

  const stats: UserStats = {
    totalPoints: recentEvents.reduce((sum, e) => sum + (e.points || 0), 0),
    leadsCreated: recentEvents.filter((e) => e.event_type === "lead_created").length,
    proposalsSent: recentEvents.filter((e) => e.event_type === "proposal_sent").length,
    salesClosed: recentEvents.filter((e) => e.event_type === "sale_closed").length,
    observations: recentEvents.filter((e) => e.event_type === "observation_added").length,
    totalSalesValue: 0,
    conversionRate: 0,
  };

  // Calcular valor total de vendas
  const salesEvents = recentEvents.filter((e) => e.event_type === "sale_closed");
  stats.totalSalesValue = salesEvents.reduce(
    (sum, e) => sum + (e.metadata?.estimated_value || 0),
    0
  );

  // Calcular taxa de conversão
  if (stats.leadsCreated > 0) {
    stats.conversionRate = (stats.salesClosed / stats.leadsCreated) * 100;
  }

  return stats;
}

// Determinar badges baseado nas estatísticas
export function calculateBadges(stats: UserStats): Badge[] {
  const badges: Badge[] = [];

  // PERFORMANCE BADGES
  // Iniciante
  if (stats.salesClosed >= 1) {
    badges.push({
      id: "first_blood",
      name: "Primeira Venda",
      icon: "🎉",
      description: "Fechou sua primeira venda",
      requirement: "1 venda",
      tier: 'bronze',
      category: 'performance'
    });
  }

  // Fechador Bronze (5+ vendas)
  if (stats.salesClosed >= 5) {
    badges.push({
      id: "closer_bronze",
      name: "Fechador Bronze",
      icon: "🥉",
      description: "Fechou 5 vendas",
      requirement: "5 vendas",
      tier: 'bronze',
      category: 'performance'
    });
  }

  // Fechador Prata (10+ vendas)
  if (stats.salesClosed >= 10) {
    badges.push({
      id: "closer_silver",
      name: "Fechador Prata",
      icon: "🥈",
      description: "Fechou 10 vendas",
      requirement: "10 vendas",
      tier: 'silver',
      category: 'performance'
    });
  }

  // Fechador Ouro (25+ vendas)
  if (stats.salesClosed >= 25) {
    badges.push({
      id: "closer_gold",
      name: "Fechador Ouro",
      icon: "🥇",
      description: "Fechou 25 vendas",
      requirement: "25 vendas",
      tier: 'gold',
      category: 'performance'
    });
  }

  // Fechador Master (50+ vendas)
  if (stats.salesClosed >= 50) {
    badges.push({
      id: "master_closer",
      name: "Fechador Master",
      icon: "🏆",
      description: "Fechou 50 vendas - Elite absoluta",
      requirement: "50 vendas",
      tier: 'platinum',
      category: 'performance'
    });
  }

  // PRECISION BADGES
  // Sniper (Taxa de conversão >= 50%)
  if (stats.conversionRate >= 50 && stats.salesClosed >= 5) {
    badges.push({
      id: "sniper",
      name: "Sniper",
      icon: "🎯",
      description: "Taxa de conversão acima de 50%",
      requirement: "50% conversão + 5 vendas",
      tier: 'gold',
      category: 'performance'
    });
  }

  // Precisão Cirúrgica (Taxa >= 75%)
  if (stats.conversionRate >= 75 && stats.salesClosed >= 5) {
    badges.push({
      id: "surgical_precision",
      name: "Precisão Cirúrgica",
      icon: "🔬",
      description: "Taxa de conversão acima de 75%",
      requirement: "75% conversão + 5 vendas",
      tier: 'platinum',
      category: 'performance'
    });
  }

  // VALUE BADGES
  // High Ticket Bronze (R$ 50k+)
  if (stats.totalSalesValue >= 50000) {
    badges.push({
      id: "high_ticket_bronze",
      name: "High Ticket Bronze",
      icon: "💰",
      description: "Vendas acima de R$ 50.000",
      requirement: "R$ 50k em vendas",
      tier: 'bronze',
      category: 'value'
    });
  }

  // High Ticket Prata (R$ 100k+)
  if (stats.totalSalesValue >= 100000) {
    badges.push({
      id: "high_ticket_silver",
      name: "High Ticket Prata",
      icon: "💎",
      description: "Vendas acima de R$ 100.000",
      requirement: "R$ 100k em vendas",
      tier: 'silver',
      category: 'value'
    });
  }

  // High Ticket Ouro (R$ 250k+)
  if (stats.totalSalesValue >= 250000) {
    badges.push({
      id: "high_ticket_gold",
      name: "High Ticket Ouro",
      icon: "💵",
      description: "Vendas acima de R$ 250.000",
      requirement: "R$ 250k em vendas",
      tier: 'gold',
      category: 'value'
    });
  }

  // Money Maker (R$ 500k+)
  if (stats.totalSalesValue >= 500000) {
    badges.push({
      id: "money_maker",
      name: "Money Maker",
      icon: "🤑",
      description: "Meio milhão em vendas!",
      requirement: "R$ 500k em vendas",
      tier: 'platinum',
      category: 'value'
    });
  }

  // ACTIVITY BADGES
  // Comunicador (10+ observações)
  if (stats.observations >= 10) {
    badges.push({
      id: "communicator",
      name: "Comunicador",
      icon: "💬",
      description: "Fez 10 observações",
      requirement: "10 observações",
      tier: 'bronze',
      category: 'consistency'
    });
  }

  // Persistente (5+ propostas)
  if (stats.proposalsSent >= 5) {
    badges.push({
      id: "persistent",
      name: "Persistente",
      icon: "💪",
      description: "Enviou 5 propostas",
      requirement: "5 propostas",
      tier: 'bronze',
      category: 'consistency'
    });
  }

  // Máquina de Propostas (20+ propostas)
  if (stats.proposalsSent >= 20) {
    badges.push({
      id: "proposal_machine",
      name: "Máquina de Propostas",
      icon: "📋",
      description: "Enviou 20+ propostas",
      requirement: "20 propostas",
      tier: 'silver',
      category: 'consistency'
    });
  }

  // Prospecção Ativa (50+ leads criados)
  if (stats.leadsCreated >= 50) {
    badges.push({
      id: "active_prospector",
      name: "Prospecção Ativa",
      icon: "🔍",
      description: "Criou 50+ leads",
      requirement: "50 leads",
      tier: 'silver',
      category: 'consistency'
    });
  }

  // Guerreiro (100+ leads criados)
  if (stats.leadsCreated >= 100) {
    badges.push({
      id: "warrior",
      name: "Guerreiro",
      icon: "⚔️",
      description: "Criou 100+ leads - Incansável",
      requirement: "100 leads",
      tier: 'gold',
      category: 'consistency'
    });
  }

  // SPECIAL BADGES
  // Hat Trick (3+ vendas em um dia - detectável via timestamps)
  // Coruja (Venda após 20h - detectável via timestamps)
  // Relâmpago (Lead → Venda em < 3 dias - detectável via timestamps)

  return badges;
}

export function getNextBadge(stats: UserStats): BadgeProgress | null {
  const allPossibleBadges: Array<{ badge: Badge; current: number; required: number }> = [
    {
      badge: {
        id: "first_blood",
        name: "Primeira Venda",
        icon: "🎉",
        description: "Feche sua primeira venda",
        requirement: "1 venda",
        tier: 'bronze',
        category: 'performance'
      },
      current: stats.salesClosed,
      required: 1
    },
    {
      badge: {
        id: "closer_bronze",
        name: "Fechador Bronze",
        icon: "🥉",
        description: "Feche 5 vendas",
        requirement: "5 vendas",
        tier: 'bronze',
        category: 'performance'
      },
      current: stats.salesClosed,
      required: 5
    },
    {
      badge: {
        id: "closer_silver",
        name: "Fechador Prata",
        icon: "🥈",
        description: "Feche 10 vendas",
        requirement: "10 vendas",
        tier: 'silver',
        category: 'performance'
      },
      current: stats.salesClosed,
      required: 10
    },
    {
      badge: {
        id: "closer_gold",
        name: "Fechador Ouro",
        icon: "🥇",
        description: "Feche 25 vendas",
        requirement: "25 vendas",
        tier: 'gold',
        category: 'performance'
      },
      current: stats.salesClosed,
      required: 25
    },
    {
      badge: {
        id: "master_closer",
        name: "Fechador Master",
        icon: "🏆",
        description: "Feche 50 vendas",
        requirement: "50 vendas",
        tier: 'platinum',
        category: 'performance'
      },
      current: stats.salesClosed,
      required: 50
    },
    {
      badge: {
        id: "high_ticket_bronze",
        name: "High Ticket Bronze",
        icon: "💰",
        description: "Alcance R$ 50.000 em vendas",
        requirement: "R$ 50k",
        tier: 'bronze',
        category: 'value'
      },
      current: stats.totalSalesValue,
      required: 50000
    },
    {
      badge: {
        id: "high_ticket_silver",
        name: "High Ticket Prata",
        icon: "💎",
        description: "Alcance R$ 100.000 em vendas",
        requirement: "R$ 100k",
        tier: 'silver',
        category: 'value'
      },
      current: stats.totalSalesValue,
      required: 100000
    },
    {
      badge: {
        id: "high_ticket_gold",
        name: "High Ticket Ouro",
        icon: "💵",
        description: "Alcance R$ 250.000 em vendas",
        requirement: "R$ 250k",
        tier: 'gold',
        category: 'value'
      },
      current: stats.totalSalesValue,
      required: 250000
    },
    {
      badge: {
        id: "communicator",
        name: "Comunicador",
        icon: "💬",
        description: "Faça 10 observações",
        requirement: "10 observações",
        tier: 'bronze',
        category: 'consistency'
      },
      current: stats.observations,
      required: 10
    },
    {
      badge: {
        id: "persistent",
        name: "Persistente",
        icon: "💪",
        description: "Envie 5 propostas",
        requirement: "5 propostas",
        tier: 'bronze',
        category: 'consistency'
      },
      current: stats.proposalsSent,
      required: 5
    },
  ];

  // Filter badges that are not yet achieved
  const unachievedBadges = allPossibleBadges.filter(b => b.current < b.required);
  
  // Sort by closest to completion
  unachievedBadges.sort((a, b) => {
    const percentA = (a.current / a.required) * 100;
    const percentB = (b.current / b.required) * 100;
    return percentB - percentA;
  });

  const next = unachievedBadges[0];
  if (!next) return null;

  return {
    badge: next.badge,
    current: next.current,
    required: next.required,
    percentage: Math.min(100, (next.current / next.required) * 100)
  };
}

// Formatar valor monetário
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

// Formatar pontuação
export function formatPoints(points: number): string {
  return new Intl.NumberFormat("pt-BR").format(points);
}

// Obter cor do ranking (para o pódio)
export function getRankColor(position: number): string {
  switch (position) {
    case 1:
      return "from-yellow-400 to-yellow-600"; // Ouro
    case 2:
      return "from-gray-300 to-gray-500"; // Prata
    case 3:
      return "from-orange-400 to-orange-600"; // Bronze
    default:
      return "from-primary/20 to-primary/40";
  }
}

// Obter emoji de medalha
export function getMedalEmoji(position: number): string {
  switch (position) {
    case 1:
      return "🥇";
    case 2:
      return "🥈";
    case 3:
      return "🥉";
    default:
      return "";
  }
}
