import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskCard } from "./TaskCard";
import { Badge } from "@/components/ui/badge";
import { startOfDay, endOfDay } from "date-fns";

interface TaskKanbanProps {
  tasks: any[];
  onEditTask: (task: any) => void;
  isGestor: boolean;
}

export function TaskKanban({ tasks, onEditTask, isGestor }: TaskKanbanProps) {
  const today = new Date();
  const startOfToday = startOfDay(today);
  const endOfToday = endOfDay(today);

  const columns = [
    { id: "aberta", title: "Abertas", status: "aberta" },
    { id: "em_andamento", title: "Em Andamento", status: "em_andamento" },
    { id: "concluida", title: "Concluídas", status: "concluida" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((column) => {
        let columnTasks = tasks.filter((task) => task.status === column.status);
        
        // Para tarefas abertas, mostrar apenas as do dia
        if (column.status === "aberta") {
          columnTasks = columnTasks.filter((task) => {
            if (!task.due_date) return true; // Mostrar tarefas sem data
            const dueDate = new Date(task.due_date);
            return dueDate >= startOfToday && dueDate <= endOfToday;
          });
        }

        return (
          <Card key={column.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{column.title}</CardTitle>
                <Badge variant="secondary">{columnTasks.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {columnTasks.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">
                  Nenhuma tarefa {column.title.toLowerCase()}
                </p>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={onEditTask}
                    isGestor={isGestor}
                  />
                ))
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
