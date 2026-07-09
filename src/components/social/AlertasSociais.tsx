import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { useAlertasSociais, gerarAlertasAutomaticos, TIPO_ALERTA_LABELS } from "@/hooks/useAlertasSociais";
import { toast } from "sonner";

const severidadeColor: Record<string, string> = {
  baixa: "bg-blue-100 text-blue-800",
  media: "bg-yellow-100 text-yellow-800",
  alta: "bg-orange-100 text-orange-800",
  critica: "bg-red-100 text-red-800",
};

export function AlertasSociais() {
  const [filtro, setFiltro] = useState<"pendentes" | "resolvidos">("pendentes");
  const { alertas, isLoading, resolver } = useAlertasSociais({ resolvido: filtro === "resolvidos" });
  const [gerando, setGerando] = useState(false);

  const gerar = async () => {
    setGerando(true);
    try {
      const n = await gerarAlertasAutomaticos();
      toast.success(`${n} novo(s) alerta(s) gerado(s)`);
    } catch (e: any) { toast.error(e.message); }
    finally { setGerando(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between gap-2">
        <Select value={filtro} onValueChange={(v: any) => setFiltro(v)}>
          <SelectTrigger className="w-[200px] h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="pendentes">Pendentes</SelectItem>
            <SelectItem value="resolvidos">Resolvidos</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" onClick={gerar} disabled={gerando}>
          <RefreshCw className={"h-4 w-4 mr-2 " + (gerando ? "animate-spin" : "")} />Gerar alertas automáticos
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Tipo</TableHead><TableHead>Título</TableHead><TableHead>Família</TableHead>
            <TableHead>Severidade</TableHead><TableHead>Criado em</TableHead><TableHead className="text-right">Ações</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={6} className="text-center py-8">Carregando...</TableCell></TableRow>
            : (alertas || []).length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground"><CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />Nenhum alerta {filtro}.</TableCell></TableRow>
            : (alertas || []).map(a => (
              <TableRow key={a.id}>
                <TableCell><AlertTriangle className="inline h-4 w-4 mr-1 text-orange-500" />{TIPO_ALERTA_LABELS[a.tipo]}</TableCell>
                <TableCell className="font-medium max-w-[300px] truncate">{a.titulo}</TableCell>
                <TableCell>{a.familia?.responsavel_nome || "—"}</TableCell>
                <TableCell><span className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium ${severidadeColor[a.severidade] || ""}`}>{a.severidade}</span></TableCell>
                <TableCell className="text-sm">{new Date(a.created_at).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell className="text-right">
                  {!a.resolvido && <Button size="sm" variant="outline" onClick={() => resolver.mutate({ id: a.id })}>Resolver</Button>}
                  {a.resolvido && <Badge variant="outline">Resolvido</Badge>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
