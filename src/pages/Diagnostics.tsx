import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Loader2, Send } from "lucide-react";
// No header import needed

export default function Diagnostics() {
  const [testEmail, setTestEmail] = useState("");
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .select("*, user_roles(role)")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const userRole = Array.isArray(profile?.user_roles) && profile.user_roles.length > 0 
    ? profile.user_roles[0].role 
    : null;
  const isOwner = userRole === "gestor_owner";

  const handleTestResend = async () => {
    if (!testEmail) {
      toast({
        title: "Email necessário",
        description: "Informe um email para teste",
        variant: "destructive",
      });
      return;
    }

    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke("test-resend", {
        body: { toEmail: testEmail },
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: "❌ Erro na configuração",
          description: data.details || data.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "✅ Teste bem-sucedido!",
          description: `Email enviado para ${testEmail}. Verifique sua caixa de entrada.`,
        });
      }
    } catch (error: any) {
      console.error("Test error:", error);
      toast({
        title: "Erro ao testar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>
              Apenas gestores proprietários podem acessar o diagnóstico do sistema.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Diagnóstico do Sistema</h1>
            <p className="text-muted-foreground">
              Verifique o status das configurações críticas do sistema
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Configuração de Email (Resend)
              </CardTitle>
              <CardDescription>
                Teste o envio de emails e verifique a configuração do Resend
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-email">Email para teste</Label>
                <div className="flex gap-2">
                  <Input
                    id="test-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                  <Button onClick={handleTestResend} disabled={testing}>
                    {testing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Testar
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <h4 className="font-medium text-sm">Checklist de Configuração:</h4>
                <div className="space-y-2">
                  <ConfigItem
                    label="RESEND_API_KEY configurado"
                    status="unknown"
                    description="Chave de API do Resend"
                  />
                  <ConfigItem
                    label="RESEND_FROM configurado"
                    status="unknown"
                    description="Email de envio (ex: 'CRM <noreply@seudominio.com>')"
                  />
                  <ConfigItem
                    label="Domínio verificado no Resend"
                    status="unknown"
                    description="Verifique em https://resend.com/domains"
                  />
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg text-sm space-y-2">
                <h4 className="font-medium">📚 Como configurar:</h4>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Crie uma conta em <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">resend.com</a></li>
                  <li>Verifique seu domínio em <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">resend.com/domains</a></li>
                  <li>Gere uma API key em <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">resend.com/api-keys</a></li>
                  <li>Configure os secrets RESEND_API_KEY e RESEND_FROM no Lovable Cloud</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Edge Functions</CardTitle>
              <CardDescription>
                Status das funções serverless
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <ConfigItem
                label="send-invite"
                status="unknown"
                description="Envio de convites para novos usuários"
              />
              <ConfigItem
                label="send-password-reset"
                status="unknown"
                description="Envio de emails de recuperação de senha"
              />
              <ConfigItem
                label="accept-invite"
                status="unknown"
                description="Processamento de aceitação de convites"
              />
              <ConfigItem
                label="test-resend"
                status="unknown"
                description="Teste de configuração do Resend"
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

interface ConfigItemProps {
  label: string;
  status: "success" | "error" | "unknown";
  description: string;
}

function ConfigItem({ label, status, description }: ConfigItemProps) {
  return (
    <div className="flex items-start gap-3">
      {status === "success" && <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />}
      {status === "error" && <XCircle className="h-5 w-5 text-destructive mt-0.5" />}
      {status === "unknown" && <div className="h-5 w-5 rounded-full bg-muted mt-0.5" />}
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
