import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Target, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";
import {
  calculateUserStats,
  calculateBadges,
  formatPoints,
  getMedalEmoji,
} from "@/lib/gamification";
import { motion, AnimatePresence } from "framer-motion";
import { useRankingChanges } from "@/hooks/useRankingChanges";

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

  const leaderboard = events
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

  const rankingChanges = useRankingChanges(leaderboard);

  const getChangeForUser = (userId: string) => {
    return rankingChanges.find(change => change.userId === userId);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="rounded-xl bg-card border border-border p-12">
        <div className="text-center space-y-3">
          <Trophy className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Nenhum dado disponível</h3>
          <p className="text-sm text-muted-foreground">
            O ranking será atualizado conforme as vendas acontecerem
          </p>
        </div>
      </div>
    );
  }

  const topThree = leaderboard.slice(0, 3);
  const restOfLeaderboard = leaderboard.slice(3);

  // Podium order: 2nd, 1st, 3rd
  const podiumOrder = topThree.length >= 3
    ? [topThree[1], topThree[0], topThree[2]]
    : topThree;
  const podiumRanks = topThree.length >= 3 ? [2, 1, 3] : topThree.map((_, i) => i + 1);

  return (
    <div className="space-y-6">
      {/* Podium */}
      <div className="grid grid-cols-3 gap-4 items-end">
        {podiumOrder.map((user, i) => {
          const rank = podiumRanks[i];
          const isFirst = rank === 1;
          const change = getChangeForUser(user.userId);

          return (
            <motion.div
              key={user.userId}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, type: "spring", duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <div
                className={`relative w-full rounded-xl border border-border bg-card p-5 text-center transition-shadow hover:shadow-md ${
                  isFirst ? "pb-7" : "pb-5"
                }`}
                style={isFirst ? {
                  borderColor: 'hsl(var(--accent))',
                  boxShadow: '0 0 24px -6px hsl(var(--accent) / 0.25)',
                } : {}}
              >
                {/* Rank change indicator */}
                {change && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`absolute top-2 right-2 flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      change.direction === 'up'
                        ? 'bg-success/15 text-success'
                        : 'bg-destructive/15 text-destructive'
                    }`}
                  >
                    {change.direction === 'up' ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
                    {Math.abs(change.newPosition - change.oldPosition)}
                  </motion.div>
                )}

                {/* Medal */}
                <div className={`${isFirst ? "text-4xl mb-2" : "text-2xl mb-1"}`}>
                  {getMedalEmoji(rank)}
                </div>

                {/* Avatar */}
                <Avatar className={`${isFirst ? "h-20 w-20" : "h-14 w-14"} mx-auto border-2 border-border`}>
                  <AvatarImage src={user.avatar} alt={user.userName} />
                  <AvatarFallback className="bg-muted text-muted-foreground text-sm font-semibold">
                    {getInitials(user.userName)}
                  </AvatarFallback>
                </Avatar>

                {/* Name */}
                <h3 className={`${isFirst ? "text-base" : "text-sm"} font-semibold text-foreground mt-2.5 truncate`}>
                  {user.userName}
                </h3>

                {/* Points */}
                <p className={`${isFirst ? "text-2xl" : "text-xl"} font-bold text-accent mt-1`}>
                  {formatPoints(user.totalPoints)}
                </p>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">pontos</span>

                {/* Quick stats */}
                <div className="flex items-center justify-center gap-3 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Trophy className="h-3 w-3 text-accent" />
                    {user.stats.salesClosed}
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="h-3 w-3 text-primary" />
                    {user.stats.conversionRate}%
                  </span>
                </div>

                {/* Badges */}
                {user.badges.length > 0 && (
                  <div className="flex gap-1 justify-center mt-2">
                    {user.badges.slice(0, 3).map((badge) => (
                      <span key={badge.id} className="text-lg" title={badge.name}>
                        {badge.icon}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Podium bar */}
              <div
                className={`w-full rounded-b-lg ${isFirst ? "h-6 bg-accent/20" : rank === 2 ? "h-4 bg-muted" : "h-3 bg-muted"}`}
                style={{ marginTop: '-4px' }}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Rest of leaderboard */}
      {restOfLeaderboard.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
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
                  className={`flex items-center gap-4 px-5 py-3.5 ${
                    index > 0 ? "border-t border-border" : ""
                  } hover:bg-muted/30 transition-colors`}
                >
                  {/* Position */}
                  <div className="w-8 text-center">
                    <span className="text-sm font-bold text-muted-foreground">{position}</span>
                  </div>

                  {/* Change indicator */}
                  <div className="w-5 flex justify-center">
                    {change ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={change.direction === 'up' ? 'text-success' : 'text-destructive'}
                      >
                        {change.direction === 'up' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
                      </motion.div>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">—</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarImage src={user.avatar} alt={user.userName} />
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs font-semibold">
                      {getInitials(user.userName)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Name & stats */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground truncate">{user.userName}</h4>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Trophy className="h-3 w-3" /> {user.stats.salesClosed}
                      </span>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" /> {user.stats.proposalsSent}
                      </span>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Target className="h-3 w-3" /> {user.stats.conversionRate}%
                      </span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex gap-0.5">
                    {user.badges.slice(0, 2).map((badge) => (
                      <span key={badge.id} className="text-base" title={badge.name}>
                        {badge.icon}
                      </span>
                    ))}
                  </div>

                  {/* Points */}
                  <div className="text-right">
                    <span className="text-lg font-bold text-accent">
                      {formatPoints(user.totalPoints)}
                    </span>
                    <p className="text-[10px] text-muted-foreground">pts</p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
