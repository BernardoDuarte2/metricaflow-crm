import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

interface KanbanFiltersProps {
  selectedMonth: string;
  onMonthChange: (value: string) => void;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  totalLeads: number;
  visibleLeads: number;
}

export const KanbanFilters = ({
  selectedMonth,
  onMonthChange,
  searchTerm,
  onSearchTermChange,
  totalLeads,
  visibleLeads,
}: KanbanFiltersProps) => {
  const currentDate = new Date(selectedMonth + '-01');
  
  const handlePreviousMonth = () => {
    const prev = subMonths(currentDate, 1);
    onMonthChange(`${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`);
  };
  
  const handleNextMonth = () => {
    const next = addMonths(currentDate, 1);
    onMonthChange(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePreviousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-[180px] text-center">
              <p className="text-lg font-semibold">
                {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 space-y-2">
            <Label htmlFor="search">Buscar no Kanban</Label>
            <Input
              id="search"
              placeholder="Nome, email, telefone ou empresa..."
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm px-3 py-1">
              {visibleLeads} de {totalLeads} leads
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
