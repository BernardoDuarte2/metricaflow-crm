import { useState, useMemo, useCallback, useEffect, lazy, Suspense } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonTable, SkeletonStats } from "@/components/ui/skeleton-card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useRealtimeLeads } from "@/hooks/useRealtimeLeads";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Plus, Eye, ChevronDown, Calendar, X, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay, subDays } from "date-fns";
import { LeadFilters } from "@/components/leads/LeadFilters";
import { LeadTableRow } from "@/components/leads/LeadTableRow";
import { PaginationControls } from "@/components/leads/PaginationControls";
import { leadFormSchema, LeadFormData } from "@/lib/schemas";

const LeadStats = lazy(() => import("@/components/leads/LeadStats").then(m => ({ default: m.LeadStats })));

const statusColors: Record<string, string> = {
  novo: "bg-blue-500",
  contato_feito: "bg-yellow-500",
  proposta: "bg-purple-500",
  negociacao: "bg-orange-500",
  ganho: "bg-green-500",
  perdido: "bg-red-500",
};

// Helper to build banner text from URL params
const getFilterBannerText = (searchParams: URLSearchParams): string | null => {
  const status = searchParams.get('status');
  const stalledDays = searchParams.get('stalled_days');
  const noContactDays = searchParams.get('no_contact_days');
  const noTasks = searchParams.get('no_tasks');

  if (status === 'proposta' && stalledDays === '14') return 'Propostas paradas há +14 dias';
  if (status === 'negociacao' && stalledDays === '10') return 'Negociações paradas há +10 dias';
  if (status === 'novo' && noContactDays === '3') return 'Leads sem contato há +3 dias';
  if (status === 'qualificado' && noTasks === 'true') return 'SQL sem tarefa de follow-up';
  if (status) return `Filtro: status = ${status}`;
  return null;
};

const Leads = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [open, setOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof LeadFormData, string>>>({});
  const [formData, setFormData] = useState<LeadFormData>({
    name: "", email: "", phone: "", company: "", source: "", estimated_value: "", assigned_to: "",
  });

  // URL filter params
  const urlStatus = searchParams.get('status');
  const urlStalledDays = searchParams.get('stalled_days');
  const urlNoContactDays = searchParams.get('no_contact_days');
  const urlNoTasks = searchParams.get('no_tasks');
  const hasUrlFilters = !!(urlStatus || urlStalledDays || urlNoContactDays || urlNoTasks);
  const filterBannerText = getFilterBannerText(searchParams);

  const [period, setPeriod] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(urlStatus || "all");
  const [responsibleFilter, setResponsibleFilter] = useState("all");
  const [isPeriodOpen, setIsPeriodOpen] = useState(!hasUrlFilters);
  
  const [page, setPage] = useState(1);
  const pageSize = 50;
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // Sync URL status param to statusFilter
  useEffect(() => {
    if (urlStatus) {
      setStatusFilter(urlStatus);
    }
  }, [urlStatus]);

  useRealtimeLeads(["leads", page, period, debouncedSearchTerm, statusFilter, responsibleFilter]);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Sessão expirada.");
      const { data, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      if (error) throw error;
      return data;
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  const { data: userRole } = useQuery({
    queryKey: ["user-role"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id).order("role").limit(1).single();
      return data?.role;
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  const { data: users } = useQuery({
    queryKey: ["company-users"],
    queryFn: async () => {
      if (!profile?.company_id) return [];
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles").select("user_id, role").in("role", ["vendedor", "gestor", "gestor_owner"]);
      if (rolesError) throw rolesError;
      const userIds = userRoles?.map(r => r.user_id) || [];
      if (userIds.length === 0) return [];
      const { data, error } = await supabase
        .from("profiles").select("id, name").in("id", userIds).eq("company_id", profile.company_id).eq("active", true);
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.company_id,
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });

  const getDateRange = (periodValue: string) => {
    const now = new Date();
    switch (periodValue) {
      case "this-month": return { start: startOfMonth(now), end: endOfMonth(now) };
      case "last-month": return { start: startOfMonth(subMonths(now, 1)), end: endOfMonth(subMonths(now, 1)) };
      case "last-3-months": return { start: startOfMonth(subMonths(now, 3)), end: endOfDay(now) };
      default: return { start: null, end: null };
    }
  };

  const { data: leadsData, isLoading: isLoadingLeads } = useQuery({
    queryKey: ["leads", page, period, debouncedSearchTerm, statusFilter, responsibleFilter, urlStalledDays, urlNoContactDays, urlNoTasks],
    queryFn: async () => {
      const { start, end } = getDateRange(period);
      
      let query = supabase.from("leads").select("*, profiles(name)", { count: "exact" });

      if (start) query = query.gte("created_at", start.toISOString());
      if (end) query = query.lte("created_at", end.toISOString());

      if (debouncedSearchTerm) {
        query = query.or(
          `name.ilike.%${debouncedSearchTerm}%,email.ilike.%${debouncedSearchTerm}%,phone.ilike.%${debouncedSearchTerm}%,company.ilike.%${debouncedSearchTerm}%`
        );
      }

      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      if (responsibleFilter && responsibleFilter !== "all") {
        if (responsibleFilter === "unassigned") {
          query = query.is("assigned_to", null);
        } else {
          query = query.eq("assigned_to", responsibleFilter);
        }
      }

      // URL-based stalled_days filter
      if (urlStalledDays) {
        const stalledDate = subDays(new Date(), parseInt(urlStalledDays));
        query = query.lt("updated_at", stalledDate.toISOString());
      }

      // URL-based no_contact_days filter
      if (urlNoContactDays) {
        const noContactDate = subDays(new Date(), parseInt(urlNoContactDays));
        query = query.lt("updated_at", noContactDate.toISOString());
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      query = query.order("created_at", { ascending: false }).range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;

      let filteredData = data || [];

      // Client-side filter for no_tasks (needs separate query)
      if (urlNoTasks === 'true' && filteredData.length > 0) {
        const leadIds = filteredData.map((l: any) => l.id);
        const { data: tasksData } = await supabase
          .from("tasks").select("lead_id").in("lead_id", leadIds);
        const leadsWithTasks = new Set((tasksData || []).map((t: any) => t.lead_id));
        filteredData = filteredData.filter((l: any) => !leadsWithTasks.has(l.id));
      }
      
      return { leads: filteredData, count: urlNoTasks === 'true' ? filteredData.length : (count || 0) };
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const leads = leadsData?.leads || [];
  const totalCount = leadsData?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  
  const { data: leadStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["lead-stats", period, debouncedSearchTerm, statusFilter, responsibleFilter],
    queryFn: async () => {
      const { start, end } = getDateRange(period);
      let query = supabase.from("leads").select("status, estimated_value");
      if (start) query = query.gte("created_at", start.toISOString());
      if (end) query = query.lte("created_at", end.toISOString());
      if (debouncedSearchTerm) {
        query = query.or(
          `name.ilike.%${debouncedSearchTerm}%,email.ilike.%${debouncedSearchTerm}%,phone.ilike.%${debouncedSearchTerm}%,company.ilike.%${debouncedSearchTerm}%`
        );
      }
      if (statusFilter && statusFilter !== "all") query = query.eq("status", statusFilter);
      if (responsibleFilter && responsibleFilter !== "all") {
        if (responsibleFilter === "unassigned") query = query.is("assigned_to", null);
        else query = query.eq("assigned_to", responsibleFilter);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
  
  const handleFilterChange = useCallback(() => { setPage(1); }, []);

  const clearUrlFilters = () => {
    setSearchParams({});
    setStatusFilter("all");
  };

  const normalizePhone = (phone: string) => phone.replace(/\D/g, "");

  const createLeadMutation = useMutation({
    mutationFn: async (data: LeadFormData) => {
      const validation = leadFormSchema.safeParse(data);
      if (!validation.success) {
        const errors: Partial<Record<keyof LeadFormData, string>> = {};
        validation.error.errors.forEach((err) => {
          if (err.path[0]) errors[err.path[0] as keyof LeadFormData] = err.message;
        });
        setFormErrors(errors);
        throw new Error("Dados inválidos. Verifique os campos.");
      }
      setFormErrors({});
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Sessão expirada.");
      if (!profile?.company_id) throw new Error("Perfil da empresa não encontrado.");

      const normalizedPhone = normalizePhone(data.phone);
      const { data: existingLead } = await supabase
        .from("leads").select("id, name, assigned_to, profiles!leads_assigned_to_fkey(name)")
        .eq("company_id", profile.company_id)
        .or(`phone.eq.${normalizedPhone}${data.email ? `,email.eq.${data.email}` : ''}`)
        .limit(1).maybeSingle();

      if (existingLead) {
        const vendorName = existingLead.profiles ? (existingLead.profiles as any).name : "Não atribuído";
        throw new Error(`Lead já cadastrado e vinculado ao vendedor: ${vendorName || "Não atribuído"}`);
      }
      
      const { error } = await supabase.from("leads").insert({
        name: data.name, email: data.email || null, phone: normalizedPhone,
        company: data.company || null, source: data.source || null,
        estimated_value: data.estimated_value ? parseFloat(data.estimated_value) : null,
        company_id: profile.company_id, assigned_to: data.assigned_to || session.user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["kanban-leads"] });
      toast({ title: "Lead cadastrado com sucesso!" });
      setOpen(false);
      setFormErrors({});
      setFormData({ name: "", email: "", phone: "", company: "", source: "", estimated_value: "", assigned_to: "" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao cadastrar lead", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); createLeadMutation.mutate(formData); };

  const updateLeadAssignment = useMutation({
    mutationFn: async ({ leadId, assignedTo }: { leadId: string; assignedTo: string | null }) => {
      const { error } = await supabase.from("leads").update({ assigned_to: assignedTo, updated_at: new Date().toISOString() }).eq("id", leadId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["kanban-leads"] });
      toast({ title: "Responsável atualizado com sucesso!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao atualizar responsável", description: error.message, variant: "destructive" });
    },
  });

  const isGestor = userRole === "gestor" || userRole === "gestor_owner";
  const canEditAssignment = isGestor;

  const renderLeadsTable = () => {
    if (isLoadingLeads) return <SkeletonTable rows={8} />;
    return (
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads && leads.length > 0 ? (
              leads.map((lead: any) => (
                <LeadTableRow
                  key={lead.id}
                  lead={lead}
                  canEditAssignment={canEditAssignment}
                  users={users}
                  onAssignmentChange={(leadId, assignedTo) => updateLeadAssignment.mutate({ leadId, assignedTo })}
                  isUpdating={updateLeadAssignment.isPending}
                  statusColors={statusColors}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Nenhum lead encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Leads</h1>
          <p className="text-muted-foreground mt-1">Gerencie e organize seus leads por período</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Novo Lead</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Cadastrar Novo Lead</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className={formErrors.name ? "border-destructive" : ""} />
                {formErrors.name && <p className="text-sm text-destructive">{formErrors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={formErrors.email ? "border-destructive" : ""} />
                {formErrors.email && <p className="text-sm text-destructive">{formErrors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="(00) 00000-0000" required className={formErrors.phone ? "border-destructive" : ""} />
                {formErrors.phone && <p className="text-sm text-destructive">{formErrors.phone}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Empresa</Label>
                <Input id="company" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="source">Origem</Label>
                <Input id="source" value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })} placeholder="Ex: Site, Indicação, LinkedIn" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimated_value">Valor Estimado (R$)</Label>
                <Input id="estimated_value" type="number" step="0.01" min="0" value={formData.estimated_value} onChange={(e) => setFormData({ ...formData, estimated_value: e.target.value })} placeholder="0.00" />
              </div>
              {isGestor && (
                <div className="space-y-2">
                  <Label htmlFor="assigned_to">Atribuir para</Label>
                  <Select value={formData.assigned_to} onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}>
                    <SelectTrigger><SelectValue placeholder="Selecione um vendedor" /></SelectTrigger>
                    <SelectContent>
                      {users?.map((user) => <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={createLeadMutation.isPending}>
                {createLeadMutation.isPending ? <><LoadingSpinner className="mr-2 h-4 w-4" />Cadastrando...</> : "Cadastrar Lead"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* URL Filter Banner */}
      {hasUrlFilters && filterBannerText && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">
              Filtro aplicado: {filterBannerText}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={clearUrlFilters} className="text-amber-700 hover:text-amber-900 hover:bg-amber-100">
            <X className="h-4 w-4 mr-1" />
            Limpar filtro
          </Button>
        </div>
      )}

      {/* Filtros */}
      <LeadFilters
        searchTerm={searchTerm}
        onSearchChange={(value) => { setSearchTerm(value); handleFilterChange(); }}
        statusFilter={statusFilter}
        onStatusChange={(value) => { setStatusFilter(value); handleFilterChange(); }}
        responsibleFilter={responsibleFilter}
        onResponsibleChange={(value) => { setResponsibleFilter(value); handleFilterChange(); }}
        users={users}
        canFilterByResponsible={isGestor}
      />

      {/* Tabs por período */}
      <Collapsible open={isPeriodOpen} onOpenChange={setIsPeriodOpen}>
        <div className="bg-card rounded-lg border">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Períodos</h3>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <ChevronDown className={`h-4 w-4 transition-transform ${isPeriodOpen ? "rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent>
            <div className="border-t p-4">
              <Tabs defaultValue="all" value={period} onValueChange={(value) => { setPeriod(value); handleFilterChange(); }}>
                <TabsList className="grid w-full grid-cols-4 lg:w-auto">
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="this-month">Este Mês</TabsTrigger>
                  <TabsTrigger value="last-month">Mês Passado</TabsTrigger>
                  <TabsTrigger value="last-3-months">Últimos 3 Meses</TabsTrigger>
                </TabsList>

                <div className="mt-6">
                  <Suspense fallback={<Skeleton className="h-32 w-full" />}>
                    {!isLoadingStats && leadStats && <LeadStats leads={leadStats} period={period} />}
                  </Suspense>
                </div>

                {["all", "this-month", "last-month", "last-3-months"].map(tab => (
                  <TabsContent key={tab} value={tab} className="mt-6 space-y-4">
                    {renderLeadsTable()}
                    {totalPages > 1 && (
                      <PaginationControls
                        currentPage={page} totalPages={totalPages} onPageChange={setPage}
                        totalCount={totalCount} pageSize={pageSize}
                      />
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
};

export default Leads;
