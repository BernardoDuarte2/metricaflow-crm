import { useEffect, useState } from "react";
import { Badge as BadgeType } from "@/lib/gamification";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BadgeUnlockedModalProps {
  badge: BadgeType;
  onComplete: () => void;
}

export function BadgeUnlockedModal({ badge, onComplete }: BadgeUnlockedModalProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500);
    }, 4000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case 'platinum': return 'from-slate-300 via-slate-100 to-slate-300';
      case 'gold': return 'from-yellow-400 via-yellow-200 to-yellow-400';
      case 'silver': return 'from-gray-400 via-gray-200 to-gray-400';
      case 'bronze': return 'from-orange-600 via-orange-400 to-orange-600';
      default: return 'from-primary via-purple-400 to-primary';
    }
  };

  const getTierGlow = (tier?: string) => {
    switch (tier) {
      case 'platinum': return 'shadow-slate-500/50';
      case 'gold': return 'shadow-yellow-500/50';
      case 'silver': return 'shadow-gray-500/50';
      case 'bronze': return 'shadow-orange-500/50';
      default: return 'shadow-primary/50';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => {
            setIsVisible(false);
            setTimeout(onComplete, 500);
          }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    x: 0, 
                    y: 0, 
                    scale: 0,
                    opacity: 1 
                  }}
                  animate={{
                    x: (Math.random() - 0.5) * 400,
                    y: (Math.random() - 0.5) * 400,
                    scale: [0, 1, 0],
                    opacity: [1, 1, 0]
                  }}
                  transition={{
                    duration: 2,
                    delay: Math.random() * 0.5,
                    ease: "easeOut"
                  }}
                  className="absolute top-1/2 left-1/2"
                >
                  <Sparkles className="h-4 w-4 text-yellow-400" />
                </motion.div>
              ))}
            </div>

            {/* Badge Card */}
            <div className={`relative bg-gradient-to-br ${getTierColor(badge.tier)} p-1 rounded-3xl ${getTierGlow(badge.tier)} shadow-2xl`}>
              <div className="bg-card rounded-3xl p-12 min-w-[400px]">
                <div className="text-center space-y-6">
                  {/* Header */}
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                      🎊 Badge Desbloqueado! 🎊
                    </h2>
                  </motion.div>

                  {/* Badge Icon */}
                  <motion.div
                    animate={{ 
                      rotate: [0, -10, 10, -10, 10, 0],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                      duration: 0.8,
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                    className="text-9xl"
                  >
                    {badge.icon}
                  </motion.div>

                  {/* Badge Info */}
                  <div className="space-y-3">
                    <h3 className="text-4xl font-bold">{badge.name}</h3>
                    
                    {badge.tier && (
                      <Badge 
                        variant="outline" 
                        className={`text-lg px-4 py-1 bg-gradient-to-r ${getTierColor(badge.tier)}`}
                      >
                        {badge.tier.toUpperCase()}
                      </Badge>
                    )}

                    <p className="text-xl text-muted-foreground">{badge.description}</p>
                    <p className="text-sm text-muted-foreground">
                      Requisito: {badge.requirement}
                    </p>
                  </div>

                  {/* Footer */}
                  <p className="text-sm text-muted-foreground italic">
                    Toque para continuar
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
