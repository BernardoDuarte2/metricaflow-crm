import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Search,
  Building2,
  Phone,
  MapPin,
  Star,
  Send,
  Loader2,
  CheckCircle2,
  Sparkles,
  Globe,
  Users,
  History,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ProspectingCard } from "@/components/prospecting/ProspectingCard";
import { ProspectingStats } from "@/components/prospecting/ProspectingStats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Webhook URLs
const WEBHOOK_URL = import.meta.env.VITE_PROSPECTING_WEBHOOK_URL;
const HISTORY_WEBHOOK_URL = import.meta.env.VITE_HISTORY_WEBHOOK_URL;

// Interface para erro do n8n
interface N8nError {
  code?: number;
  message?: string;
}

// Interface para resposta do webhook
interface WebhookResult {
  nome: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  quantidade_avaliacoes?: number;
  site?: string;
}

interface WebhookResponse {
  ok: boolean;
  termo: string;
  count: number;
  results: WebhookResult[];
}

interface ProspectLead {
  id: string;
  nome: string;
  telefone?: string;
  cidade?: string;
  estado?: string;
  avaliacoes?: number;
  rating?: number;
  endereco?: string;
  website?: string;
  categoria?: string;
}

interface HistoryLead {
  id: number;
  Nome: string;
  Endereco: string | null;
  Cidade: string | null;
  Estado: string | null;
  Rating: string | null;
  Quantidade_de_avaliacoes: string;
  Site: string;
  Resumo: string;
  Telefone: string;
  chat_blocked: string | null;
  createdAt: string;
  updatedAt: string;
}

const Prospecting = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isProspecting, setIsProspecting] = useState(false);
  const [prospectingComplete, setProspectingComplete] = useState(false);
  const [leads, setLeads] = useState<ProspectLead[]>([]);
  const [activeTab, setActiveTab] = useState("nova");

  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Função para formatar número para WhatsApp
  const formatWhatsAppNumber = (phone: string) => {
    // Remove todos os caracteres não numéricos
    const cleaned = phone.replace(/\D/g, "");
    return cleaned;
  };

  // Função para abrir WhatsApp
  const openWhatsApp = (phone: string) => {
    const formattedNumber = formatWhatsAppNumber(phone);
    const whatsappUrl = `https://wa.me/${formattedNumber}`;
    window.open(whatsappUrl, "_blank");
  };

  // Query para buscar histórico de leads
  const {
    data: historyLeads,
    isLoading: isLoadingHistory,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ["history-leads"],
    queryFn: async () => {
      const response = await fetch(HISTORY_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}`);
      }
      const data = await response.json();

      console.log("Dados brutos recebidos:", data);

      let leadsArray: any[] = [];

      // Trata diferentes formatos de resposta do n8n
      if (Array.isArray(data)) {
        // Se for array direto
        leadsArray = data;
      } else if (data && typeof data === "object") {
        // Se for objeto único com possível array dentro
        if (data.data && Array.isArray(data.data)) {
          leadsArray = data.data;
        } else if (data.items && Array.isArray(data.items)) {
          leadsArray = data.items;
        } else {
          // Se for objeto único, transforma em array
          leadsArray = [data];
        }
      }

      console.log("Leads processados:", leadsArray.length, leadsArray);

      return leadsArray as HistoryLead[];
    },
    enabled: false, // Não busca automaticamente
  });

  // Buscar histórico quando mudar para a aba de histórico
  useEffect(() => {
    if (activeTab === "historico") {
      refetchHistory();
      setCurrentPage(1); // Reset para primeira página
    }
  }, [activeTab, refetchHistory]);

  // Reset página quando mudar items por página
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  // Calcular paginação
  const totalPages = Math.ceil((historyLeads?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLeads = historyLeads?.slice(startIndex, endIndex) || [];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      scrollToTop();
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      scrollToTop();
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
    scrollToTop();
  };

  // Mutation para enviar mensagem ao webhook
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      setIsProspecting(true);
      setProspectingComplete(false);

      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          termo_de_busca: message,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}`);
      }

      const raw = await response.json();

      // Verificar se é erro do n8n
      const errorCheck = raw as N8nError;
      if (
        !Array.isArray(raw) &&
        errorCheck?.code !== undefined &&
        errorCheck?.message
      ) {
        throw new Error(errorCheck.message || "Erro no workflow do n8n");
      }

      let results: any[] = [];

      if (Array.isArray(raw)) {
        // Verifica se é um array de leads (resposta direta) ou um array contendo o objeto wrapper
        const firstItem = raw[0];
        // Se o primeiro item tiver "results" ou "ok", assumimos que é o wrapper antigo
        if (firstItem && (firstItem.results || firstItem.ok !== undefined)) {
          const data = firstItem;
          if (data.ok === false)
            throw new Error("A busca não retornou resultados válidos");
          results = data.results || [];
        } else {
          // Caso contrário, é a lista direta de leads
          results = raw;
        }
      } else if (raw?.results) {
        // Objeto direto
        if (raw.ok === false)
          throw new Error("A busca não retornou resultados válidos");
        results = raw.results;
      }

      // Normaliza para o formato esperado pelo onSuccess
      return {
        ok: true,
        termo: message,
        count: results.length,
        results: results,
      } as WebhookResponse;
    },
    onSuccess: (data: WebhookResponse) => {
      // Mapear resultados do webhook para o formato ProspectLead
      if (data?.results && Array.isArray(data.results)) {
        const mappedLeads: ProspectLead[] = data.results.map(
          (result: any, index) => ({
            id: `lead-${Date.now()}-${index}`,
            nome: result.Nome || result.nome || "Sem nome",
            telefone: result.Telefone || result.telefone,
            cidade: result.Cidade || result.cidade,
            endereco: result.Endereco || result.endereco,
            avaliacoes: result.Avaliacoes || result.quantidade_avaliacoes || 0,
            website: result.Site || result.site,
          }),
        );
        setLeads(mappedLeads);

        toast.success("🎯 Prospecção finalizada!", {
          description: `${data.count} leads encontrados para "${data.termo}"`,
          duration: 5000,
        });
      } else {
        setLeads([]);
        toast.info("Nenhum lead encontrado", {
          description: "Tente um termo de busca diferente",
        });
      }
      setIsProspecting(false);
      setProspectingComplete(true);
    },
    onError: (error) => {
      setIsProspecting(false);
      toast.error("Erro na prospecção", {
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      toast.warning("Digite um termo de busca", {
        description: "Ex: Imobiliárias em São Paulo, Brasil",
      });
      return;
    }
    sendMessageMutation.mutate(searchTerm);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-[hsl(210_85%_65%)] shrink-0">
            <Search className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
              Prospecção Inteligente
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Busque e prospecte leads automaticamente com IA
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto">
          <TabsTrigger value="nova" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Nova Prospecção
          </TabsTrigger>
          <TabsTrigger value="historico" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        {/* Tab: Nova Prospecção */}
        <TabsContent value="nova" className="space-y-4 sm:space-y-6 mt-6">
          {/* Search Input Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="premium-card">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Nova Prospecção
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Digite o que deseja buscar. Ex: "Imobiliárias em São Paulo,
                  Brasil"
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                    <Input
                      placeholder="Digite o termo de busca..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 sm:pl-10 h-11 sm:h-12 text-sm sm:text-base"
                      disabled={isProspecting}
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isProspecting}
                    className="bg-gradient-to-r from-primary to-[hsl(210_85%_65%)] hover:opacity-90 text-white h-11 sm:h-12 px-4 sm:px-8 w-full sm:w-auto shadow-lg shadow-primary/20"
                  >
                    {isProspecting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                        <span className="hidden sm:inline">
                          Prospectando...
                        </span>
                        <span className="sm:hidden">Buscando...</span>
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="hidden sm:inline">
                          Iniciar Prospecção
                        </span>
                        <span className="sm:hidden">Prospectar</span>
                      </>
                    )}
                  </Button>
                </form>

                {/* Status da Prospecção */}
                {isProspecting && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-lg bg-primary/10 border border-primary/20"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="relative shrink-0">
                        <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 bg-primary rounded-full animate-pulse" />
                        <div className="absolute inset-0 h-2.5 w-2.5 sm:h-3 sm:w-3 bg-primary rounded-full animate-ping" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-primary text-sm sm:text-base">
                          Prospecção em andamento...
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          A IA está analisando e buscando leads
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {prospectingComplete && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-lg bg-green-500/10 border border-green-500/20"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-green-600 dark:text-green-400 text-sm sm:text-base">
                          Prospecção finalizada!
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {leads.length} leads encontrados
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ProspectingStats leads={leads} />
          </motion.div>

          {/* Leads Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                <span className="truncate">Leads Prospectados</span>
              </h2>
              <Badge
                variant="outline"
                className="px-2 sm:px-3 py-1 text-xs sm:text-sm shrink-0"
              >
                {leads.length} leads
              </Badge>
            </div>

            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {leads.map((lead, index) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <ProspectingCard lead={lead} />
                </motion.div>
              ))}
            </div>

            {leads.length === 0 && !isProspecting && (
              <Card className="premium-card">
                <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
                  <Search className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-muted-foreground text-center">
                    Nenhum lead prospectado ainda
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 text-center">
                    Digite um termo de busca acima para iniciar
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </TabsContent>

        {/* Tab: Histórico */}
        <TabsContent value="historico" className="space-y-4 sm:space-y-6 mt-6">
          {/* Leads Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold flex items-center gap-2">
                <History className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                <span className="truncate">Histórico de Leads</span>
              </h2>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Badge
                  variant="outline"
                  className="px-2 sm:px-3 py-1 text-xs sm:text-sm shrink-0"
                >
                  {historyLeads?.length || 0} leads
                </Badge>

                {historyLeads && historyLeads.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                      Por página:
                    </span>
                    <Select
                      value={itemsPerPage.toString()}
                      onValueChange={(value) => setItemsPerPage(Number(value))}
                    >
                      <SelectTrigger className="w-[70px] h-8 text-xs sm:text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {isLoadingHistory ? (
              <Card className="premium-card">
                <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
                  <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-3 sm:mb-4 animate-spin" />
                  <h3 className="text-base sm:text-lg font-medium text-muted-foreground text-center">
                    Carregando histórico...
                  </h3>
                </CardContent>
              </Card>
            ) : historyLeads && historyLeads.length > 0 ? (
              <>
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {paginatedLeads.map((lead, index) => (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.05 * index }}
                      className="h-full"
                    >
                      <Card className="premium-card hover:shadow-lg transition-shadow h-full flex flex-col">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base sm:text-lg flex items-start gap-2">
                            <Building2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{lead.Nome}</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 flex-1 flex flex-col">
                          <div className="space-y-3 flex-1">
                            {lead.Telefone && (
                              <div className="flex items-start gap-2 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                <span className="text-muted-foreground">
                                  {lead.Telefone}
                                </span>
                              </div>
                            )}

                            {lead.Endereco && (
                              <div className="flex items-start gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                <span className="text-muted-foreground line-clamp-2">
                                  {lead.Endereco}
                                </span>
                              </div>
                            )}

                            {lead.Cidade && (
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {lead.Cidade}
                                </Badge>
                              </div>
                            )}

                            {lead.Quantidade_de_avaliacoes && (
                              <div className="flex items-center gap-2 text-sm">
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                <span className="text-muted-foreground">
                                  {lead.Quantidade_de_avaliacoes} avaliações
                                </span>
                              </div>
                            )}

                            {lead.Site && (
                              <div className="flex items-start gap-2 text-sm">
                                <Globe className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                <a
                                  href={lead.Site}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline truncate"
                                >
                                  {lead.Site}
                                </a>
                              </div>
                            )}
                          </div>

                          <div className="pt-3 border-t mt-auto">
                            <Button
                              size="sm"
                              onClick={() =>
                                lead.Telefone && openWhatsApp(lead.Telefone)
                              }
                              disabled={!lead.Telefone}
                              className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:opacity-90 disabled:opacity-50"
                            >
                              <MessageCircle className="mr-2 h-4 w-4" />
                              {lead.Telefone ? "WhatsApp" : "Sem telefone"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Controles de Paginação */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Mostrando {startIndex + 1} a{" "}
                      {Math.min(endIndex, historyLeads.length)} de{" "}
                      {historyLeads.length} leads
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className="gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Anterior</span>
                      </Button>

                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            let pageNumber;
                            if (totalPages <= 5) {
                              pageNumber = i + 1;
                            } else if (currentPage <= 3) {
                              pageNumber = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNumber = totalPages - 4 + i;
                            } else {
                              pageNumber = currentPage - 2 + i;
                            }

                            return (
                              <Button
                                key={pageNumber}
                                variant={
                                  currentPage === pageNumber
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() => handlePageClick(pageNumber)}
                                className="w-8 h-8 p-0"
                              >
                                {pageNumber}
                              </Button>
                            );
                          },
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="gap-1"
                      >
                        <span className="hidden sm:inline">Próxima</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Card className="premium-card">
                <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
                  <History className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-muted-foreground text-center">
                    Nenhum lead no histórico
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 text-center">
                    Os leads prospectados aparecerão aqui
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Prospecting;
