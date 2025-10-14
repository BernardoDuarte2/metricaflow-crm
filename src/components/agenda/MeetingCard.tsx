import { format } from "date-fns";
import { Clock, Users, UserCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";
import MeetingDetailDialog from "./MeetingDetailDialog";

interface MeetingCardProps {
  meeting: any;
  onRefetch: () => void;
}

const MeetingCard = ({ meeting, onRefetch }: MeetingCardProps) => {
  const [detailOpen, setDetailOpen] = useState(false);

  const getStatusBorderColor = (status: string) => {
    switch (status) {
      case "agendada":
        return "border-l-[#1a73e8]";
      case "realizada":
        return "border-l-[#0f9d58]";
      case "cancelada":
        return "border-l-[#ea4335]";
      default:
        return "border-l-muted";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "agendada":
        return "bg-[#1a73e8]/10 text-[#1a73e8]";
      case "realizada":
        return "bg-[#0f9d58]/10 text-[#0f9d58]";
      case "cancelada":
        return "bg-[#ea4335]/10 text-[#ea4335]";
      default:
        return "";
    }
  };

  return (
    <>
      <div
        onClick={() => setDetailOpen(true)}
        className={cn(
          "p-2.5 rounded-md border border-l-4 cursor-pointer transition-all duration-200 text-xs",
          "bg-background hover:shadow-md hover:scale-[1.02]",
          getStatusBorderColor(meeting.status)
        )}
      >
        <div className="flex items-start justify-between gap-1 mb-1.5">
          <p className="font-semibold line-clamp-1">{meeting.title}</p>
          <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0.5 shrink-0", getStatusBadgeColor(meeting.status))}>
            {meeting.status}
          </Badge>
        </div>
        
        <div className="flex items-center gap-1 text-muted-foreground mb-1">
          <Clock className="h-3 w-3" />
          <span>
            {format(new Date(meeting.start_time), "HH:mm")} - {format(new Date(meeting.end_time), "HH:mm")}
          </span>
        </div>

        {meeting.lead && (
          <div className="flex items-center gap-1 text-muted-foreground mb-1">
            <UserCircle className="h-3 w-3" />
            <span className="line-clamp-1">{meeting.lead.name}</span>
          </div>
        )}

        {meeting.meeting_participants && meeting.meeting_participants.length > 0 && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>{meeting.meeting_participants.length} participante(s)</span>
          </div>
        )}
      </div>

      <MeetingDetailDialog
        meeting={meeting}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onRefetch={onRefetch}
      />
    </>
  );
};

export default MeetingCard;
