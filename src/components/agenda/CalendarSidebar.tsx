import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { ptBR } from "date-fns/locale";
import { getUserColor } from "@/lib/userColors";
import { useState } from "react";

interface CalendarSidebarProps {
  currentDate: Date;
  onDateChange: (date: Date | undefined) => void;
  onCreateMeeting: () => void;
  users: Array<{ id: string; name: string }>;
  selectedUsers: Set<string>;
  onUserToggle: (userId: string) => void;
}

const CalendarSidebar = ({
  currentDate,
  onDateChange,
  onCreateMeeting,
  users,
  selectedUsers,
  onUserToggle,
}: CalendarSidebarProps) => {
  return (
    <div className="w-64 border-r border-border bg-background flex flex-col h-full">
      {/* Botão Criar */}
      <div className="p-4">
        <Button 
          onClick={onCreateMeeting}
          className="w-full justify-start gap-2 shadow-sm"
          size="lg"
        >
          <Plus className="h-5 w-5" />
          Criar
        </Button>
      </div>

      {/* Mini Calendário */}
      <div className="px-2 pb-4">
        <Calendar
          mode="single"
          selected={currentDate}
          onSelect={onDateChange}
          locale={ptBR}
          className="rounded-md border-0"
        />
      </div>

      {/* Minhas Agendas */}
      <div className="px-4 pb-4 flex-1 overflow-y-auto">
        <h3 className="text-sm font-semibold mb-3">Minhas agendas</h3>
        <div className="space-y-2">
          {users.map((user) => {
            const color = getUserColor(user.id);
            const isSelected = selectedUsers.has(user.id);
            
            return (
              <div key={user.id} className="flex items-center gap-2">
                <Checkbox
                  id={`user-${user.id}`}
                  checked={isSelected}
                  onCheckedChange={() => onUserToggle(user.id)}
                  className="data-[state=checked]:bg-transparent data-[state=checked]:border-current"
                  style={{
                    color: isSelected ? color.dot.replace('bg-', '#').replace('-500', '') : undefined
                  }}
                />
                <Label
                  htmlFor={`user-${user.id}`}
                  className="flex items-center gap-2 cursor-pointer text-sm flex-1"
                >
                  <div className={`h-3 w-3 rounded-full ${color.dot}`} />
                  <span className="truncate">{user.name}</span>
                </Label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarSidebar;
