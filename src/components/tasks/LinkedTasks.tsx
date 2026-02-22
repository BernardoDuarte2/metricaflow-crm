import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskCard } from "./TaskCard";

interface LinkedTasksProps {
  leadId: string;
}

export function LinkedTasks({ leadId }: LinkedTasksProps) {
  const { data: userRole } = useQuery({
    queryKey: ["user-role"],
    queryFn: async () => {
      const { data } = await supabase.rpc("get_user_role");
      return data;
    },
  });

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["lead-tasks", leadId],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id;

      const { data, error } = await supabase
        .from("tasks")
        .select(`
          *,
          assigned_profile:profiles!tasks_assigned_to_fkey(id, name),
          creator_profile:profiles!tasks_created_by_fkey(id, name),
          lead:leads(id, name)
        `)
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (userRole === "vendedor" && currentUserId) {
        const { data: myAssignments } = await supabase
          .from("task_assignments")
          .select("task_id")
          .eq("user_id", currentUserId);

        const myTaskIds = myAssignments?.map((a) => a.task_id) || [];
        return data?.filter((task) => myTaskIds.includes(task.id));
      }

      return data;
    },
  });

  const isGestor = userRole === "gestor" || userRole === "gestor_owner";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tarefas Vinculadas</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">
            Carregando tarefas...
          </p>
        ) : tasks && tasks.length > 0 ? (
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={() => {}}
                isGestor={isGestor}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Nenhuma tarefa vinculada a este lead
          </p>
        )}
      </CardContent>
    </Card>
  );
}
