import { Bell, Users, LogOut, CheckCircle2, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import MeetingNotifications from "./MeetingNotifications";
import { useUserSession } from "@/hooks/useUserSession";

const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sessionData } = useUserSession();
  const session = sessionData?.session;
  const profile = sessionData?.profile;

  const { data: userRole } = useQuery({
    queryKey: ["user-role"],
    queryFn: async () => {
      const { data } = await supabase.rpc("get_user_role");
      return data;
    },
    enabled: !!session,
  });

  const isGestor = userRole === "gestor" || userRole === "gestor_owner";
  const isVendedor = userRole === "vendedor";

  const { data: userCount } = useQuery({
    queryKey: ["user-count", profile?.company_id],
    queryFn: async () => {
      if (!profile?.company_id) return 0;
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id")
        .eq("company_id", profile.company_id);
      const { data: owners } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "gestor_owner")
        .in("user_id", (profiles || []).map((p) => p.id));
      return (profiles?.length || 0) - (owners?.length || 0);
    },
    enabled: !!profile?.company_id,
  });

  // Vendedor: tarefas pendentes atribuídas a ele
  const { data: pendingAssignments } = useQuery({
    queryKey: ["pending-task-assignments", session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_assignments")
        .select("id, status, task:tasks(id, title, due_date, description)")
        .eq("user_id", session!.user.id)
        .eq("status", "pendente");
      if (error) throw error;
      return data;
    },
    enabled: !!session && isVendedor,
  });

  // Gestor: tarefas que criou com progresso
  const { data: createdTasksProgress } = useQuery({
    queryKey: ["created-tasks-progress", session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("id, title, due_date, total_assigned, total_completed, status")
        .eq("created_by", session!.user.id)
        .neq("status", "concluida")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!session && isGestor,
  });

  const { data: pendingMeetings } = useQuery({
    queryKey: ["pending-meetings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meetings")
        .select("*, lead:leads(name)")
        .eq("feedback_collected", false)
        .eq("status", "agendada")
        .lt("end_time", new Date(Date.now() - 60 * 60 * 1000).toISOString())
        .order("end_time", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!session,
  });

  const completeTaskMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase
        .from("task_assignments")
        .update({ status: "concluida", completed_at: new Date().toISOString() })
        .eq("id", assignmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-task-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["created-tasks-progress"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task-assignments"] });
      toast({ title: "Tarefa concluída!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logout realizado", description: "Você foi desconectado com sucesso." });
    navigate("/auth");
  };

  const taskCount = isVendedor
    ? (pendingAssignments?.length || 0)
    : (createdTasksProgress?.length || 0);

  const totalNotifications = taskCount + (pendingMeetings?.length || 0);
  const userLimit = profile?.companies?.user_limit_adicionais || 10;

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-border bg-card px-6 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Bem-vindo(a), {profile?.name || session?.user?.email?.split("@")[0] || "Usuário"}
        </h2>
        <p className="text-sm text-muted-foreground">Gerencie seus leads e vendas</p>
      </div>

      <div className="flex items-center gap-4">
        <Badge variant="secondary" className="cursor-pointer" onClick={() => navigate("/users")}>
          <Users className="mr-2 h-4 w-4" />
          Usuários: {userCount}/{userLimit}
        </Badge>

        <MeetingNotifications />

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {totalNotifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {totalNotifications}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 z-50 bg-popover" align="end">
            <Tabs defaultValue="tasks" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="tasks">
                  <ClipboardList className="h-4 w-4 mr-1" />
                  Tarefas {taskCount > 0 && `(${taskCount})`}
                </TabsTrigger>
                <TabsTrigger value="meetings">
                  Reuniões {pendingMeetings && pendingMeetings.length > 0 && `(${pendingMeetings.length})`}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tasks" className="space-y-3 mt-4 max-h-96 overflow-y-auto">
                {/* Vendedor: suas tarefas pendentes */}
                {isVendedor && (
                  <>
                    {pendingAssignments && pendingAssignments.length > 0 ? (
                      pendingAssignments.map((assignment: any) => (
                        <div key={assignment.id} className="p-3 bg-muted rounded-lg space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{assignment.task?.title}</p>
                              {assignment.task?.due_date && (
                                <p className="text-xs text-muted-foreground">
                                  Prazo: {format(new Date(assignment.task.due_date), "dd/MM/yyyy")}
                                </p>
                              )}
                              {assignment.task?.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {assignment.task.description}
                                </p>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs shrink-0"
                              onClick={() => completeTaskMutation.mutate(assignment.id)}
                              disabled={completeTaskMutation.isPending}
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Concluir
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhuma tarefa pendente 🎉
                      </p>
                    )}
                  </>
                )}

                {/* Gestor: progresso das tarefas que criou */}
                {isGestor && (
                  <>
                    {createdTasksProgress && createdTasksProgress.length > 0 ? (
                      createdTasksProgress.map((task: any) => (
                        <div key={task.id} className="p-3 bg-muted rounded-lg space-y-1">
                          <p className="font-medium text-sm">{task.title}</p>
                          <div className="flex items-center justify-between">
                            {task.due_date && (
                              <p className="text-xs text-muted-foreground">
                                Prazo: {format(new Date(task.due_date), "dd/MM/yyyy")}
                              </p>
                            )}
                            <Badge variant="secondary" className="text-xs">
                              {task.total_completed || 0}/{task.total_assigned || 0} concluídos
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhuma tarefa ativa
                      </p>
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="meetings" className="space-y-3 mt-4 max-h-96 overflow-y-auto">
                {pendingMeetings && pendingMeetings.length > 0 ? (
                  pendingMeetings.map((meeting: any) => (
                    <div key={meeting.id} className="p-3 bg-muted rounded-lg space-y-1">
                      <p className="font-medium text-sm">{meeting.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Encerrada: {format(new Date(meeting.end_time), "dd/MM/yyyy HH:mm")}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum feedback pendente
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </PopoverContent>
        </Popover>

        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
