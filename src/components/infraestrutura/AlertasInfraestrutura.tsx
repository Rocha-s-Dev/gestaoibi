import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Bell, CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react";
import { useAlertasInfraestrutura, TIPOS_ALERTA_INFRAESTRUTURA } from "@/hooks/useAlertasInfraestrutura";

const PRIORIDADES = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Média" },
  { value: "alta", label: "Alta" },
  { value: "critica", label: "Crítica" },
];

export function AlertasInfraestrutura() {
  const { alertas, isLoading, createAlerta, resolverAlerta, deleteAlerta } = useAlertasInfraestrutura();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ tipo: "", titulo: "", descricao: "", prioridade: "media", data_limite: "" });

  const pendentes = alertas.filter((a) => a.status !== "resolvido");
  const resolvidos = alertas.filter((a) => a.status === "resolvido");

  const submit = () => {
    if (!form.tipo || !form.titulo) return;
    createAlerta.mutate(
      { ...form, data_limite: form.data_limite || null } as any,
      {
        onSuccess: () => {
          setForm({ tipo: "", titulo: "", descricao: "", prioridade: "media", data_limite: "" });
          setOpen(false);
        },
      }
    );
  };

  const badgeVariant = (p: string) =>
    p === "critica" ? "destructive" : p === "alta" ? "destructive" : p === "media" ? "default" : "secondary";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" /> Alertas da Infraestrutura
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Obras atrasadas, chamados urgentes, iluminação crítica, metas em risco e documentos pendentes.
            </p>
          </div>
          <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Novo Alerta</Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div>
          ) : alertas.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <AlertTriangle className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>Nenhum alerta registrado.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[110px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...pendentes, ...resolvidos].map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="text-xs">
                      {TIPOS_ALERTA_INFRAESTRUTURA.find((t) => t.value === a.tipo)?.label || a.tipo}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{a.titulo}</p>
                        {a.descricao && <p className="text-xs text-muted-foreground line-clamp-1">{a.descricao}</p>}
                      </div>
                    </TableCell>
                    <TableCell><Badge variant={badgeVariant(a.prioridade) as any}>{a.prioridade}</Badge></TableCell>
                    <TableCell className="text-sm">{a.data_limite ? new Date(a.data_limite).toLocaleDateString("pt-BR") : "—"}</TableCell>
                    <TableCell>
                      <Badge variant={a.status === "resolvido" ? "secondary" : "default"}>{a.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {a.status !== "resolvido" && (
                        <Button variant="ghost" size="icon" onClick={() => resolverAlerta.mutate(a.id)} title="Resolver">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => deleteAlerta.mutate(a.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Alerta</DialogTitle>
            <DialogDescription>Registre um alerta operacional da Infraestrutura.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Tipo *</Label>
              <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {TIPOS_ALERTA_INFRAESTRUTURA.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Título *</Label>
              <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Prioridade</Label>
                <Select value={form.prioridade} onValueChange={(v) => setForm({ ...form, prioridade: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORIDADES.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Prazo</Label>
                <Input type="date" value={form.data_limite} onChange={(e) => setForm({ ...form, data_limite: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={submit} disabled={!form.tipo || !form.titulo || createAlerta.isPending}>
              {createAlerta.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
