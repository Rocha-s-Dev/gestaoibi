import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Search, Package, Trash2, Pencil } from "lucide-react";
import {
  useBeneficiosEventuais, TIPO_BENEFICIO_LABELS, STATUS_BENEFICIO_LABELS,
  type BeneficioEventual, type TipoBeneficio,
} from "@/hooks/useBeneficiosEventuais";
import { BeneficioEventualDialog } from "./BeneficioEventualDialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const statusVariants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  solicitado: "outline",
  em_analise: "secondary",
  aprovado: "default",
  concedido: "default",
  indeferido: "destructive",
  cancelado: "destructive",
};

export function BeneficiosEventuais() {
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BeneficioEventual | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);

  const { beneficios, isLoading, changeStatus, removeBeneficio } = useBeneficiosEventuais({
    tipo: filtroTipo as any,
    status: filtroStatus,
  });

  const filtered = (beneficios || []).filter((b) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (b.familia?.responsavel_nome || "").toLowerCase().includes(s) ||
      b.justificativa.toLowerCase().includes(s) ||
      TIPO_BENEFICIO_LABELS[b.tipo_beneficio].toLowerCase().includes(s)
    );
  });

  const openNew = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (b: BeneficioEventual) => { setEditing(b); setDialogOpen(true); };

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por família, tipo ou justificativa..."
              className="pl-9 h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger className="w-[200px] h-9"><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              {(Object.keys(TIPO_BENEFICIO_LABELS) as TipoBeneficio[]).map((t) => (
                <SelectItem key={t} value={t}>{TIPO_BENEFICIO_LABELS[t]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-[180px] h-9"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              {Object.entries(STATUS_BENEFICIO_LABELS).map(([k, l]) => (
                <SelectItem key={k} value={k}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openNew} size="sm" className="h-9">
          <PlusCircle className="h-4 w-4 mr-2" />Novo Benefício
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Família</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="hidden md:table-cell">Valor</TableHead>
              <TableHead className="hidden md:table-cell">Unidade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                Carregando...
              </TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                Nenhum benefício encontrado
              </TableCell></TableRow>
            ) : filtered.map((b) => (
              <TableRow key={b.id}>
                <TableCell>{new Date(b.data_solicitacao).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell className="font-medium">{b.familia?.responsavel_nome || "Sem vínculo"}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{TIPO_BENEFICIO_LABELS[b.tipo_beneficio]}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {b.valor > 0 ? b.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—"}
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm">{b.unidade?.nome || "—"}</TableCell>
                <TableCell>
                  <Select
                    value={b.status}
                    onValueChange={(v) => changeStatus.mutate({ id: b.id, status: v })}
                  >
                    <SelectTrigger className="h-8 w-[140px]">
                      <Badge variant={statusVariants[b.status] || "outline"} className="text-xs">
                        {STATUS_BENEFICIO_LABELS[b.status] || b.status}
                      </Badge>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_BENEFICIO_LABELS).map(([k, l]) => (
                        <SelectItem key={k} value={k}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(b)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setRemoveId(b.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <BeneficioEventualDialog open={dialogOpen} onOpenChange={setDialogOpen} beneficio={editing} />

      <AlertDialog open={!!removeId} onOpenChange={(o) => !o && setRemoveId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover benefício?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Considere alterar o status para "cancelado" para preservar o histórico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (removeId) removeBeneficio.mutate(removeId, { onSuccess: () => setRemoveId(null) });
              }}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
