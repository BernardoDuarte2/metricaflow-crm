import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Target,
  Brain,
  MessageSquare,
  Lightbulb,
  AlertTriangle,
  Clock,
  ArrowRight,
  XCircle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Copy,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

interface StageGuidePanelProps {
  stageId: string;
  stageName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface StageGuide {
  objective: string;
  mindset: string | null;
  what_to_say: string | null;
  mental_triggers: string[] | null;
  common_mistakes: string[] | null;
  ideal_time_days: number | null;
  how_to_advance: string | null;
  how_not_to_advance: string | null;
}

interface StageScript {
  id: string;
  title: string;
  situation: string | null;
  script_content: string;
  tags: string[] | null;
}

function parseJsonArray(json: Json | null): string[] | null {
  if (!json) return null;
  if (Array.isArray(json)) return json as string[];
  return null;
}

export function StageGuidePanel({ stageId, stageName, isOpen, onClose }: StageGuidePanelProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["objective", "triggers"]);
  const [expandedScript, setExpandedScript] = useState<string | null>(null);

  const { data: profile } = useQuery({
    queryKey: ["current-profile-kanban"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .single();
      return data;
    },
  });

  const { data: guide, isLoading: guideLoading } = useQuery({
    queryKey: ["stage-guide-panel", stageId, profile?.company_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pipeline_stage_guides")
        .select("*")
        .or(`company_id.eq.${profile?.company_id},is_default.eq.true`)
        .eq("stage_id", stageId)
        .order("is_default", { ascending: true }); // Company-specific first

      if (error) throw error;

      // Return company-specific guide if exists, otherwise default
      const companyGuide = data?.find((g: any) => g.company_id === profile?.company_id);
      const defaultGuide = data?.find((g: any) => g.is_default);
      const selectedGuide = companyGuide || defaultGuide;

      if (!selectedGuide) return null;

      return {
        ...selectedGuide,
        mental_triggers: parseJsonArray(selectedGuide.mental_triggers),
        common_mistakes: parseJsonArray(selectedGuide.common_mistakes),
      } as StageGuide;
    },
    enabled: !!profile?.company_id && isOpen,
  });

  const { data: scripts, isLoading: scriptsLoading } = useQuery({
    queryKey: ["stage-scripts-panel", stageId, profile?.company_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stage_scripts")
        .select("*")
        .or(`company_id.eq.${profile?.company_id},is_default.eq.true`)
        .eq("stage_id", stageId)
        .eq("is_active", true)
        .order("order_index");

      if (error) throw error;

      return data?.map((s: any) => ({
        ...s,
        tags: parseJsonArray(s.tags),
      })) as StageScript[];
    },
    enabled: !!profile?.company_id && isOpen,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Script copiado!");
  };

  const isLoading = guideLoading || scriptsLoading;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:w-[450px] sm:max-w-md p-0">
        <SheetHeader className="p-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span>Manual: {stageName}</span>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="p-4 space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : !guide ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum guia configurado para esta etapa</p>
              </div>
            ) : (
              <>
                {/* Objetivo */}
                <Collapsible
                  open={expandedSections.includes("objective")}
                  onOpenChange={() => toggleSection("objective")}
                >
                  <Card className="premium-card overflow-hidden">
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Target className="h-4 w-4 text-primary" />
                            Objetivo da Etapa
                          </CardTitle>
                          {expandedSections.includes("objective") ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0 pb-3">
                        <p className="text-sm">{guide.objective}</p>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>

                {/* Mentalidade */}
                {guide.mindset && (
                  <Collapsible
                    open={expandedSections.includes("mindset")}
                    onOpenChange={() => toggleSection("mindset")}
                  >
                    <Card className="premium-card overflow-hidden">
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Brain className="h-4 w-4 text-accent" />
                              Mentalidade
                            </CardTitle>
                            {expandedSections.includes("mindset") ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="pt-0 pb-3">
                          <p className="text-sm">{guide.mindset}</p>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                )}

                {/* O que Falar */}
                {guide.what_to_say && (
                  <Collapsible
                    open={expandedSections.includes("what_to_say")}
                    onOpenChange={() => toggleSection("what_to_say")}
                  >
                    <Card className="premium-card overflow-hidden">
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <MessageSquare className="h-4 w-4 text-blue-500" />
                              O que Falar
                            </CardTitle>
                            {expandedSections.includes("what_to_say") ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="pt-0 pb-3">
                          <p className="text-sm whitespace-pre-wrap">{guide.what_to_say}</p>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                )}

                {/* Gatilhos Mentais */}
                {guide.mental_triggers && guide.mental_triggers.length > 0 && (
                  <Collapsible
                    open={expandedSections.includes("triggers")}
                    onOpenChange={() => toggleSection("triggers")}
                  >
                    <Card className="premium-card overflow-hidden">
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Lightbulb className="h-4 w-4 text-yellow-500" />
                              Gatilhos Mentais
                            </CardTitle>
                            {expandedSections.includes("triggers") ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="pt-0 pb-3">
                          <div className="flex flex-wrap gap-2">
                            {guide.mental_triggers.map((trigger, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {trigger}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                )}

                {/* Erros Comuns */}
                {guide.common_mistakes && guide.common_mistakes.length > 0 && (
                  <Collapsible
                    open={expandedSections.includes("mistakes")}
                    onOpenChange={() => toggleSection("mistakes")}
                  >
                    <Card className="premium-card overflow-hidden border-destructive/30">
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-destructive" />
                              Evite Estes Erros
                            </CardTitle>
                            {expandedSections.includes("mistakes") ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="pt-0 pb-3">
                          <ul className="space-y-1">
                            {guide.common_mistakes.map((mistake, index) => (
                              <li key={index} className="text-sm flex items-start gap-2">
                                <XCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                                <span>{mistake}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                )}

                {/* Tempo Ideal */}
                {guide.ideal_time_days && guide.ideal_time_days > 0 && (
                  <Card className="premium-card">
                    <CardContent className="py-3 flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Tempo ideal: <strong>{guide.ideal_time_days} dias</strong>
                      </span>
                    </CardContent>
                  </Card>
                )}

                {/* Como Avançar */}
                {guide.how_to_advance && (
                  <Card className="premium-card border-green-500/30 bg-green-500/5">
                    <CardContent className="py-3">
                      <div className="flex items-start gap-3">
                        <ArrowRight className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-green-600 mb-1">Para Avançar</p>
                          <p className="text-sm">{guide.how_to_advance}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Como NÃO Avançar */}
                {guide.how_not_to_advance && (
                  <Card className="premium-card border-orange-500/30 bg-orange-500/5">
                    <CardContent className="py-3">
                      <div className="flex items-start gap-3">
                        <XCircle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-orange-600 mb-1">Não Avançar Se...</p>
                          <p className="text-sm">{guide.how_not_to_advance}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Scripts Prontos */}
                {scripts && scripts.length > 0 && (
                  <div className="pt-2">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      Scripts Prontos
                    </h3>
                    <div className="space-y-2">
                      {scripts.map((script) => (
                        <Collapsible
                          key={script.id}
                          open={expandedScript === script.id}
                          onOpenChange={(open) => setExpandedScript(open ? script.id : null)}
                        >
                          <Card className="premium-card overflow-hidden">
                            <CollapsibleTrigger asChild>
                              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-2 px-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <span className="text-sm font-medium truncate">{script.title}</span>
                                    {script.situation && (
                                      <Badge variant="outline" className="text-xs flex-shrink-0">
                                        {script.situation}
                                      </Badge>
                                    )}
                                  </div>
                                  {expandedScript === script.id ? (
                                    <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                  )}
                                </div>
                              </CardHeader>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <CardContent className="pt-0 pb-3 px-3">
                                <div className="relative">
                                  <pre className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-lg font-sans">
                                    {script.script_content}
                                  </pre>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="absolute top-2 right-2 h-7 w-7"
                                    onClick={() => copyToClipboard(script.script_content)}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                                {script.tags && script.tags.length > 0 && (
                                  <div className="flex gap-1 mt-2">
                                    {script.tags.map((tag) => (
                                      <Badge key={tag} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </CardContent>
                            </CollapsibleContent>
                          </Card>
                        </Collapsible>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
