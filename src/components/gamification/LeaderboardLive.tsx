import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Target, ArrowUp, ArrowDown, Zap } from "lucide-react";
import {
  calculateUserStats,
  calculateBadges,
  formatPoints,
  getMedalEmoji,
} from "@/lib/gamification";
import { motion, AnimatePresence } from "framer-motion";
import { useRankingChanges } from "@/hooks/useRankingChanges";
import { ActivityFeed } from "@/components/gamification/ActivityFeed";

export function LeaderboardLive() {
  const { data: events, isLoading } = useQuery({
    queryKey: ["gamification-leaderboard"],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data, error } = await supabase
        .from("gamification_events")
        .select("*, profiles!inner(id, name, avatar_url)")
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Mock data for demo/preview mode
  const MOCK_LEADERBOARD = [
    { userId: "m1", userName: "Rafael Oliveira", avatar: "https://i.pravatar.cc/150?img=12", stats: { totalPoints: 4850, salesClosed: 28, conversionRate: 42, leadsCreated: 67, proposalsSent: 45, observations: 30, totalSalesValue: 285000 }, badges: [{ id: "closer", name: "Fechador", icon: "🎯" }, { id: "streak", name: "Sequência", icon: "🔥" }, { id: "speed", name: "Veloz", icon: "⚡" }], totalPoints: 4850 },
    { userId: "m2", userName: "Camila Santos", avatar: "https://i.pravatar.cc/150?img=5", stats: { totalPoints: 4620, salesClosed: 26, conversionRate: 45, leadsCreated: 58, proposalsSent: 40, observations: 35, totalSalesValue: 310000 }, badges: [{ id: "converter", name: "Conversor", icon: "💎" }, { id: "streak", name: "Sequência", icon: "🔥" }], totalPoints: 4620 },
    { userId: "m3", userName: "Lucas Mendes", avatar: "https://i.pravatar.cc/150?img=11", stats: { totalPoints: 4380, salesClosed: 24, conversionRate: 38, leadsCreated: 63, proposalsSent: 42, observations: 28, totalSalesValue: 245000 }, badges: [{ id: "hunter", name: "Caçador", icon: "🏹" }, { id: "volume", name: "Volume", icon: "📊" }], totalPoints: 4380 },
    { userId: "m4", userName: "Ana Beatriz Costa", avatar: "https://i.pravatar.cc/150?img=9", stats: { totalPoints: 3950, salesClosed: 21, conversionRate: 40, leadsCreated: 52, proposalsSent: 38, observations: 25, totalSalesValue: 198000 }, badges: [{ id: "closer", name: "Fechador", icon: "🎯" }], totalPoints: 3950 },
    { userId: "m5", userName: "Pedro Henrique", avatar: "https://i.pravatar.cc/150?img=14", stats: { totalPoints: 3720, salesClosed: 19, conversionRate: 36, leadsCreated: 53, proposalsSent: 35, observations: 22, totalSalesValue: 175000 }, badges: [{ id: "speed", name: "Veloz", icon: "⚡" }], totalPoints: 3720 },
    { userId: "m6", userName: "Juliana Ferreira", avatar: "https://i.pravatar.cc/150?img=20", stats: { totalPoints: 3410, salesClosed: 17, conversionRate: 34, leadsCreated: 50, proposalsSent: 32, observations: 20, totalSalesValue: 162000 }, badges: [{ id: "streak", name: "Sequência", icon: "🔥" }], totalPoints: 3410 },
    { userId: "m7", userName: "Gabriel Souza", avatar: "https://i.pravatar.cc/150?img=53", stats: { totalPoints: 3180, salesClosed: 15, conversionRate: 32, leadsCreated: 47, proposalsSent: 30, observations: 18, totalSalesValue: 148000 }, badges: [], totalPoints: 3180 },
    { userId: "m8", userName: "Mariana Lima", avatar: "https://i.pravatar.cc/150?img=45", stats: { totalPoints: 2890, salesClosed: 14, conversionRate: 30, leadsCreated: 46, proposalsSent: 28, observations: 16, totalSalesValue: 132000 }, badges: [], totalPoints: 2890 },
    { userId: "m9", userName: "Thiago Almeida", avatar: "https://i.pravatar.cc/150?img=60", stats: { totalPoints: 2650, salesClosed: 12, conversionRate: 28, leadsCreated: 43, proposalsSent: 25, observations: 14, totalSalesValue: 115000 }, badges: [], totalPoints: 2650 },
    { userId: "m10", userName: "Isabela Rocha", avatar: "https://i.pravatar.cc/150?img=25", stats: { totalPoints: 2380, salesClosed: 10, conversionRate: 26, leadsCreated: 38, proposalsSent: 22, observations: 12, totalSalesValue: 98000 }, badges: [], totalPoints: 2380 },
  ];

  const realLeaderboard = events
    ? Object.entries(
        events.reduce((acc: any, event: any) => {
          const userId = event.profiles.id;
          if (!acc[userId]) {
            acc[userId] = {
              userId,
              userName: event.profiles.name,
              avatar: event.profiles.avatar_url,
              events: [],
            };
          }
          acc[userId].events.push(event);
          return acc;
        }, {})
      )
        .map(([userId, data]: [string, any]) => {
          const stats = calculateUserStats(data.events);
          const badges = calculateBadges(stats);
          return {
            userId,
            userName: data.userName,
            avatar: data.avatar,
            stats,
            badges,
            totalPoints: stats.totalPoints,
          };
        })
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .slice(0, 20)
    : [];

  // Use mock data when no real data exists
  const leaderboard = realLeaderboard.length > 0 ? realLeaderboard : MOCK_LEADERBOARD;

  const rankingChanges = useRankingChanges(leaderboard);
  const getChangeForUser = (userId: string) =>
    rankingChanges.find((c) => c.userId === userId);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="rounded-2xl bg-card border border-border p-16 text-center">
        <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-2xl font-semibold text-foreground">Nenhum dado disponível</h3>
        <p className="text-lg text-muted-foreground mt-2">
          O ranking será atualizado conforme as vendas acontecerem
        </p>
      </div>
    );
  }

  const topThree = leaderboard.slice(0, 3);
  const restOfLeaderboard = leaderboard.slice(3, 10);

  // Podium order: 2nd, 1st, 3rd
  const podiumOrder =
    topThree.length >= 3
      ? [topThree[1], topThree[0], topThree[2]]
      : topThree;
  const podiumRanks =
    topThree.length >= 3 ? [2, 1, 3] : topThree.map((_, i) => i + 1);

  const podiumHeights: Record<number, string> = {
    1: "h-28 lg:h-36",
    2: "h-20 lg:h-24",
    3: "h-14 lg:h-18",
  };

  const podiumColors: Record<number, string> = {
    1: "bg-primary/20 border-primary/40",
    2: "bg-muted/60 border-muted-foreground/20",
    3: "bg-muted/40 border-muted-foreground/15",
  };

  return (
    <div className="flex flex-col h-full gap-6">
      {/* ── PODIUM ── */}
      <div className="flex items-end justify-center gap-4 lg:gap-8 pt-4">
        {podiumOrder.map((user, i) => {
          const rank = podiumRanks[i];
          const isWinner = rank === 1;
          const change = getChangeForUser(user.userId);

          const avatarSize = isWinner
            ? "h-24 w-24 lg:h-32 lg:w-32"
            : "h-16 w-16 lg:h-24 lg:w-24";

          return (
            <motion.div
              key={user.userId}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, type: "spring", stiffness: 120 }}
              className="flex flex-col items-center"
              style={{ width: isWinner ? "280px" : "220px" }}
            >
              {/* User card */}
              <div className="relative flex flex-col items-center text-center mb-0">
                {/* Rank change */}
                {change && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`absolute -top-2 -right-2 flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-full z-10 ${
                      change.direction === "up"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-destructive/20 text-destructive"
                    }`}
                  >
                    {change.direction === "up" ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : (
                      <ArrowDown className="h-3 w-3" />
                    )}
                    {Math.abs(change.newPosition - change.oldPosition)}
                  </motion.div>
                )}

                {/* Medal */}
                <span className={`${isWinner ? "text-5xl" : "text-3xl"} mb-2`}>
                  {getMedalEmoji(rank)}
                </span>

                {/* Avatar */}
                <div className={`relative ${isWinner ? "mb-3" : "mb-2"}`}>
                  <Avatar
                    className={`${avatarSize} border-4 ${
                      isWinner
                        ? "border-primary shadow-[0_0_30px_-5px_hsl(var(--primary)/0.5)]"
                        : "border-border"
                    }`}
                  >
                    <AvatarImage src={user.avatar} alt={user.userName} />
                    <AvatarFallback className="bg-muted text-muted-foreground text-xl font-bold">
                      {getInitials(user.userName)}
                    </AvatarFallback>
                  </Avatar>
                  {isWinner && (
                    <motion.div
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full border-2 border-primary/30"
                    />
                  )}
                </div>

                {/* Name */}
                <h3
                  className={`${
                    isWinner ? "text-2xl lg:text-3xl" : "text-xl lg:text-2xl"
                  } font-bold text-foreground truncate max-w-full`}
                >
                  {user.userName}
                </h3>

                {/* Points */}
                <p
                  className={`${
                    isWinner ? "text-4xl lg:text-5xl" : "text-3xl lg:text-4xl"
                  } font-extrabold text-primary mt-1`}
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {formatPoints(user.totalPoints)}
                </p>
                <span className="text-sm text-muted-foreground uppercase tracking-widest">
                  pontos
                </span>

                {/* Stats */}
                <div className="flex items-center justify-center gap-4 mt-2 text-base text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Trophy className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-foreground">{user.stats.salesClosed}</span>
                    vendas
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-foreground">{user.stats.conversionRate}%</span>
                  </span>
                </div>

                {/* Badges */}
                {user.badges.length > 0 && (
                  <div className="flex gap-1.5 justify-center mt-2">
                    {user.badges.slice(0, 4).map((badge) => (
                      <span key={badge.id} className="text-xl" title={badge.name}>
                        {badge.icon}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Podium block */}
              <div
                className={`w-full ${podiumHeights[rank]} ${podiumColors[rank]} rounded-t-xl border-t border-x mt-2 flex items-center justify-center`}
              >
                <span className="text-3xl font-black text-muted-foreground/40">
                  {rank}º
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── BOTTOM: Ranks 4-10 + Activity Feed ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
        {/* Ranks 4-10 */}
        <div className="lg:col-span-3 rounded-2xl border border-border bg-card overflow-hidden">
          <AnimatePresence mode="popLayout">
            {restOfLeaderboard.map((user, index) => {
              const change = getChangeForUser(user.userId);
              const position = index + 4;

              return (
                <motion.div
                  key={user.userId}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ type: "spring", duration: 0.4 }}
                  className={`flex items-center gap-4 lg:gap-5 px-5 lg:px-6 py-4 ${
                    index > 0 ? "border-t border-border" : ""
                  } hover:bg-muted/30 transition-colors`}
                >
                  {/* Position */}
                  <span
                    className="text-xl lg:text-2xl font-bold text-muted-foreground w-10 text-center"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {position}
                  </span>

                  {/* Change */}
                  <div className="w-6 flex justify-center">
                    {change ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={
                          change.direction === "up"
                            ? "text-green-400"
                            : "text-destructive"
                        }
                      >
                        {change.direction === "up" ? (
                          <ArrowUp className="h-4 w-4" />
                        ) : (
                          <ArrowDown className="h-4 w-4" />
                        )}
                      </motion.div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <Avatar className="h-12 w-12 lg:h-14 lg:w-14 border-2 border-border">
                    <AvatarImage src={user.avatar} alt={user.userName} />
                    <AvatarFallback className="bg-muted text-muted-foreground text-sm font-bold">
                      {getInitials(user.userName)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Name & stats */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg lg:text-xl font-bold text-foreground truncate">
                      {user.userName}
                    </h4>
                    <div className="flex items-center gap-4 mt-0.5">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Trophy className="h-3.5 w-3.5" /> {user.stats.salesClosed} vendas
                      </span>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Target className="h-3.5 w-3.5" /> {user.stats.conversionRate}%
                      </span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex gap-1">
                    {user.badges.slice(0, 2).map((badge) => (
                      <span key={badge.id} className="text-lg" title={badge.name}>
                        {badge.icon}
                      </span>
                    ))}
                  </div>

                  {/* Points */}
                  <div className="text-right">
                    <span
                      className="text-2xl lg:text-3xl font-extrabold text-primary"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {formatPoints(user.totalPoints)}
                    </span>
                    <p className="text-xs text-muted-foreground">pts</p>
                  </div>
                </motion.div>
              );
            })}
            {restOfLeaderboard.length === 0 && (
              <div className="px-6 py-8 text-center text-muted-foreground text-lg">
                Sem mais participantes no ranking
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card p-4 lg:p-5 h-full">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-bold text-foreground">Feed ao Vivo</h3>
            </div>
            <ActivityFeed />
          </div>
        </div>
      </div>
    </div>
  );
}
