import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import MeetingCard from "./MeetingCard";

interface CalendarGridProps {
  weekDays: Date[];
  meetings: any[];
  isLoading: boolean;
  onRefetch: () => void;
}

const CalendarGrid = ({ weekDays, meetings, isLoading, onRefetch }: CalendarGridProps) => {
  const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8h às 20h
  const today = format(new Date(), "yyyy-MM-dd");

  const getMeetingsForDateTime = (date: Date, hour: number) => {
    return meetings.filter((meeting) => {
      const meetingDate = new Date(meeting.start_time);
      return (
        format(meetingDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd") &&
        meetingDate.getHours() === hour
      );
    });
  };

  const isToday = (date: Date) => {
    return format(date, "yyyy-MM-dd") === today;
  };

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header com dias da semana */}
          <div className="grid grid-cols-8 border-b border-border/50 bg-background">
            <div className="p-4 text-sm font-medium text-muted-foreground">Horário</div>
            {weekDays.map((day) => (
              <div key={day.toString()} className="p-4 text-center border-l border-border/50">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {format(day, "EEE", { locale: ptBR })}
                </div>
                <div className={cn(
                  "text-2xl font-bold mt-1.5 inline-flex items-center justify-center",
                  isToday(day) && "w-10 h-10 rounded-full bg-[#1a73e8] text-white"
                )}>
                  {format(day, "dd", { locale: ptBR })}
                </div>
              </div>
            ))}
          </div>

          {/* Grid de horários */}
          <div className="divide-y divide-border/50">
            {hours.map((hour, index) => (
              <div 
                key={hour} 
                className={cn(
                  "grid grid-cols-8 min-h-[90px]",
                  index % 2 === 0 && "bg-muted/20"
                )}
              >
                <div className="p-4 text-xs text-muted-foreground font-medium border-r border-border/50">
                  {hour}:00
                </div>
                {weekDays.map((day) => {
                  const dayMeetings = getMeetingsForDateTime(day, hour);
                  return (
                    <div key={`${day}-${hour}`} className="p-2.5 border-l border-border/50 relative">
                      <div className="space-y-1.5">
                        {dayMeetings.map((meeting) => (
                          <MeetingCard
                            key={meeting.id}
                            meeting={meeting}
                            onRefetch={onRefetch}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CalendarGrid;
