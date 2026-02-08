import { useState, lazy, Suspense, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDetailedPerformanceData } from "@/hooks/useDetailedPerformanceData";
import { useRealtimeLeads } from "@/hooks/useRealtimeLeads";
import OnboardingChecklist from "@/components/onboarding/OnboardingChecklist";
import { 
  Users, CheckCircle, TrendingUp, DollarSign, Target, FileDown,
  BarChart3, Activity, Percent, Timer, UserX, CalendarCheck, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonDashboard, SkeletonKPI, SkeletonChart } from "@/components/ui/skeleton-card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  CockpitLayout,
  QuickStats,
  TeamGoalProgressCard,
  ActivityBreakdownPanel,
  SalesRepDetailedPanel,
  RevenueBySellerChart,
  LeadsConversionMonthlyChart,
  LossWaterfallChart,
  TeamProgressPanel,
  BusinessScoreCards,
  UnifiedFunnel,
  MarketingVsSales,
  MoneyPipeline,
  MoneyLeakAlerts,
  DashboardEvolutionChart,
} from "@/components/dashboard/cockpit";

const AdvancedMetricsCard = lazy(() => import("@/components/dashboard/AdvancedMetricsCard").then(m => ({ default: m.AdvancedMetricsCard })));

const generatePDF = async () => {
  const [jsPDF, html2canvas] = await Promise.all([
    import("jspdf").then(m => m.default),
    import("html2canvas").then(m => m.default)
  ]);
  return { jsPDF, html2canvas };
};

const ChartSkeleton = () => <SkeletonChart className="h-[300px]" />;
const KPISkeleton = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {[1, 2, 3, 4].map((i) => <SkeletonKPI key={i} />)}
  </div>
);

type PeriodFilter = 'today' | 'week' | 'month';

const Dashboard = () => {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('month');
  const [isExporting, setIsExporting] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  useRealtimeLeads();

  const getDateRange = () => {
    const now = new Date();
    switch (periodFilter) {
      case 'today':
        return {
          start: new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString(),
          end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString(),
        };
      case 'week': {
        const dayOfWeek = now.getDay();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - dayOfWeek);
        startOfWeek.setHours(0, 0, 0, 0);
        return {
          start: startOfWeek.toISOString(),
          end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString(),
        };
      }
      case 'month':
      default:
        return {
          start: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
          end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString(),
        };
    }
  };

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Sessão expirada.");
      const { data, error } = await supabase.from("profiles").select("*, companies(name)").eq("id", session.user.id).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: userRole } = useQuery({
    queryKey: ["user-role"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id).order("role").limit(1).single();
      return data?.role;
    },
  });

  const { data: dashboardData, isLoading: isLoadingDashboard } = useQuery({
    queryKey: ["dashboard-stats", userRole, periodFilter],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Sessão expirada.");
      const dateRange = getDateRange();
      const { data, error } = await supabase.functions.invoke('get-dashboard-stats', {
        body: {
          start_date: dateRange.start,
          end_date: dateRange.end,
          user_role: userRole || 'vendedor',
          user_id: session.user.id,
        },
      });
      if (error) throw error;
      return data;
    },
    enabled: !!profile && !!userRole,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const stats = dashboardData?.stats;
  const sourceData = dashboardData?.sourceData;
  const lossReasonsData = dashboardData?.lossReasonsData;
  const funnelStageDays = dashboardData?.funnelStageDays;

  const { data: detailedPerformanceData } = useDetailedPerformanceData(getDateRange(), userRole);

  const teamRankingData = useMemo(() => {
    if (!dashboardData?.teamData || userRole === 'vendedor') return [];
    return dashboardData.teamData;
  }, [dashboardData?.teamData, userRole]);

  const activityData = useMemo(() => {
    if (!dashboardData?.teamData || userRole === 'vendedor') return [];
    return dashboardData.teamData.map((t: any) => ({
      name: t.name, meetings: t.meetings || 0, tasks: t.tasks || 0,
      observations: t.observations || 0, avatar: t.avatar,
    }));
  }, [dashboardData?.teamData, userRole]);

  const processedLossData = useMemo(() => {
    if (!lossReasonsData) return [];
    const total = lossReasonsData.reduce((sum: number, item: any) => sum + (item.value || item.count || 0), 0);
    return lossReasonsData.map((item: any) => ({
      reason: item.name || item.reason,
      count: item.value || item.count || 0,
      value: (item.value || item.count || 0) * (stats?.averageTicket || 5000),
      percentage: total > 0 ? ((item.value || item.count || 0) / total) * 100 : 0
    }));
  }, [lossReasonsData, stats]);

  const quickStatsData = useMemo(() => {
    if (!stats) return [];
    return [
      { label: "CAC", value: stats.cac || 0, icon: DollarSign, color: "primary" as const, prefix: "R$ " },
      { label: "LTV", value: stats.ltv || 0, icon: TrendingUp, color: "success" as const, prefix: "R$ " },
      { label: "Payback", value: stats.payback || 0, icon: Timer, color: "muted" as const, suffix: " meses" },
      { label: "Follow-up", value: stats.followUpRate || 0, icon: Activity, color: parseFloat(stats.followUpRate || '0') >= 70 ? "success" as const : "warning" as const, suffix: "%" },
      { label: "Taxa de Perda", value: stats.lossRate || 0, icon: UserX, color: parseFloat(stats.lossRate || '0') < 30 ? "muted" as const : "danger" as const, suffix: "%" },
      { label: "Atividades", value: stats.totalActivities || 0, icon: CalendarCheck, color: "primary" as const },
    ];
  }, [stats]);

  const handleExportPDF = async () => {
    if (!stats || !profile) { toast.error("Aguarde o carregamento dos dados"); return; }
    setIsExporting(true);
    const loadingToast = toast.loading("Gerando PDF...");
    try {
      const { jsPDF } = await generatePDF();
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, pageWidth, 35, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Dashboard Comercial", pageWidth / 2, 18, { align: "center" });
      doc.setFontSize(10);
      doc.text(`${new Date().toLocaleDateString('pt-BR')} - ${profile?.companies?.name || 'CRM'}`, pageWidth / 2, 28, { align: "center" });
      let y = 50;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Métricas Principais", 20, y); y += 10;
      const metrics = [
        `Total de Leads: ${stats.totalLeads || 0}`,
        `SQL Gerados: ${stats.sqlCount || 0}`,
        `Receita Fechada: R$ ${(stats.totalConvertedValue || 0).toLocaleString('pt-BR')}`,
        `Taxa Mktg: ${stats.marketingConversionRate || 0}%`,
        `Taxa Vendas: ${stats.salesConversionRate || 0}%`,
      ];
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      metrics.forEach((m) => { doc.text(`• ${m}`, 25, y); y += 7; });
      doc.save(`dashboard-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.dismiss(loadingToast);
      toast.success('Relatório exportado!');
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Erro ao gerar PDF');
    } finally { setIsExporting(false); }
  };

  const isManager = userRole !== 'vendedor';
  const periodLabel = periodFilter === 'today' ? 'Hoje' : periodFilter === 'week' ? 'Esta Semana' : 'Este Mês';

  return (
    <CockpitLayout>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard Comercial</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Visão completa do funil de vendas
            {profile?.companies && ` • ${(profile.companies as any).name}`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period Filter */}
          <Tabs value={periodFilter} onValueChange={(v) => setPeriodFilter(v as PeriodFilter)}>
            <TabsList>
              <TabsTrigger value="today">Hoje</TabsTrigger>
              <TabsTrigger value="week">Semana</TabsTrigger>
              <TabsTrigger value="month">Mês</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            onClick={handleExportPDF}
            disabled={isExporting || !stats}
            variant="outline"
            size="sm"
          >
            {isExporting ? <LoadingSpinner className="h-4 w-4" /> : <><FileDown className="h-4 w-4 mr-2" />Exportar</>}
          </Button>
        </div>
      </div>

      {!stats || isLoadingDashboard ? (
        <div className="space-y-6">
          <KPISkeleton />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><ChartSkeleton /><ChartSkeleton /></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Onboarding */}
          {isManager && <OnboardingChecklist />}

          {/* 1. PLACAR DO NEGÓCIO */}
          <BusinessScoreCards
            totalLeads={stats.totalLeads || 0}
            previousTotalLeads={stats.previousTotalLeads || 0}
            sqlCount={stats.sqlCount || 0}
            previousSqlCount={stats.previousQualified || 0}
            openOpportunitiesValue={stats.currentOpenOpportunitiesValue || 0}
            previousOpenOpportunitiesValue={stats.previousPipelineValue || 0}
            totalConvertedValue={stats.totalConvertedValue || 0}
            previousConvertedValue={stats.previousConvertedValue || 0}
          />

          {/* 2. FUNIL ÚNICO END-TO-END */}
          {funnelStageDays && funnelStageDays.length > 0 && (
            <UnifiedFunnel stages={funnelStageDays} />
          )}

          {/* 3. MARKETING vs VENDAS */}
          <MarketingVsSales
            sourceData={sourceData || []}
            marketingConversionRate={stats.marketingConversionRate || 0}
            salesConversionRate={stats.salesConversionRate || 0}
          />

          {/* 4. PIPELINE DE DINHEIRO */}
          <MoneyPipeline
            proposalsValue={stats.pipelineProposalsValue || 0}
            negotiationsValue={stats.pipelineNegotiationsValue || 0}
            closedValue={stats.pipelineClosedValue || stats.totalConvertedValue || 0}
            monthlyGoal={stats.monthlyGoal || 0}
          />

          {/* 5. ALERTAS DE PERDA DE DINHEIRO */}
          <MoneyLeakAlerts
            stalledProposals14d={stats.stalledProposals14d || 0}
            stalledNegotiations10d={stats.stalledNegotiations10d || 0}
            leadsNoContact3d={stats.leadsNoContact3d || 0}
            sqlNoFollowUp={stats.sqlNoFollowUp || 0}
          />

          {/* 6. EVOLUÇÃO NO TEMPO */}
          {dashboardData?.monthlyLeadsConversion?.length > 0 && (
            <DashboardEvolutionChart data={dashboardData.monthlyLeadsConversion} />
          )}

          {/* === SEÇÕES DE GESTORES (mantidas) === */}
          
          {/* Team Goal Progress */}
          {isManager && stats?.totalTeamGoal > 0 && (
            <TeamGoalProgressCard
              totalGoal={stats.totalTeamGoal}
              totalAchieved={stats.totalTeamAchieved}
              teamSize={stats.teamSize}
              daysRemaining={stats.daysRemaining}
              isManager={isManager}
              onEditGoal={() => { window.location.href = '/goals'; }}
            />
          )}

          {/* Detailed Team Performance */}
          {isManager && teamRankingData.length > 0 && (
            <SalesRepDetailedPanel data={teamRankingData} title="Performance do Time" />
          )}

          {/* Activity Breakdown */}
          {isManager && activityData.length > 0 && (
            <ActivityBreakdownPanel data={activityData} title="Atividades por Vendedor" />
          )}

          {/* Team Progress */}
          {profile?.company_id && (
            <TeamProgressPanel 
              companyId={profile.company_id}
              currentUserId={profile.id}
              isManager={isManager}
            />
          )}

          {/* Revenue by Seller + Leads vs Closed */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {isManager && dashboardData?.monthlyRevenueBySellerData?.length > 0 && (
              <RevenueBySellerChart 
                data={dashboardData.monthlyRevenueBySellerData}
                sellers={dashboardData.sellers || []}
                title="Receita por Vendedor (Mês a Mês)"
              />
            )}
            {dashboardData?.monthlyLeadsConversion?.length > 0 && (
              <LeadsConversionMonthlyChart 
                data={dashboardData.monthlyLeadsConversion}
                title="Leads vs Fechados + Conversão"
              />
            )}
          </div>

          {/* MÉTRICAS AVANÇADAS - Collapsible */}
          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between border-border hover:bg-muted/50">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <BarChart3 className="h-4 w-4" />
                  Métricas Avançadas
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${advancedOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-6 mt-4">
              <QuickStats stats={quickStatsData} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {processedLossData.length > 0 && (
                  <LossWaterfallChart
                    data={processedLossData}
                    title="Análise de Perdas"
                    totalLost={processedLossData.reduce((sum, item) => sum + item.value, 0)}
                  />
                )}
                <Suspense fallback={<ChartSkeleton />}>
                  <AdvancedMetricsCard
                    cac={stats?.cac ?? null}
                    ltv={stats?.ltv ?? null}
                    payback={stats?.payback ?? null}
                    avgTimeInFunnel={stats?.avgTimeInFunnel || 0}
                  />
                </Suspense>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
    </CockpitLayout>
  );
};

export default Dashboard;
