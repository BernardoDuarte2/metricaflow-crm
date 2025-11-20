import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DollarSign, Plus, Trash2, Edit, Save, X } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MarketingCost {
  id: string;
  period_start: string;
  period_end: string;
  marketing_cost: number;
  sales_cost: number;
  average_retention_months: number;
}

export const MarketingCostsSettings = () => {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    period_start: "",
    period_end: "",
    marketing_cost: "",
    sales_cost: "",
    average_retention_months: "12",
  });

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Sessão expirada");
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: costs, isLoading } = useQuery({
    queryKey: ["marketing-costs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketing_costs")
        .select("*")
        .order("period_start", { ascending: false });
      
      if (error) throw error;
      return data as MarketingCost[];
    },
    enabled: !!profile,
  });

  const createCostMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) throw new Error("Sessão expirada");

      const { error } = await supabase.from("marketing_costs").insert({
        company_id: profile?.company_id,
        period_start: data.period_start,
        period_end: data.period_end,
        marketing_cost: parseFloat(data.marketing_cost),
        sales_cost: parseFloat(data.sales_cost),
        average_retention_months: parseInt(data.average_retention_months),
        created_by: session.session.user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketing-costs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Custos adicionados com sucesso!");
      setIsAdding(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao adicionar custos");
    },
  });

  const updateCostMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("marketing_costs")
        .update({
          period_start: data.period_start,
          period_end: data.period_end,
          marketing_cost: parseFloat(data.marketing_cost),
          sales_cost: parseFloat(data.sales_cost),
          average_retention_months: parseInt(data.average_retention_months),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketing-costs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Custos atualizados com sucesso!");
      setEditingId(null);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar custos");
    },
  });

  const deleteCostMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("marketing_costs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketing-costs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Custos removidos com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao remover custos");
    },
  });

  const resetForm = () => {
    setFormData({
      period_start: "",
      period_end: "",
      marketing_cost: "",
      sales_cost: "",
      average_retention_months: "12",
    });
  };

  const handleEdit = (cost: MarketingCost) => {
    setEditingId(cost.id);
    setFormData({
      period_start: cost.period_start,
      period_end: cost.period_end,
      marketing_cost: cost.marketing_cost.toString(),
      sales_cost: cost.sales_cost.toString(),
      average_retention_months: cost.average_retention_months.toString(),
    });
  };

  const handleSave = () => {
    if (editingId) {
      updateCostMutation.mutate({ id: editingId, data: formData });
    } else {
      createCostMutation.mutate(formData);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    resetForm();
  };

  const totalCost = (marketing: number, sales: number) => marketing + sales;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Custos de Marketing e Vendas
        </CardTitle>
        <CardDescription>
          Configure os custos por período para calcular CAC, LTV e Payback
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Botão Adicionar */}
        {!isAdding && !editingId && (
          <Button onClick={() => setIsAdding(true)} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Período de Custos
          </Button>
        )}

        {/* Formulário */}
        {(isAdding || editingId) && (
          <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="period_start">Data Início</Label>
                <Input
                  id="period_start"
                  type="date"
                  value={formData.period_start}
                  onChange={(e) => setFormData({ ...formData, period_start: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="period_end">Data Fim</Label>
                <Input
                  id="period_end"
                  type="date"
                  value={formData.period_end}
                  onChange={(e) => setFormData({ ...formData, period_end: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="marketing_cost">Custo de Marketing (R$)</Label>
                <Input
                  id="marketing_cost"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.marketing_cost}
                  onChange={(e) => setFormData({ ...formData, marketing_cost: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sales_cost">Custo de Vendas (R$)</Label>
                <Input
                  id="sales_cost"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.sales_cost}
                  onChange={(e) => setFormData({ ...formData, sales_cost: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="average_retention_months">Retenção Média (meses)</Label>
              <Input
                id="average_retention_months"
                type="number"
                placeholder="12"
                value={formData.average_retention_months}
                onChange={(e) => setFormData({ ...formData, average_retention_months: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Tempo médio que um cliente permanece ativo (usado para calcular LTV)
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={createCostMutation.isPending || updateCostMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Lista de Custos */}
        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-4">Carregando...</p>
        ) : costs && costs.length > 0 ? (
          <div className="space-y-3">
            {costs.map((cost) => (
              <div
                key={cost.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-semibold text-foreground">
                    {format(new Date(cost.period_start), "dd/MM/yyyy", { locale: ptBR })} -{" "}
                    {format(new Date(cost.period_end), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Marketing</p>
                      <p className="font-semibold">R$ {cost.marketing_cost.toLocaleString("pt-BR")}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Vendas</p>
                      <p className="font-semibold">R$ {cost.sales_cost.toLocaleString("pt-BR")}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total</p>
                      <p className="font-semibold text-primary">
                        R$ {totalCost(cost.marketing_cost, cost.sales_cost).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Retenção</p>
                      <p className="font-semibold">{cost.average_retention_months} meses</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(cost)}
                    disabled={editingId === cost.id}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteCostMutation.mutate(cost.id)}
                    disabled={deleteCostMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum período de custos configurado ainda.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
