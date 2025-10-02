import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MetricCard from "@/components/dashboard/MetricCard";
import { Users, CheckCircle, Clock, TrendingUp } from "lucide-react";

const Dashboard = () => {
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .select("*, companies(name)")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats", profile?.role],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let leadsQuery = supabase.from("leads").select("*", { count: "exact" });

      if (profile?.role === "vendedor") {
        leadsQuery = leadsQuery.eq("assigned_to", user.id);
      }

      const { count: totalLeads } = await leadsQuery;

      let wonQuery = supabase
        .from("leads")
        .select("*", { count: "exact" })
        .eq("status", "ganho");

      if (profile?.role === "vendedor") {
        wonQuery = wonQuery.eq("assigned_to", user.id);
      }

      const { count: wonLeads } = await wonQuery;

      let pendingQuery = supabase
        .from("leads")
        .select("*", { count: "exact" })
        .in("status", ["novo", "contato_feito", "proposta", "negociacao"]);

      if (profile?.role === "vendedor") {
        pendingQuery = pendingQuery.eq("assigned_to", user.id);
      }

      const { count: pendingLeads } = await pendingQuery;

      const conversionRate =
        totalLeads && totalLeads > 0
          ? ((wonLeads || 0) / totalLeads) * 100
          : 0;

      return {
        totalLeads: totalLeads || 0,
        wonLeads: wonLeads || 0,
        pendingLeads: pendingLeads || 0,
        conversionRate: conversionRate.toFixed(1),
      };
    },
    enabled: !!profile,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Visão geral do seu CRM
          {profile?.companies && ` - ${profile.companies.name}`}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Leads"
          value={stats?.totalLeads || 0}
          icon={Users}
          description="Leads cadastrados"
        />
        <MetricCard
          title="Vendas Fechadas"
          value={stats?.wonLeads || 0}
          icon={CheckCircle}
          description="Leads convertidos"
        />
        <MetricCard
          title="Em Andamento"
          value={stats?.pendingLeads || 0}
          icon={Clock}
          description="Leads ativos"
        />
        <MetricCard
          title="Taxa de Conversão"
          value={`${stats?.conversionRate || 0}%`}
          icon={TrendingUp}
          description="Efetividade de vendas"
        />
      </div>
    </div>
  );
};

export default Dashboard;
