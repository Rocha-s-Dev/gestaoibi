import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, School, BookOpen, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, differenceInYears } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FilhoCardProps {
  filho: {
    id: string;
    nome: string;
    numero_matricula: string;
    data_nascimento: string;
    status?: string;
    turma: {
      id: string;
      nome: string;
      serie: string;
      turno: string;
    } | null;
    escola: {
      id: string;
      nome: string;
    } | null;
    responsavel_principal?: boolean;
  };
  isSelected: boolean;
  onSelect: () => void;
}

const turnoLabels: Record<string, string> = {
  matutino: "Manhã",
  vespertino: "Tarde",
  noturno: "Noite",
  integral: "Integral",
};

export function FilhoCard({ filho, isSelected, onSelect }: FilhoCardProps) {
  const idade = differenceInYears(new Date(), new Date(filho.data_nascimento));

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary shadow-md"
      )}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold truncate">{filho.nome}</h3>
                <p className="text-sm text-muted-foreground">
                  {idade} anos • Matrícula: {filho.numero_matricula}
                </p>
              </div>
              {filho.responsavel_principal && (
                <Badge variant="secondary" className="flex-shrink-0">
                  Principal
                </Badge>
              )}
            </div>

            <div className="space-y-1 text-sm">
              {filho.escola && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <School className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{filho.escola.nome}</span>
                </div>
              )}
              {filho.turma && (
                <>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="h-4 w-4 flex-shrink-0" />
                    <span>{filho.turma.nome} - {filho.turma.serie}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <span>{turnoLabels[filho.turma.turno] || filho.turma.turno}</span>
                  </div>
                </>
              )}
            </div>

            {filho.status && filho.status !== "matriculado" && (
              <Badge variant="outline" className="mt-2">
                {filho.status}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
