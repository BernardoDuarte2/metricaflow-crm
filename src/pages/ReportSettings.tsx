import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

const ReportSettings = () => {
  const queryClient = useQueryClient();
  const [sending, setSending] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .select("*, companies(*)")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ["report-settings", profile?.company_id],
    queryFn: async () => {
      if (!profile?.company_id) return null;

      const { data, error } = await supabase
        .from("report_settings")
        .select("*")
        .eq("company_id", profile.company_id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.company_id,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: any) => {
      if (!profile?.company_id) throw new Error("Company ID not found");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const payload = {
        company_id: profile.company_id,
        updated_by: user.id,
        ...updates,
      };

      const { error } = await supabase
        .from("report_settings")
        .upsert(payload, { onConflict: "company_id" });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report-settings"] });
      toast.success("Configurações atualizadas!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });

  const sendTestReport = async () => {
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke("send-daily-report");
      if (error) throw error;
      toast.success("Relatório de teste enviado! Verifique seu email.");
    } catch (error: any) {
      toast.error(`Erro ao enviar teste: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Configurações de Relatórios</h1>
        <p className="text-muted-foreground">
          Configure os relatórios automáticos diários e semanais com análise de IA
        </p>
      </div>

      <div className="space-y-6">
        {/* Relatórios Diários */}
        <Card>
          <CardHeader>
            <CardTitle>Relatórios Diários</CardTitle>
            <CardDescription>
              Enviados automaticamente todos os dias úteis para cada vendedor e gestores
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="daily-enabled">Habilitar relatórios diários</Label>
                <p className="text-sm text-muted-foreground">
                  Vendedores recebem seu desempenho individual, gestores recebem resumo da equipe
                </p>
              </div>
              <Switch
                id="daily-enabled"
                checked={settings?.daily_reports_enabled ?? true}
                onCheckedChange={(checked) =>
                  updateMutation.mutate({ daily_reports_enabled: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="daily-time">Horário de envio</Label>
              <Input
                id="daily-time"
                type="time"
                value={settings?.daily_report_time || "19:00:00"}
                onChange={(e) =>
                  updateMutation.mutate({ daily_report_time: e.target.value })
                }
              />
              <p className="text-sm text-muted-foreground">
                Sugerimos 19h para que o vendedor revise o dia antes de finalizar
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Relatórios Semanais */}
        <Card>
          <CardHeader>
            <CardTitle>📅 Relatórios Semanais</CardTitle>
            <CardDescription>
              Análise completa da semana com insights estratégicos da IA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weekly-enabled">Habilitar relatórios semanais</Label>
                <p className="text-sm text-muted-foreground">
                  Inclui análise SWOT, ranking da equipe e comparativo com semana anterior
                </p>
              </div>
              <Switch
                id="weekly-enabled"
                checked={settings?.weekly_reports_enabled ?? true}
                onCheckedChange={(checked) =>
                  updateMutation.mutate({ weekly_reports_enabled: checked })
                }
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="weekly-day">Dia da semana</Label>
                <Select
                  value={String(settings?.weekly_report_day ?? 1)}
                  onValueChange={(value) =>
                    updateMutation.mutate({ weekly_report_day: parseInt(value) })
                  }
                >
                  <SelectTrigger id="weekly-day">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Segunda-feira</SelectItem>
                    <SelectItem value="2">Terça-feira</SelectItem>
                    <SelectItem value="3">Quarta-feira</SelectItem>
                    <SelectItem value="4">Quinta-feira</SelectItem>
                    <SelectItem value="5">Sexta-feira</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weekly-time">Horário de envio</Label>
                <Input
                  id="weekly-time"
                  type="time"
                  value={settings?.weekly_report_time || "09:00:00"}
                  onChange={(e) =>
                    updateMutation.mutate({ weekly_report_time: e.target.value })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações da IA */}
        <Card>
          <CardHeader>
            <CardTitle>🤖 Análise com IA</CardTitle>
            <CardDescription>
              Configure o nível de detalhe das análises geradas pela inteligência artificial
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ai-level">Nível de análise</Label>
              <Select
                value={settings?.ai_analysis_level || "detailed"}
                onValueChange={(value) =>
                  updateMutation.mutate({ ai_analysis_level: value })
                }
              >
                <SelectTrigger id="ai-level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Básica - Apenas métricas principais</SelectItem>
                  <SelectItem value="detailed">Detalhada - Com insights e sugestões</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="include-swot">Incluir análise SWOT</Label>
                <p className="text-sm text-muted-foreground">
                  Forças, Fraquezas, Oportunidades e Ameaças da equipe
                </p>
              </div>
              <Switch
                id="include-swot"
                checked={settings?.include_swot ?? true}
                onCheckedChange={(checked) =>
                  updateMutation.mutate({ include_swot: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="include-predictions">Incluir previsões</Label>
                <p className="text-sm text-muted-foreground">
                  IA prevê tendências baseada no histórico
                </p>
              </div>
              <Switch
                id="include-predictions"
                checked={settings?.include_predictions ?? true}
                onCheckedChange={(checked) =>
                  updateMutation.mutate({ include_predictions: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Testar Envio */}
        <Card>
          <CardHeader>
            <CardTitle>🧪 Enviar Relatório de Teste</CardTitle>
            <CardDescription>
              Envie um relatório de teste agora para verificar como ficará
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={sendTestReport}
              disabled={sending}
              className="w-full"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Relatório de Teste Agora
                </>
              )}
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              O relatório será enviado para o email dos gestores da empresa
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportSettings;
