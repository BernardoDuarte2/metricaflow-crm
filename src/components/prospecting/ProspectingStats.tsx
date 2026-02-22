import { Building2, MapPin, Star, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ProspectLead {
  id: string;
  nome: string;
  telefone?: string;
  cidade?: string;
  estado?: string;
  avaliacoes?: number;
  rating?: number;
  endereco?: string;
  website?: string;
  categoria?: string;
}

interface ProspectingStatsProps {
  leads: ProspectLead[];
}

export const ProspectingStats = ({ leads }: ProspectingStatsProps) => {
  const totalLeads = leads.length;
  const totalAvaliacoes = leads.reduce(
    (sum, lead) => sum + (lead.avaliacoes || 0),
    0
  );
  const avgRating =
    leads.length > 0
      ? (
          leads.reduce((sum, lead) => sum + (lead.rating || 0), 0) /
          leads.filter((l) => l.rating).length
        ).toFixed(1)
      : "0.0";
  const leadsComTelefone = leads.filter((l) => l.telefone).length;

  // Cidades únicas
  const cidadesUnicas = [...new Set(leads.map((l) => l.cidade).filter(Boolean))]
    .length;

  const stats = [
    {
      label: "Total de Leads",
      value: totalLeads,
      icon: Building2,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Com Telefone",
      value: leadsComTelefone,
      icon: Phone,
      color: "text-[hsl(210_85%_55%)]",
      bgColor: "bg-[hsl(210_85%_55%/0.1)]",
    },
    {
      label: "Cidades",
      value: cidadesUnicas,
      icon: MapPin,
      color: "text-[hsl(200_80%_50%)]",
      bgColor: "bg-[hsl(200_80%_50%/0.1)]",
    },
    {
      label: "Média Avaliação",
      value: avgRating,
      icon: Star,
      color: "text-[hsl(215_75%_70%)]",
      bgColor: "bg-[hsl(215_75%_70%/0.1)]",
      suffix: "★",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="premium-card">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className={`p-1.5 sm:p-2 rounded-lg ${stat.bgColor} shrink-0`}
              >
                <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold truncate">
                  {stat.value}
                  {stat.suffix && (
                    <span className="text-sm sm:text-lg ml-0.5 sm:ml-1">
                      {stat.suffix}
                    </span>
                  )}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                  {stat.label}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
