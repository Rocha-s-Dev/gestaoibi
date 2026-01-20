import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCardapioSemana } from "@/hooks/usePortalResponsavel";
import { UtensilsCrossed, Calendar, Flame } from "lucide-react";
import { format, isToday, isTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CardapioSemanaProps {
  escolaId: string | undefined;
  escolaNome: string | undefined;
}

const refeicaoLabels: Record<string, string> = {
  cafe_manha: "Café da Manhã",
  lanche_manha: "Lanche Manhã",
  almoco: "Almoço",
  lanche_tarde: "Lanche Tarde",
  jantar: "Jantar",
};

const refeicaoIcons: Record<string, string> = {
  cafe_manha: "☕",
  lanche_manha: "🍎",
  almoco: "🍽️",
  lanche_tarde: "🍪",
  jantar: "🌙",
};

export function CardapioSemana({ escolaId, escolaNome }: CardapioSemanaProps) {
  const { data: cardapios = [], isLoading } = useCardapioSemana(escolaId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Agrupar por data
  const cardapiosPorDia = cardapios.reduce((acc, cardapio) => {
    const data = cardapio.data;
    if (!acc[data]) acc[data] = [];
    acc[data].push(cardapio);
    return acc;
  }, {} as Record<string, typeof cardapios>);

  const diasOrdenados = Object.keys(cardapiosPorDia).sort();

  const getDayLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Hoje";
    if (isTomorrow(date)) return "Amanhã";
    return format(date, "EEEE", { locale: ptBR });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UtensilsCrossed className="h-5 w-5 text-primary" />
          Cardápio da Semana
          {escolaNome && (
            <span className="text-sm font-normal text-muted-foreground">
              - {escolaNome}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!escolaId ? (
          <div className="text-center py-8 text-muted-foreground">
            Selecione um aluno para ver o cardápio da escola.
          </div>
        ) : cardapios.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum cardápio cadastrado para esta semana.
          </div>
        ) : (
          <div className="space-y-6">
            {diasOrdenados.map((data) => {
              const refeicoesDia = cardapiosPorDia[data];
              const date = new Date(data);
              const isHoje = isToday(date);

              return (
                <div
                  key={data}
                  className={`rounded-lg border p-4 ${
                    isHoje ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium capitalize">
                      {getDayLabel(data)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      - {format(date, "dd/MM", { locale: ptBR })}
                    </span>
                    {isHoje && (
                      <Badge variant="default" className="ml-auto">
                        Hoje
                      </Badge>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {refeicoesDia.map((cardapio) => {
                      const itens = Array.isArray(cardapio.itens)
                        ? cardapio.itens
                        : [];

                      return (
                        <div
                          key={cardapio.id}
                          className="bg-background rounded-md p-3 border"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">
                              {refeicaoIcons[cardapio.refeicao] || "🍴"}
                            </span>
                            <span className="font-medium text-sm">
                              {refeicaoLabels[cardapio.refeicao] || cardapio.refeicao}
                            </span>
                          </div>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {itens.map((item, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-primary">•</span>
                                <span>{String(item)}</span>
                              </li>
                            ))}
                          </ul>
                          {cardapio.calorias_estimadas && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                              <Flame className="h-3 w-3" />
                              <span>{cardapio.calorias_estimadas} kcal</span>
                            </div>
                          )}
                          {cardapio.observacoes && (
                            <p className="text-xs text-muted-foreground mt-2 italic">
                              {cardapio.observacoes}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
