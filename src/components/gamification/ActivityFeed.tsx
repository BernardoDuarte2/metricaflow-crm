import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useActivityStream } from "@/hooks/useActivityStream";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, TrendingUp, Target, MessageSquare, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function ActivityFeed() {
  const { recentActivities } = useActivityStream();

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'sale_closed':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'proposal_sent':
        return <Target className="h-4 w-4 text-blue-500" />;
      case 'lead_created':
        return <Zap className="h-4 w-4 text-yellow-500" />;
      case 'observation_added':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getEventText = (activity: any) => {
    switch (activity.event_type) {
      case 'sale_closed':
        return `fechou venda${activity.metadata?.lead_name ? ` - ${activity.metadata.lead_name}` : ''}`;
      case 'proposal_sent':
        return `enviou proposta${activity.metadata?.lead_name ? ` - ${activity.metadata.lead_name}` : ''}`;
      case 'lead_created':
        return `criou lead${activity.metadata?.lead_name ? ` - ${activity.metadata.lead_name}` : ''}`;
      case 'observation_added':
        return 'adicionou observação';
      default:
        return 'realizou ação';
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'sale_closed':
        return 'bg-green-500/10 border-green-500/20';
      case 'proposal_sent':
        return 'bg-blue-500/10 border-blue-500/20';
      case 'lead_created':
        return 'bg-yellow-500/10 border-yellow-500/20';
      case 'observation_added':
        return 'bg-purple-500/10 border-purple-500/20';
      default:
        return 'bg-muted/50 border-muted';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (recentActivities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Feed ao Vivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Aguardando atividades...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Feed ao Vivo
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Últimas {recentActivities.length} atividades
        </p>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {recentActivities.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.4 }}
              layout
            >
              <div className={`p-3 rounded-lg border ${getEventColor(activity.event_type)} hover:shadow-md transition-all`}>
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <Avatar className="h-10 w-10 border-2 border-background">
                    <AvatarImage src={activity.user_avatar || undefined} alt={activity.user_name} />
                    <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-primary/60">
                      {getInitials(activity.user_name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-semibold">{activity.user_name}</span>
                          {' '}
                          <span className="text-muted-foreground">{getEventText(activity)}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {getEventIcon(activity.event_type)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        +{activity.points} pts
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.created_at), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
