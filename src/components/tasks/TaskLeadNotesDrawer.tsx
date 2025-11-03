import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { CalendarClock, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { noteFormSchema, NoteFormData } from "@/lib/schemas";
import { ScrollArea } from "@/components/ui/scroll-area";

const NOTE_TYPES = [
  "Contato feito",
  "Cliente não responde",
  "Cliente analisando proposta",
  "Cliente vendo outros orçamentos",
  "Personalizado",
];

interface TaskLeadNotesDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
  taskId: string;
  leadName: string;
}

export function TaskLeadNotesDrawer({
  open,
  onOpenChange,
  leadId,
  taskId,
  leadName,
}: TaskLeadNotesDrawerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [noteContent, setNoteContent] = useState("");
  const [noteType, setNoteType] = useState("Contato feito");
  const [customNoteType, setCustomNoteType] = useState("");
  const [returnDate, setReturnDate] = useState<Date>();
  const [noteErrors, setNoteErrors] = useState<Partial<Record<keyof NoteFormData, string>>>({});

  const { data: notes, isLoading: isLoadingNotes } = useQuery({
    queryKey: ["lead-notes", leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lead_observations")
        .select(`
          *,
          profiles:user_id (
            name
          )
        `)
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: open && !!leadId,
  });

  const addNoteMutation = useMutation({
    mutationFn: async (data: NoteFormData) => {
      const validation = noteFormSchema.safeParse(data);
      if (!validation.success) {
        const errors: Partial<Record<keyof NoteFormData, string>> = {};
        validation.error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as keyof NoteFormData] = err.message;
          }
        });
        setNoteErrors(errors);
        throw new Error("Dados inválidos. Verifique os campos.");
      }

      setNoteErrors({});

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Sessão expirada");

      // Inserir nota
      const { error } = await supabase.from("lead_observations").insert({
        lead_id: leadId,
        user_id: session.user.id,
        content: data.content,
        note_type: data.note_type,
        return_scheduled_date: data.return_date?.toISOString(),
      });

      if (error) throw error;

      // Se houver data de retorno, criar nova tarefa
      if (data.return_date) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("company_id")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          await supabase.from("tasks").insert({
            title: "Atualização de Lead",
            description: `Retorno agendado em ${format(data.return_date, "dd/MM/yyyy")} - Atualizar informações do lead ${leadName}`,
            assigned_to: session.user.id,
            created_by: session.user.id,
            company_id: profile.company_id,
            lead_id: leadId,
            due_date: data.return_date.toISOString(),
            status: "aberta",
          });
        }
      }

      // Marcar a tarefa atual como concluída
      await supabase
        .from("tasks")
        .update({ status: "concluida" })
        .eq("id", taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-notes", leadId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({ title: "Nota adicionada e tarefa concluída!" });
      setNoteContent("");
      setNoteType("Contato feito");
      setCustomNoteType("");
      setReturnDate(undefined);
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao adicionar nota",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    const finalNoteType = noteType === "Personalizado" ? customNoteType : noteType;
    if (!noteContent.trim() || !finalNoteType.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o conteúdo e tipo da nota",
        variant: "destructive",
      });
      return;
    }
    addNoteMutation.mutate({
      content: noteContent,
      note_type: finalNoteType,
      return_date: returnDate,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] w-full">
        <SheetHeader>
          <SheetTitle>Atualizar Lead: {leadName}</SheetTitle>
          <SheetDescription>
            Adicione uma nota para atualizar o status deste lead. A tarefa será marcada como concluída automaticamente.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-6">
          <div className="space-y-6 pr-4">
            <form onSubmit={handleAddNote} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="note-type">Tipo de Nota *</Label>
                <Select value={noteType} onValueChange={setNoteType}>
                  <SelectTrigger className={noteErrors.note_type ? "border-destructive" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {noteErrors.note_type && (
                  <p className="text-sm text-destructive">{noteErrors.note_type}</p>
                )}
              </div>

              {noteType === "Personalizado" && (
                <div className="space-y-2">
                  <Label htmlFor="custom-type">Tipo Personalizado *</Label>
                  <Input
                    id="custom-type"
                    value={customNoteType}
                    onChange={(e) => setCustomNoteType(e.target.value)}
                    placeholder="Digite o tipo da nota"
                    required
                    className={noteErrors.note_type ? "border-destructive" : ""}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="note-content">Nota *</Label>
                <Textarea
                  id="note-content"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Digite sua nota aqui..."
                  rows={6}
                  required
                  className={noteErrors.content ? "border-destructive" : ""}
                />
                {noteErrors.content && (
                  <p className="text-sm text-destructive">{noteErrors.content}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Agendar Retorno (Opcional)</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 justify-start text-left font-normal"
                      >
                        <CalendarClock className="h-4 w-4 mr-2" />
                        {returnDate ? format(returnDate, "dd/MM/yyyy") : "Selecione uma data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={returnDate}
                        onSelect={setReturnDate}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {returnDate && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setReturnDate(undefined)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {returnDate && (
                  <p className="text-xs text-muted-foreground">
                    Uma nova tarefa será criada para esta data
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={addNoteMutation.isPending}>
                {addNoteMutation.isPending ? "Salvando..." : "Adicionar Nota e Concluir Tarefa"}
              </Button>
            </form>

            <div className="space-y-3 pt-6 border-t">
              <h3 className="font-semibold">Histórico de Notas</h3>
              {isLoadingNotes ? (
                <p className="text-sm text-muted-foreground">Carregando...</p>
              ) : notes && notes.length > 0 ? (
                notes.map((note: any) => (
                  <div key={note.id} className="p-3 rounded-lg border bg-card space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{note.profiles?.name || "Usuário"}</span>
                      <span>{format(new Date(note.created_at), "dd/MM/yyyy HH:mm")}</span>
                    </div>
                    <p className="text-sm font-medium">{note.note_type}</p>
                    <p className="text-sm">{note.content}</p>
                    {note.return_scheduled_date && (
                      <p className="text-xs text-muted-foreground">
                        Retorno agendado: {format(new Date(note.return_scheduled_date), "dd/MM/yyyy")}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma nota ainda</p>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
