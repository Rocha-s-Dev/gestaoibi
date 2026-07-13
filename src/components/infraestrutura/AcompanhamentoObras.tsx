import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Calendar, Building, MapPin, User, Eye } from "lucide-react";
import { useObras, SITUACOES_OBRA, type Obra } from "@/hooks/useObras";
import { ObraDetalhesDialog } from "./ObraDetalhesDialog";

export function AcompanhamentoObras() {
  const { obras, isLoading } = useObras();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selected, setSelected] = useState<Obra | null>(null);
  const [open, setOpen] = useState(false);

  const filtered = obras.filter((o) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      !q ||
      o.nome.toLowerCase().includes(q) ||
      (o.endereco || "").toLowerCase().includes(q) ||
      (o.bairro || "").toLowerCase().includes(q) ||
      (o.empresa_executora || "").toLowerCase().includes(q) ||
      (o.engenheiro_responsavel || "").toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || o.situacao === filterStatus;
    return matchSearch && matchStatus;
  });

  const getStatusInfo = (s: string) =>
    SITUACOES_OBRA.find((x) => x.value === s) || { label: s, color: "bg-gray-100 text-gray-800" };

  const formatCurrency = (v: number | null) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar obras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as situações</SelectItem>
            {SITUACOES_OBRA.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Carregando obras...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Building className="h-12 w-12 mx-auto mb-4 opacity-40" />
          <p>Nenhuma obra encontrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((obra) => {
            const st = getStatusInfo(obra.situacao);
            const progresso = Number(obra.percentual_fisico || 0);
            return (
              <Card key={obra.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold flex items-center">
                        <Building className="h-5 w-5 mr-2 shrink-0" />
                        <span className="truncate">{obra.nome}</span>
                      </CardTitle>
                      {obra.descricao && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{obra.descricao}</p>
                      )}
                    </div>
                    <Badge className={st.color}>{st.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {(obra.endereco || obra.bairro) && (
                      <div className="flex items-center"><MapPin className="h-4 w-4 mr-2" />{[obra.endereco, obra.bairro].filter(Boolean).join(" - ")}</div>
                    )}
                    {(obra.engenheiro_responsavel || obra.empresa_executora) && (
                      <div className="flex items-center"><User className="h-4 w-4 mr-2" />{[obra.engenheiro_responsavel, obra.empresa_executora].filter(Boolean).join(" - ")}</div>
                    )}
                    {obra.previsao_conclusao && (
                      <div className="flex items-center"><Calendar className="h-4 w-4 mr-2" />Previsão: {new Date(obra.previsao_conclusao).toLocaleDateString("pt-BR")}</div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Progresso Físico</span>
                      <span className="text-sm font-bold">{progresso}%</span>
                    </div>
                    <Progress value={progresso} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Contratado</p>
                      <p className="font-semibold">{formatCurrency(obra.valor_contratado)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Executado</p>
                      <p className="font-semibold">{formatCurrency(obra.valor_executado)}</p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 border-t">
                    <Button variant="outline" size="sm" onClick={() => { setSelected(obra); setOpen(true); }}>
                      <Eye className="h-4 w-4 mr-1" />Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {selected && (
        <ObraDetalhesDialog open={open} onOpenChange={setOpen} obra={selected} />
      )}
    </div>
  );
}
