import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, BarChart3 } from "lucide-react";
import { useTurismoCultura } from "@/hooks/useTurismoCultura";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export function IndicadoresVisitacaoTab() {
  const { indicadores, loadingIndicadores, createIndicador, pontosTuristicos } = useTurismoCultura();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    ponto_id: "", periodo: "", visitantes_nacionais: 0, visitantes_internacionais: 0, receita_estimada: 0,
  });

  const handleSubmit = () => {
    if (!form.ponto_id || !form.periodo) return;
    createIndicador.mutate(form, { onSuccess: () => { setOpen(false); setForm({ ponto_id: "", periodo: "", visitantes_nacionais: 0, visitantes_internacionais: 0, receita_estimada: 0 }); } });
  };

  const chartData = (indicadores as any[]).slice(0, 12).map((i: any) => ({
    periodo: i.periodo,
    nacionais: i.visitantes_nacionais || 0,
    internacionais: i.visitantes_internacionais || 0,
  })).reverse();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Indicadores de Visitação</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Registrar</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Registrar Indicador de Visitação</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Ponto Turístico *</Label>
                <Select value={form.ponto_id} onValueChange={v => setForm({ ...form, ponto_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{pontosTuristicos.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Período (YYYY-MM) *</Label><Input value={form.periodo} onChange={e => setForm({ ...form, periodo: e.target.value })} placeholder="2026-01" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Visitantes Nacionais</Label><Input type="number" value={form.visitantes_nacionais} onChange={e => setForm({ ...form, visitantes_nacionais: Number(e.target.value) })} /></div>
                <div><Label>Visitantes Internacionais</Label><Input type="number" value={form.visitantes_internacionais} onChange={e => setForm({ ...form, visitantes_internacionais: Number(e.target.value) })} /></div>
              </div>
              <div><Label>Receita Estimada (R$)</Label><Input type="number" value={form.receita_estimada} onChange={e => setForm({ ...form, receita_estimada: Number(e.target.value) })} /></div>
              <Button onClick={handleSubmit} className="w-full" disabled={createIndicador.isPending}>Registrar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-6">
        {chartData.length > 0 && (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="periodo" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="nacionais" fill="hsl(var(--primary))" name="Nacionais" />
              <Bar dataKey="internacionais" fill="hsl(var(--accent))" name="Internacionais" />
            </BarChart>
          </ResponsiveContainer>
        )}
        <Table>
          <TableHeader><TableRow><TableHead>Ponto</TableHead><TableHead>Período</TableHead><TableHead>Nacionais</TableHead><TableHead>Internac.</TableHead><TableHead>Receita</TableHead></TableRow></TableHeader>
          <TableBody>
            {loadingIndicadores ? <TableRow><TableCell colSpan={5} className="text-center">Carregando...</TableCell></TableRow> :
              (indicadores as any[]).length === 0 ? <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Nenhum indicador registrado</TableCell></TableRow> :
                (indicadores as any[]).map((i: any) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{i.pontos_turisticos?.nome || "—"}</TableCell>
                    <TableCell>{i.periodo}</TableCell>
                    <TableCell>{i.visitantes_nacionais?.toLocaleString()}</TableCell>
                    <TableCell>{i.visitantes_internacionais?.toLocaleString()}</TableCell>
                    <TableCell>R$ {i.receita_estimada?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
