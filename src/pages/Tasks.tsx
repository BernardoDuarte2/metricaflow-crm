import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import { TaskStats } from "@/components/tasks/TaskStats";
import { TaskKanban } from "@/components/tasks/TaskKanban";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Tasks = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [search, setSearch] = useState("");

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const { data: userRole } = useQuery({
    queryKey: ["user-role"],
    queryFn: async () => {
      const { data } = await supabase.rpc("get_user_role");
      return data;
    },
    enabled: !!session,
  });

  const isGestor = userRole === "gestor" || userRole === "gestor_owner";

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select(`
          *,
          assigned_profile:profiles!tasks_assigned_to_fkey(id, name),
          creator_profile:profiles!tasks_created_by_fkey(id, name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!session,
  });

  const filteredTasks = tasks?.filter((task) => {
    if (!search) return true;
    return (
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description?.toLowerCase().includes(search.toLowerCase())
    );
  }) || [];

  const handleEditTask = (task: any) => {
    setSelectedTask(task);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedTask(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tarefas</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as tarefas da equipe
          </p>
        </div>
        {isGestor && (
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Tarefa
          </Button>
        )}
      </div>

      <TaskStats tasks={filteredTasks} />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar tarefas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-4 w-32" />
              {[1, 2].map((j) => (
                <Skeleton key={j} className="h-24 rounded-lg" />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <TaskKanban tasks={filteredTasks} onEditTask={handleEditTask} isGestor={isGestor} />
      )}

      <TaskDialog open={isDialogOpen} onOpenChange={handleCloseDialog} task={selectedTask} />
    </div>
  );
};

export default Tasks;
