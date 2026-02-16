import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DateRange {
  start: string;
  end: string;
}

export const useDetailedPerformanceData = (
  dateRange: DateRange,
  profileRole?: string,
  companyId?: string
) => {
  return useQuery({
    queryKey: ["sales-performance-detailed", dateRange, profileRole, companyId],
    queryFn: async () => {
      // Se não tiver companyId, não faz fetch (deve estar em loading ainda ou erro)
      if (!companyId) return [];

      if (profileRole === "vendedor") {
        return [];
      }

      // Buscar leads com informações do vendedor (limitando para evitar URLs longas)
      const { data: leads } = await supabase
        .from("leads")
        .select("id, assigned_to, status, profiles(name, avatar_url), created_at, updated_at")
        .eq("company_id", companyId)
        .gte("created_at", dateRange.start)
        .lte("created_at", dateRange.end)
        .order("created_at", { ascending: false })
        .limit(100);

      // Buscar observações usando company_id e date range
      // Limitando observações (ex: últimas 500) para evitar pesar demais
      const { data: observations } = await supabase
        .from("lead_observations")
        .select("lead_id, user_id, leads!inner(company_id)")
        .eq("leads.company_id", companyId)
        .gte("created_at", dateRange.start)
        .lte("created_at", dateRange.end)
        .limit(500);

      const salesStats: Record<
        string,
        {
          leads: number;
          convertidos: number;
          name: string;
          avatar: string | null;
          observacoes: number;
          tempoTotal: number;
          countFechados: number;
        }
      > = {};

      leads?.forEach((lead: any) => {
        const vendedorId = lead.assigned_to;
        if (!vendedorId) return;

        if (!salesStats[vendedorId]) {
          salesStats[vendedorId] = {
            leads: 0,
            convertidos: 0,
            name: lead.profiles?.name || "Sem vendedor",
            avatar: lead.profiles?.avatar_url || null,
            observacoes: 0,
            tempoTotal: 0,
            countFechados: 0,
          };
        }

        salesStats[vendedorId].leads += 1;

        if (lead.status === "ganho") {
          salesStats[vendedorId].convertidos += 1;
          // Calcular tempo de fechamento (criação até atualização)
          const createdAt = new Date(lead.created_at);
          const updatedAt = new Date(lead.updated_at);
          const diffInDays = Math.ceil(
            (updatedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
          );
          salesStats[vendedorId].tempoTotal += diffInDays;
          salesStats[vendedorId].countFechados += 1;
        }
      });

      // Contar observações por vendedor
      observations?.forEach((obs: any) => {
        const vendedorId = obs.user_id;
        if (salesStats[vendedorId]) {
          salesStats[vendedorId].observacoes += 1;
        }
      });

      return Object.values(salesStats).map((stats) => ({
        vendedor: stats.name,
        avatar: stats.avatar,
        leads: stats.leads,
        convertidos: stats.convertidos,
        taxa:
          stats.leads > 0
            ? Number(((stats.convertidos / stats.leads) * 100).toFixed(1))
            : 0,
        observacoes: stats.observacoes,
        tempoMedio:
          stats.countFechados > 0
            ? Math.ceil(stats.tempoTotal / stats.countFechados)
            : 0,
      }));
    },
    // Executa apenas se for gestor E tiver companyId
    enabled: !!companyId && profileRole !== "vendedor" && profileRole !== undefined,
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
    gcTime: 10 * 60 * 1000,
  });
};
