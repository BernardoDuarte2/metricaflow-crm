import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database, Loader2, Users } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const DemoDataSettings = () => {
  const [loading, setLoading] = useState(false);
  const [createUsers, setCreateUsers] = useState(true);
  const [userCount, setUserCount] = useState(5);
  const { toast } = useToast();

  const handleGenerateDemoData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('seed-demo-data', {
        body: {
          createUsers,
          userCount: createUsers ? userCount : 0
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Sucesso!",
          description: createUsers 
            ? `${data.stats.usersCreated} usuários criados! Total: ${data.stats.leads} leads, ${data.stats.leadValues} valores, ${data.stats.meetings} reuniões`
            : `Gerados: ${data.stats.leads} leads, ${data.stats.leadValues} valores, ${data.stats.observations} observações`,
        });
      } else {
        throw new Error(data.error || 'Erro ao gerar dados');
      }
    } catch (error: any) {
      console.error('Error generating demo data:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível gerar os dados de demonstração",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Dados de Demonstração
        </CardTitle>
        <CardDescription>
          Popule o sistema com dados fictícios simulando uma equipe de vendas completa
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="create-users" className="text-base">
                Criar usuários fictícios
              </Label>
              <p className="text-sm text-muted-foreground">
                Adiciona uma equipe de vendas completa com diferentes níveis de performance
              </p>
            </div>
            <Switch
              id="create-users"
              checked={createUsers}
              onCheckedChange={setCreateUsers}
            />
          </div>

          {createUsers && (
            <div className="space-y-2 pl-4 border-l-2 border-primary/20">
              <Label htmlFor="user-count">
                Quantidade de usuários (1-15)
              </Label>
              <Input
                id="user-count"
                type="number"
                min={1}
                max={15}
                value={userCount}
                onChange={(e) => setUserCount(Math.min(15, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-32"
              />
              <p className="text-xs text-muted-foreground">
                Serão criados vendedores e gestores com diferentes performances
              </p>
            </div>
          )}
        </div>

        <Alert>
          <Database className="h-4 w-4" />
          <AlertDescription>
            Esta ação irá criar dados de demonstração simulando <strong>12 meses de uso intensivo</strong> do sistema:
            <ul className="list-disc list-inside mt-2 space-y-1">
              {createUsers && (
                <li className="font-medium text-primary">
                  <Users className="inline h-3 w-3 mr-1" />
                  {userCount} usuários fictícios com diferentes performances
                </li>
              )}
              <li><strong>300 leads</strong> distribuídos por performance</li>
              <li><strong>600+ valores</strong> de vendas (únicos e recorrentes)</li>
              <li><strong>1500+ observações</strong> com diferentes tipos de notas</li>
              <li><strong>250 reuniões</strong> agendadas, realizadas e canceladas</li>
              <li><strong>400 tarefas</strong> individuais e em grupo</li>
              <li><strong>200 lembretes</strong> concluídos e pendentes</li>
            </ul>
          </AlertDescription>
        </Alert>

        <Button
          onClick={handleGenerateDemoData}
          disabled={loading}
          size="lg"
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando dados...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Gerar Dados de Demonstração
            </>
          )}
        </Button>

        <Alert variant="default" className="bg-muted">
          <AlertDescription className="text-xs">
            <strong>Nota:</strong> Esta funcionalidade é ideal para ambientes de teste e demonstração. 
            Os dados são fictícios e não representam informações reais. A senha padrão dos usuários criados é <code className="bg-background px-1 py-0.5 rounded">Demo@123456</code>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default DemoDataSettings;
