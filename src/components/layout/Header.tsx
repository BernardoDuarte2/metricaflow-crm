import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const Header = () => {
  const { data: reminders } = useQuery({
    queryKey: ["pending-reminders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reminders")
        .select("*, leads(name)")
        .eq("completed", false)
        .lte("reminder_date", new Date().toISOString())
        .order("reminder_date", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Bem-vindo ao CRM
        </h2>
        <p className="text-sm text-muted-foreground">
          Gerencie seus leads e vendas
        </p>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {reminders && reminders.length > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Lembretes Pendentes</h3>
            {reminders && reminders.length > 0 ? (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {reminders.map((reminder: any) => (
                  <div
                    key={reminder.id}
                    className="p-3 bg-muted rounded-lg space-y-1"
                  >
                    <p className="text-sm font-medium">
                      {reminder.leads?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {reminder.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(reminder.reminder_date), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhum lembrete pendente
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </header>
  );
};

export default Header;
