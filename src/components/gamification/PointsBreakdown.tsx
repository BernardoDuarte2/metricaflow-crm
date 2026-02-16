import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, Target, Zap, Trophy, Users } from "lucide-react";
import { motion } from "framer-motion";
import { formatPoints } from "@/lib/gamification";

const EVENT_COLORS: Record<string, string> = {
  lead_created: "hsl(var(--chart-1))",
  lead_qualified: "hsl(var(--chart-2))",
  proposal_sent: "hsl(var(--chart-3))",
  sale_closed: "hsl(var(--chart-4))",
  meeting_scheduled: "hsl(var(--chart-5))",
};

const EVENT_LABELS: Record<string, string> = {
  lead_created: "Leads Criados",
  lead_qualified: "Leads Qualificados",
  proposal_sent: "Propostas Enviadas",
  sale_closed: "Vendas Fechadas",
  meeting_scheduled: "Reuniões Agendadas",
};

export function PointsBreakdown() {
  const { data: myEvents, isLoading: loadingMyEvents } = useQuery({
    queryKey: ["my-gamification-events"],
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

  const { data: allEvents, isLoading: loadingAllEvents } = useQuery({
    queryKey: ["all-gamification-events"],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Get user's company
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .single();

      if (!profile) return null;

      // Get all events from company users
      const { data, error } = await supabase
        .from("gamification_events")
        .select(`
          *,
          profiles!gamification_events_user_id_fkey(company_id)
        `)
        .eq("profiles.company_id", profile.company_id)
        .gte("created_at", thirtyDaysAgo.toISOString());

      if (error) throw error;
      return data;
    },
  });

  if (loadingMyEvents || loadingAllEvents) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!myEvents || !allEvents) return null;

  // Calculate my stats by event type
  const myStatsByType = myEvents.reduce((acc, event) => {
    const type = event.event_type;
    if (!acc[type]) {
      acc[type] = { count: 0, points: 0 };
    }
    acc[type].count += 1;
    acc[type].points += event.points;
    return acc;
  }, {} as Record<string, { count: number; points: number }>);

  // Calculate team averages
  const userEventCounts = allEvents.reduce((acc, event) => {
    if (!acc[event.user_id]) {
      acc[event.user_id] = {};
    }
    const type = event.event_type;
    if (!acc[event.user_id][type]) {
      acc[event.user_id][type] = { count: 0, points: 0 };
    }
    acc[event.user_id][type].count += 1;
    acc[event.user_id][type].points += event.points;
    return acc;
  }, {} as Record<string, Record<string, { count: number; points: number }>>);

  const totalUsers = Object.keys(userEventCounts).length;
  const teamAverages = Object.keys(myStatsByType).reduce((acc, type) => {
    const totalForType = Object.values(userEventCounts).reduce(
      (sum, userStats) => sum + (userStats[type]?.points || 0),
      0
    );
    acc[type] = totalUsers > 0 ? totalForType / totalUsers : 0;
    return acc;
  }, {} as Record<string, number>);

  // Prepare data for bar chart (comparison with team average)
  const comparisonData = Object.keys(myStatsByType).map((type) => ({
    name: EVENT_LABELS[type] || type,
    "Meus Pontos": myStatsByType[type].points,
    "Média do Time": Math.round(teamAverages[type] || 0),
  }));

  // Prepare data for pie chart (my points distribution)
  const pieData = Object.keys(myStatsByType).map((type) => ({
    name: EVENT_LABELS[type] || type,
    value: myStatsByType[type].points,
  }));

  const totalPoints = myEvents.reduce((sum, event) => sum + event.points, 0);
  const totalActions = myEvents.length;
  const avgPointsPerAction = totalActions > 0 ? Math.round(totalPoints / totalActions) : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/20">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Pontos</p>
                <p className="text-2xl font-bold">{formatPoints(totalPoints)}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-500/20">
                <Zap className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Ações</p>
                <p className="text-2xl font-bold">{totalActions}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/20">
                <Target className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Média por Ação</p>
                <p className="text-2xl font-bold">{avgPointsPerAction}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-500/20">
                <Users className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Membros do Time</p>
                <p className="text-2xl font-bold">{totalUsers}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Comparison Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-bold">Comparação com o Time</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="Meus Pontos" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Média do Time" fill="hsl(var(--muted-foreground))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Distribution Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Trophy className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-bold">Distribuição de Pontos</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={EVENT_COLORS[Object.keys(myStatsByType)[index]] || "hsl(var(--primary))"} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Breakdown Detalhado
          </h3>
          <div className="space-y-4">
            {Object.entries(myStatsByType).map(([type, stats], index) => {
              const teamAvg = teamAverages[type] || 0;
              const percentDiff = teamAvg > 0 ? ((stats.points - teamAvg) / teamAvg) * 100 : 0;

              return (
                <motion.div
                  key={type}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: EVENT_COLORS[type] }}
                    />
                    <div>
                      <p className="font-semibold">{EVENT_LABELS[type] || type}</p>
                      <p className="text-sm text-muted-foreground">
                        {stats.count} {stats.count === 1 ? 'ação' : 'ações'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">{formatPoints(stats.points)}</p>
                    <p className={`text-sm ${percentDiff >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {percentDiff >= 0 ? '+' : ''}{percentDiff.toFixed(0)}% vs time
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
