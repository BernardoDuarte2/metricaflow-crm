import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LeaderboardLive } from "@/components/gamification/LeaderboardLive";
import { SaleCelebration } from "@/components/gamification/SaleCelebration";
import { BadgeUnlockedModal } from "@/components/gamification/BadgeUnlockedModal";
import { ActivityFeed } from "@/components/gamification/ActivityFeed";
import { useGamificationEvents } from "@/hooks/useGamificationEvents";
import { useGamificationSounds } from "@/hooks/useGamificationSounds";
import { SoundControls } from "@/components/gamification/SoundControls";
import { Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { calculateUserStats, calculateBadges, Badge } from "@/lib/gamification";

export default function GamificationLive() {
  const [showCelebration, setShowCelebration] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState<Badge | null>(null);
  const previousBadgesRef = useRef<Set<string>>(new Set());
  const { latestSale, clearLatestSale } = useGamificationEvents();
  const { isMuted, volume, setIsMuted, setVolume, playSound } = useGamificationSounds();
  const [clock, setClock] = useState(new Date());

  // Live clock — updates every second
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Badge detection events
  const { data: allEvents } = useQuery({
    queryKey: ["gamification-events-badges"],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase
        .from("gamification_events")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", thirtyDaysAgo.toISOString());
      if (error) throw error;
      return data;
    },
  });

  // Seller profile for sale celebration
  const { data: sellerData } = useQuery({
    queryKey: ["seller-profile", latestSale?.user_id],
    queryFn: async () => {
      if (!latestSale?.user_id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("name, avatar_url")
        .eq("id", latestSale.user_id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!latestSale,
  });

  // Detect new badges
  useEffect(() => {
    if (!allEvents) return;
    const stats = calculateUserStats(allEvents);
    const currentBadges = calculateBadges(stats);
    const currentBadgeIds = new Set(currentBadges.map(b => b.id));
    currentBadgeIds.forEach(badgeId => {
      if (!previousBadgesRef.current.has(badgeId)) {
        const badge = currentBadges.find(b => b.id === badgeId);
        if (badge) {
          setUnlockedBadge(badge);
          playSound('levelup');
        }
      }
    });
    previousBadgesRef.current = currentBadgeIds;
  }, [allEvents, playSound]);

  // Show celebration on new sale
  useEffect(() => {
    if (latestSale && sellerData) {
      setShowCelebration(true);
      playSound('sale');
    }
  }, [latestSale, sellerData, playSound]);

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
    clearLatestSale();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-6 lg:p-8">
      {/* Sound Controls */}
      <SoundControls
        isMuted={isMuted}
        volume={volume}
        onMuteToggle={() => setIsMuted(!isMuted)}
        onVolumeChange={setVolume}
      />

      {/* Celebration modals */}
      {showCelebration && latestSale && sellerData && (
        <SaleCelebration
          sellerName={sellerData.name}
          sellerAvatar={sellerData.avatar_url}
          leadName={latestSale.metadata?.lead_name || "Lead"}
          saleValue={latestSale.metadata?.estimated_value || 0}
          points={latestSale.points}
          onComplete={handleCelebrationComplete}
        />
      )}
      {unlockedBadge && (
        <BadgeUnlockedModal
          badge={unlockedBadge}
          onComplete={() => setUnlockedBadge(null)}
        />
      )}

      {/* ── Header ── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6 lg:mb-8"
      >
        <div className="flex items-center gap-3">
          <Trophy className="h-10 w-10 text-primary" />
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
            Ranking ao Vivo
          </h1>
        </div>

        <div className="flex items-center gap-6">
          {/* Live indicator */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
            </span>
            <span className="text-lg font-semibold text-primary uppercase tracking-wider">
              Ao Vivo
            </span>
          </div>

          {/* Clock */}
          <span className="text-2xl lg:text-3xl font-mono text-muted-foreground tabular-nums">
            {clock.toLocaleTimeString("pt-BR")}
          </span>
        </div>
      </motion.header>

      {/* ── Podium (top section) ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-1 min-h-0"
      >
        <LeaderboardLive />
      </motion.div>

      {/* ── Bottom section: ranks 4-10 are inside LeaderboardLive, Activity Feed beside it ── */}
      {/* Activity feed is now embedded in LeaderboardLive's bottom section */}

      {/* Subtle footer info */}
      <div className="mt-4 text-center">
        <span className="text-xs text-muted-foreground">
          Últimos 30 dias • Atualização automática a cada 5 segundos
        </span>
      </div>
    </div>
  );
}
