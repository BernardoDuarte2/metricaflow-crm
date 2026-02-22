import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";

const DEFAULT_SUGGESTIONS = [
  "Verificar leads em aberto",
  "Atualizar status dos leads",
  "Conferir cartão ponto",
  "Focar em vendas em aberto",
  "Fazer follow-up com clientes",
  "Atualizar planilha de vendas",
];

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: any;
}

export function TaskDialog({ open, onOpenChange, task }: TaskDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignmentType, setAssignmentType] = useState("individual");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [newSuggestion, setNewSuggestion] = useState("");
  const [showAddSuggestion, setShowAddSuggestion] = useState(false);

  const { data: companyUsers } = useQuery({
    queryKey: ["company-users"],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", session.session?.user.id!)
        .single();

      const { data, error } = await supabase
        .from("profiles")
        .select("id, name")
        .eq("company_id", profile?.company_id!)
        .eq("active", true);

      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const { data: customSuggestions } = useQuery({
    queryKey: ["task-suggestions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_suggestions")
        .select("id, title")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: open,
  });

  const addSuggestionMutation = useMutation({
    mutationFn: async (suggestionTitle: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", session.user.id)
        .single();
      if (!profile) throw new Error("Perfil não encontrado");

      const { error } = await supabase.from("task_suggestions").insert({
        title: suggestionTitle.trim(),
        company_id: profile.company_id,
        created_by: session.user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-suggestions"] });
      setNewSuggestion("");
      setShowAddSuggestion(false);
      toast({ title: "Sugestão adicionada!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao adicionar sugestão", description: error.message, variant: "destructive" });
    },
  });

  const deleteSuggestionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("task_suggestions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-suggestions"] });
    },
  });

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setAssignmentType(task.assignment_type || "individual");
      setAssignedTo(task.assigned_to || "");
      setDueDate(task.due_date ? task.due_date.split("T")[0] : "");
    } else {
      setTitle("");
      setDescription("");
      setAssignmentType("individual");
      setAssignedTo("");
      setDueDate("");
    }
    setShowAddSuggestion(false);
    setNewSuggestion("");
  }, [task, open]);

  const createTaskMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user.id) throw new Error("Usuário não autenticado");

      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", session.user.id)
        .single();

      if (!profile?.company_id) throw new Error("Perfil não encontrado");

      const finalAssignedTo = assignmentType === "individual" ? assignedTo : session.user.id;

      if (assignmentType === "individual" && !assignedTo) {
        throw new Error("Selecione um vendedor");
      }

      const taskPayload = {
        title: title.trim(),
        description: description.trim() || null,
        assigned_to: finalAssignedTo,
        assignment_type: assignmentType,
        company_id: profile.company_id,
        created_by: session.user.id,
        due_date: dueDate || null,
        status: "aberta",
      };

      const { error } = await supabase.from("tasks").insert(taskPayload);
      if (error) throw error;

      // Fetch the just-created task (AFTER trigger may prevent .select() from returning data)
      let newTaskId: string | null = null;
      if (assignmentType === "todos") {
        const { data: recentTask } = await supabase
          .from("tasks")
          .select("id")
          .eq("company_id", profile.company_id)
          .eq("created_by", session.user.id)
          .eq("title", title.trim())
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        newTaskId = recentTask?.id ?? null;
      }

      if (assignmentType === "todos" && newTaskId) {
        const { data: users } = await supabase
          .from("profiles")
          .select("id")
          .eq("company_id", profile.company_id)
          .eq("active", true);

        if (users && users.length > 0) {
          await supabase.from("task_assignments").insert(
            users.map((u) => ({
              task_id: newTaskId,
              user_id: u.id,
              company_id: profile.company_id,
              status: "pendente",
            }))
          );
          await supabase
            .from("tasks")
            .update({ total_assigned: users.length })
            .eq("id", newTaskId);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["pending-task-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["created-tasks-progress"] });
      toast({ title: "Tarefa criada com sucesso!" });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({ title: "Erro ao criar tarefa", description: error.message, variant: "destructive" });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("tasks")
        .update({
          title: title.trim(),
          description: description.trim() || null,
          due_date: dueDate || null,
        })
        .eq("id", task.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["pending-task-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["created-tasks-progress"] });
      toast({ title: "Tarefa atualizada!" });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({ title: "Título é obrigatório", variant: "destructive" });
      return;
    }
    if (task) {
      updateTaskMutation.mutate();
    } else {
      createTaskMutation.mutate();
    }
  };

  const handleAddSuggestion = () => {
    if (!newSuggestion.trim()) return;
    addSuggestionMutation.mutate(newSuggestion);
  };

  const allSuggestions = [
    ...DEFAULT_SUGGESTIONS,
    ...(customSuggestions?.map((s) => s.title) || []),
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{task ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
          <DialogDescription>
            {task ? "Edite os detalhes da tarefa." : "Crie uma nova tarefa para a equipe."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!task && (
            <div className="space-y-2">
              <Label>Sugestões rápidas</Label>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_SUGGESTIONS.map((suggestion) => (
                  <Badge
                    key={suggestion}
                    variant={title === suggestion ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/20 transition-colors"
                    onClick={() => setTitle(suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
                {customSuggestions?.map((suggestion) => (
                  <Badge
                    key={suggestion.id}
                    variant={title === suggestion.title ? "default" : "secondary"}
                    className="cursor-pointer hover:bg-primary/20 transition-colors group gap-1"
                    onClick={() => setTitle(suggestion.title)}
                  >
                    {suggestion.title}
                    <X
                      className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSuggestionMutation.mutate(suggestion.id);
                      }}
                    />
                  </Badge>
                ))}
                {!showAddSuggestion && (
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/20 transition-colors border-dashed"
                    onClick={() => setShowAddSuggestion(true)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Adicionar
                  </Badge>
                )}
              </div>
              {showAddSuggestion && (
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newSuggestion}
                    onChange={(e) => setNewSuggestion(e.target.value)}
                    placeholder="Nova sugestão..."
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSuggestion();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddSuggestion}
                    disabled={addSuggestionMutation.isPending || !newSuggestion.trim()}
                  >
                    Salvar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => { setShowAddSuggestion(false); setNewSuggestion(""); }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título da tarefa..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes da tarefa..."
              rows={2}
            />
          </div>

          {!task && (
            <>
              <div className="space-y-2">
                <Label htmlFor="assignmentType">Atribuir para *</Label>
                <select
                  id="assignmentType"
                  value={assignmentType}
                  onChange={(e) => setAssignmentType(e.target.value)}
                  className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="individual">Vendedor específico</option>
                  <option value="todos">Todos os vendedores</option>
                </select>
              </div>

              {assignmentType === "individual" && (
                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Vendedor *</Label>
                  <select
                    id="assignedTo"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="">Selecione...</option>
                    {companyUsers?.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="due_date">Prazo (opcional)</Label>
            <Input
              id="due_date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createTaskMutation.isPending || updateTaskMutation.isPending}>
              {task ? "Salvar" : "Criar Tarefa"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}