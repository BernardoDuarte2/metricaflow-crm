import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, FileSpreadsheet, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ParsedLead {
  name: string;
  phone: string;
  email?: string;
  company?: string;
}

export default function BulkImport() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedLeads, setParsedLeads] = useState<ParsedLead[]>([]);
  const [importResult, setImportResult] = useState<any>(null);

  const parseCSV = (text: string): ParsedLead[] => {
    const lines = text.split("\n").filter((line) => line.trim());
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

    const nameIndex = headers.findIndex((h) => h.includes("nome") || h === "name");
    const phoneIndex = headers.findIndex((h) => h.includes("telefone") || h.includes("phone"));
    const emailIndex = headers.findIndex((h) => h.includes("email") || h === "e-mail");
    const companyIndex = headers.findIndex((h) => h.includes("empresa") || h === "company");

    if (nameIndex === -1 || phoneIndex === -1) {
      throw new Error("Arquivo deve conter colunas 'nome' e 'telefone'");
    }

    return lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim());
      return {
        name: values[nameIndex],
        phone: values[phoneIndex],
        email: emailIndex !== -1 ? values[emailIndex] : undefined,
        company: companyIndex !== -1 ? values[companyIndex] : undefined,
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setImportResult(null);

    // Preview do arquivo
    try {
      const text = await selectedFile.text();
      const leads = parseCSV(text);
      setParsedLeads(leads);
      toast.success(`${leads.length} leads encontrados no arquivo`);
    } catch (error: any) {
      toast.error(error.message);
      setFile(null);
    }
  };

  const importMutation = useMutation({
    mutationFn: async () => {
      if (!parsedLeads.length) throw new Error("Nenhum lead para importar");

      const { data, error } = await supabase.functions.invoke("bulk-import-leads", {
        body: {
          leads: parsedLeads,
          auto_prospect: false,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setImportResult(data);
      toast.success("Importação concluída!");
    },
    onError: (error: any) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Importação em Massa</h1>
        <p className="text-muted-foreground mt-2">
          Importe leads de uma planilha CSV
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Arquivo CSV
          </CardTitle>
          <CardDescription>
            Formato esperado: nome, telefone, email (opcional), empresa (opcional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="file">Selecionar Arquivo</Label>
            <Input
              id="file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={importMutation.isPending}
            />
            {parsedLeads.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                ✓ {parsedLeads.length} leads prontos para importar
              </p>
            )}
          </div>

          <Alert>
            <Upload className="h-4 w-4" />
            <AlertTitle>Exemplo de CSV</AlertTitle>
            <AlertDescription className="font-mono text-xs mt-2">
              nome,telefone,email,empresa<br />
              João Silva,11999999999,joao@email.com,Empresa X<br />
              Maria Santos,11988888888,maria@email.com,Empresa Y
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {importResult && (
        <div className="space-y-4 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Resultado da Importação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{importResult.results.success}</p>
                    <p className="text-sm text-muted-foreground">Importados</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <XCircle className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">{importResult.results.duplicates}</p>
                    <p className="text-sm text-muted-foreground">Duplicados</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <XCircle className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold">{importResult.results.errors}</p>
                    <p className="text-sm text-muted-foreground">Erros</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {importResult.results.duplicate_details?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-yellow-600">Leads Duplicados</CardTitle>
                <CardDescription>
                  Estes leads já estão cadastrados no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {importResult.results.duplicate_details.map((dup: any, idx: number) => (
                    <Alert key={idx} className="border-yellow-200 bg-yellow-50">
                      <AlertTitle className="text-sm font-semibold">
                        {dup.lead.name} ({dup.lead.phone})
                      </AlertTitle>
                      <AlertDescription className="text-sm">
                        Lead já vinculado ao vendedor: <span className="font-semibold">{dup.vendor_name}</span>
                        {dup.lead.email && ` • ${dup.lead.email}`}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <Button
          size="lg"
          onClick={() => importMutation.mutate()}
          disabled={!file || parsedLeads.length === 0 || importMutation.isPending}
        >
          {importMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Importando...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Iniciar Importação
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
