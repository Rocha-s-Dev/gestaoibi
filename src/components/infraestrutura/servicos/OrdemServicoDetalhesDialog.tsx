import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import {
  OrdemServico, STATUS_OS, useOrdemDesignacoes, useOrdemEquipamentosUso,
  useOrdemExecucoes, useOrdemHistorico, useOrdemMateriais,
} from "@/hooks/useOrdensServico";
import { useServicosEquipes } from "@/hooks/useServicosEquipes";
import { useServicosEquipamentos } from "@/hooks/useServicosEquipamentos";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  ordem: OrdemServico | null;
}

export function OrdemServicoDetalhesDialog({ open, onOpenChange, ordem }: Props) {
  const id = ordem?.id;
  const { equipes } = useServicosEquipes();
  const { equipamentos } = useServicosEquipamentos();
  const execucoes = useOrdemExecucoes(id);
  const materiais = useOrdemMateriais(id);
  const usosEquip = useOrdemEquipamentosUso(id);
  const designacoes = useOrdemDesignacoes(id);
  const { historico } = useOrdemHistorico(id);

  const [exec, setExec] = useState<any>({ data: new Date().toISOString().slice(0, 10), hora_inicio: "", hora_fim: "", equipe_id: "", quantidade_executada: "", unidade: "", observacoes: "" });
  const [mat, setMat] = useState<any>({ material: "", quantidade: "", unidade: "", valor_utilizado: "" });
  const [uso, setUso] = useState<any>({ equipamento_id: "", horas_utilizadas: "", km_utilizados: "" });
  const [des, setDes] = useState<any>({ equipe_id: "", responsavel_nome: "", prazo: "", observacoes: "" });

  if (!ordem) return null;
  const st = STATUS_OS.find(s => s.value === ordem.status) ?? STATUS_OS[0];
  const str = (v: any) => (v === "" ? null : v);
  const num = (v: any) => (v === "" ? null : Number(v));
  const dt = (v?: string | null) => (v ? new Date(v).toLocaleString("pt-BR") : "-");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            OS {ordem.numero_os ?? ""} <Badge className={st.color}>{st.label}</Badge>
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{ordem.tipo_nome} · {ordem.bairro ?? "-"} · {ordem.endereco ?? ""}</p>
        </DialogHeader>

        <Tabs defaultValue="execucoes">
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="execucoes">Execuções</TabsTrigger>
            <TabsTrigger value="materiais">Materiais</TabsTrigger>
            <TabsTrigger value="equipamentos">Equipamentos</TabsTrigger>
            <TabsTrigger value="designacoes">Designações</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="execucoes" className="space-y-4 mt-4">
            <div className="grid md:grid-cols-4 gap-3">
              <div className="space-y-1"><Label>Data</Label><Input type="date" value={exec.data} onChange={e => setExec({ ...exec, data: e.target.value })} /></div>
              <div className="space-y-1"><Label>Início</Label><Input type="time" value={exec.hora_inicio} onChange={e => setExec({ ...exec, hora_inicio: e.target.value })} /></div>
              <div className="space-y-1"><Label>Fim</Label><Input type="time" value={exec.hora_fim} onChange={e => setExec({ ...exec, hora_fim: e.target.value })} /></div>
              <div className="space-y-1">
                <Label>Equipe</Label>
                <Select value={exec.equipe_id || undefined} onValueChange={v => setExec({ ...exec, equipe_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{equipes.map(e => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Qtd. executada</Label><Input type="number" step="0.01" value={exec.quantidade_executada} onChange={e => setExec({ ...exec, quantidade_executada: e.target.value })} /></div>
              <div className="space-y-1"><Label>Unidade</Label><Input value={exec.unidade} onChange={e => setExec({ ...exec, unidade: e.target.value })} /></div>
              <div className="space-y-1 md:col-span-2"><Label>Observações</Label><Textarea rows={1} value={exec.observacoes} onChange={e => setExec({ ...exec, observacoes: e.target.value })} /></div>
            </div>
            <Button size="sm" onClick={() => execucoes.create.mutate({
              data: exec.data, hora_inicio: str(exec.hora_inicio), hora_fim: str(exec.hora_fim),
              equipe_id: str(exec.equipe_id), quantidade_executada: num(exec.quantidade_executada),
              unidade: str(exec.unidade), observacoes: str(exec.observacoes),
            })}><Plus className="h-4 w-4 mr-1" />Registrar execução</Button>

            <Table>
              <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Horário</TableHead><TableHead>Qtd.</TableHead><TableHead>Obs.</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>
                {execucoes.itens.map((e: any) => (
                  <TableRow key={e.id}>
                    <TableCell>{new Date(e.data + "T00:00:00").toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell className="text-sm">{[e.hora_inicio, e.hora_fim].filter(Boolean).join(" - ") || "-"}</TableCell>
                    <TableCell className="text-sm">{e.quantidade_executada ?? "-"} {e.unidade ?? ""}</TableCell>
                    <TableCell className="text-sm">{e.observacoes ?? "-"}</TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => execucoes.remove.mutate(e.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="materiais" className="space-y-4 mt-4">
            <div className="grid md:grid-cols-4 gap-3">
              <div className="space-y-1"><Label>Material</Label><Input value={mat.material} onChange={e => setMat({ ...mat, material: e.target.value })} /></div>
              <div className="space-y-1"><Label>Quantidade</Label><Input type="number" step="0.01" value={mat.quantidade} onChange={e => setMat({ ...mat, quantidade: e.target.value })} /></div>
              <div className="space-y-1"><Label>Unidade</Label><Input value={mat.unidade} onChange={e => setMat({ ...mat, unidade: e.target.value })} /></div>
              <div className="space-y-1"><Label>Valor (R$)</Label><Input type="number" step="0.01" value={mat.valor_utilizado} onChange={e => setMat({ ...mat, valor_utilizado: e.target.value })} /></div>
            </div>
            <Button size="sm" disabled={!mat.material} onClick={() => materiais.create.mutate({
              material: mat.material, quantidade: num(mat.quantidade), unidade: str(mat.unidade), valor_utilizado: num(mat.valor_utilizado),
            })}><Plus className="h-4 w-4 mr-1" />Adicionar material</Button>

            <Table>
              <TableHeader><TableRow><TableHead>Material</TableHead><TableHead>Qtd.</TableHead><TableHead>Valor</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>
                {materiais.itens.map((m: any) => (
                  <TableRow key={m.id}>
                    <TableCell>{m.material}</TableCell>
                    <TableCell className="text-sm">{m.quantidade ?? "-"} {m.unidade ?? ""}</TableCell>
                    <TableCell className="text-sm">{m.valor_utilizado ? Number(m.valor_utilizado).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "-"}</TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => materiais.remove.mutate(m.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="equipamentos" className="space-y-4 mt-4">
            <div className="grid md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>Equipamento</Label>
                <Select value={uso.equipamento_id || undefined} onValueChange={v => setUso({ ...uso, equipamento_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{equipamentos.map(e => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Horas utilizadas</Label><Input type="number" step="0.1" value={uso.horas_utilizadas} onChange={e => setUso({ ...uso, horas_utilizadas: e.target.value })} /></div>
              <div className="space-y-1"><Label>Km utilizados</Label><Input type="number" step="0.1" value={uso.km_utilizados} onChange={e => setUso({ ...uso, km_utilizados: e.target.value })} /></div>
            </div>
            <Button size="sm" disabled={!uso.equipamento_id} onClick={() => usosEquip.create.mutate({
              equipamento_id: uso.equipamento_id,
              equipamento_nome: equipamentos.find(e => e.id === uso.equipamento_id)?.nome ?? null,
              horas_utilizadas: num(uso.horas_utilizadas), km_utilizados: num(uso.km_utilizados),
            })}><Plus className="h-4 w-4 mr-1" />Registrar uso</Button>

            <Table>
              <TableHeader><TableRow><TableHead>Equipamento</TableHead><TableHead>Horas</TableHead><TableHead>Km</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>
                {usosEquip.itens.map((u: any) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.equipamento_nome ?? "-"}</TableCell>
                    <TableCell className="text-sm">{u.horas_utilizadas ?? "-"}</TableCell>
                    <TableCell className="text-sm">{u.km_utilizados ?? "-"}</TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => usosEquip.remove.mutate(u.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="designacoes" className="space-y-4 mt-4">
            <div className="grid md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label>Equipe</Label>
                <Select value={des.equipe_id || undefined} onValueChange={v => setDes({ ...des, equipe_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{equipes.map(e => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Responsável</Label><Input value={des.responsavel_nome} onChange={e => setDes({ ...des, responsavel_nome: e.target.value })} /></div>
              <div className="space-y-1"><Label>Prazo</Label><Input type="date" value={des.prazo} onChange={e => setDes({ ...des, prazo: e.target.value })} /></div>
              <div className="space-y-1"><Label>Observações</Label><Input value={des.observacoes} onChange={e => setDes({ ...des, observacoes: e.target.value })} /></div>
            </div>
            <Button size="sm" disabled={!des.equipe_id} onClick={() => designacoes.create.mutate({
              equipe_id: des.equipe_id,
              equipe_nome: equipes.find(e => e.id === des.equipe_id)?.nome ?? null,
              responsavel_nome: str(des.responsavel_nome), prazo: str(des.prazo), observacoes: str(des.observacoes),
              data_designacao: new Date().toISOString().slice(0, 10),
            })}><Plus className="h-4 w-4 mr-1" />Designar equipe</Button>

            <Table>
              <TableHeader><TableRow><TableHead>Equipe</TableHead><TableHead>Responsável</TableHead><TableHead>Prazo</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>
                {designacoes.itens.map((d: any) => (
                  <TableRow key={d.id}>
                    <TableCell>{d.equipe_nome ?? "-"}</TableCell>
                    <TableCell className="text-sm">{d.responsavel_nome ?? "-"}</TableCell>
                    <TableCell className="text-sm">{d.prazo ? new Date(d.prazo + "T00:00:00").toLocaleDateString("pt-BR") : "-"}</TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => designacoes.remove.mutate(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="historico" className="mt-4">
            <div className="space-y-3">
              {historico.length === 0 && <p className="text-sm text-muted-foreground">Sem registros de histórico.</p>}
              {historico.map(h => (
                <div key={h.id} className="border-l-2 border-primary/40 pl-3">
                  <div className="text-sm font-medium">{h.titulo}</div>
                  {h.descricao && <div className="text-sm text-muted-foreground">{h.descricao}</div>}
                  <div className="text-xs text-muted-foreground">{dt(h.created_at)}</div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
