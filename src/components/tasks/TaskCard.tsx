import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CheckCircle2, Clock, Edit, Trash2, User, ChevronDown, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, isPast } from "date-fns";

interface TaskCardProps {
  task: any;
  onEdit: (task: any) => void;
  isGestor: boolean;
}

export function TaskCard({ task, onEdit, isGestor }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUserId(session?.user?.id || null);
    });
  }, []);

  const { data: assignments } = useQuery({
    queryKey: ["task-assignments", task.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_assignments")
        .select("*, user:profiles!task_assignments_user_id_fkey(id, name)")
        .eq("task_id", task.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!task.id,
  });

  const currentUserAssignment = assignments?.find((a) => a.user_id === currentUserId);
  const isCompleted = currentUserAssignment?.status === "concluida";
  const isOverdue = task.due_date && isPast(new Date(task.due_date)) && task.status !== "concluida";

  const completeAssignmentMutation = useMutation({
    mutationFn: async () => {
      if (!currentUserAssignment) throw new Error("Atribuição não encontrada");
      const { error } = await supabase
        .from("task_assignments")
        .update({ status: "concluida", completed_at: new Date().toISOString() })
        .eq("id", currentUserAssignment.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["pending-task-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["created-tasks-progress"] });
      toast({ title: "Tarefa concluída!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao concluir tarefa", description: error.message, variant: "destructive" });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("tasks").delete().eq("id", task.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["pending-task-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["created-tasks-progress"] });
      toast({ title: "Tarefa excluída!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao excluir tarefa", description: error.message, variant: "destructive" });
    },
  });

  const canComplete = isGestor || (currentUserAssignment?.status === "pendente");

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card className={`border-l-4 ${isOverdue ? "border-destructive/60" : isCompleted ? "border-muted opacity-60" : "border-primary/40"} transition-all`}>
        <CollapsibleTrigger asChild>
          <CardHeader className="p-3 cursor-pointer hover:bg-accent/50 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  {isGestor && task.assignment_type === "todos" ? (
                    <Badge variant="secondary" className="text-xs">
                      <Users className="h-3 w-3 mr-1" />
                      {task.total_completed || 0}/{task.total_assigned || 0}
                    </Badge>
                  ) : (
                    <Badge variant={isCompleted ? "default" : "secondary"} className="text-xs">
                      {isCompleted ? "Concluída" : "Pendente"}
                    </Badge>
                  )}
                  {isOverdue && <Badge variant="destructive" className="text-xs">Atrasada</Badge>}
                </div>
                <h4 className="font-medium text-sm leading-tight line-clamp-2">{task.title}</h4>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {task.due_date && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span className={isOverdue ? "text-destructive font-medium" : ""}>
                      {format(new Date(task.due_date), "dd/MM")}
                    </span>
                  </div>
                )}
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="p-3 pt-0 space-y-3 border-t">
            {task.description && <p className="text-xs text-muted-foreground">{task.description}</p>}

            <div className="space-y-1 text-xs">
              {task.assignment_type === "individual" && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>{task.assigned_profile?.name || "Não atribuída"}</span>
                </div>
              )}
              <span className="text-muted-foreground">Criado por: {task.creator_profile?.name || "Desconhecido"}</span>
            </div>

            {isGestor && task.assignment_type === "todos" && assignments && (
              <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">Progresso:</p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {assignments.map((a: any) => (
                    <div key={a.id} className="flex items-center justify-between text-xs">
                      <span>{a.user?.name || "Usuário"}</span>
                      {a.status === "concluida" ? (
                        <span className="text-primary flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          {a.completed_at && format(new Date(a.completed_at), "dd/MM HH:mm")}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Pendente</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-2 pt-1">
              {!isCompleted && canComplete && (
                <Button
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); completeAssignmentMutation.mutate(); }}
                  className="h-7 text-xs"
                  disabled={completeAssignmentMutation.isPending}
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Concluir
                </Button>
              )}
              {isGestor && (
                <div className="flex gap-1 ml-auto">
                  <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); onEdit(task); }} className="h-7 w-7">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); deleteTaskMutation.mutate(); }} className="h-7 w-7 text-destructive">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
