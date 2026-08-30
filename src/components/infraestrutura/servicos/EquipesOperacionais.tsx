import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Users } from "lucide-react";
import { ESPECIALIDADES_EQUIPE, ServicoEquipe, useEquipeMembros, useServicosEquipes } from "@/hooks/useServicosEquipes";
import { useUsuariosRH } from "@/hooks/useUsuariosRH";

function MembrosPanel({ equipe }: { equipe: ServicoEquipe }) {
  const { membros, addMembro, removeMembro } = useEquipeMembros(equipe.id);
  const { usuarios, loading, buscarUsuarios, limparBusca } = useUsuariosRH();
  const [termo, setTermo] = useState("");
  const [funcao, setFuncao] = useState("");

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-3">
        <div className="space-y-1 md:col-span-2">
          <Label>Buscar servidor no RH central (nome, CPF ou matrícula)</Label>
          <Input value={termo} onChange={e => { setTermo(e.target.value); buscarUsuarios(e.target.value); }} placeholder="Digite ao menos 2 caracteres" />
        </div>
        <div className="space-y-1">
          <Label>Função na equipe</Label>
          <Input value={funcao} onChange={e => setFuncao(e.target.value)} placeholder="Ex.: Eletricista" />
        </div>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Buscando...</p>}
      {usuarios.length > 0 && (
        <div className="border rounded-md divide-y max-h-48 overflow-y-auto">
          {usuarios.map(u => (
            <div key={u.user_id} className="flex items-center justify-between p-2">
              <div>
                <div className="text-sm font-medium">{u.nome}</div>
                <div className="text-xs text-muted-foreground">{u.email} {u.matricula ? `· Mat. ${u.matricula}` : ""}</div>
              </div>
              <Button size="sm" variant="outline" onClick={() => {
                addMembro.mutate({ profile_id: u.user_id, nome: u.nome, funcao: funcao || null });
                setTermo(""); setFuncao(""); limparBusca();
              }}>Adicionar</Button>
            </div>
          ))}
        </div>
      )}

      <Table>
        <TableHeader><TableRow><TableHead>Membro</TableHead><TableHead>Função</TableHead><TableHead /></TableRow></TableHeader>
        <TableBody>
          {membros.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-4">Nenhum membro vinculado.</TableCell></TableRow>}
          {membros.map(m => (
            <TableRow key={m.id}>
              <TableCell>{m.nome}</TableCell>
              <TableCell className="text-sm">{m.funcao ?? "-"}</TableCell>
              <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => removeMembro.mutate(m.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="text-xs text-muted-foreground">Os servidores permanecem cadastrados no RH central; aqui apenas o vínculo com a equipe é gerenciado.</p>
    </div>
  );
}

const emptyForm = { nome: "", especialidade: "geral", supervisor_nome: "", veiculo_descricao: "", equipamentos: "", status: "ativa", em_campo: false, observacoes: "" };

export function EquipesOperacionais() {
  const { equipes, isLoading, createEquipe, updateEquipe, deleteEquipe } = useServicosEquipes();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(emptyForm);
  const [editing, setEditing] = useState<ServicoEquipe | null>(null);
  const [membrosOf, setMembrosOf] = useState<ServicoEquipe | null>(null);

  const submit = async () => {
    const payload = {
      nome: form.nome, especialidade: form.especialidade,
      supervisor_nome: form.supervisor_nome || null,
      veiculo_descricao: form.veiculo_descricao || null,
      equipamentos: form.equipamentos || null,
      status: form.status, em_campo: form.em_campo,
      observacoes: form.observacoes || null,
    };
    if (editing) await updateEquipe.mutateAsync({ id: editing.id, ...payload });
    else await createEquipe.mutateAsync(payload);
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">{equipes.length} equipe(s) cadastrada(s)</div>
        <Button onClick={() => { setEditing(null); setForm(emptyForm); setOpen(true); }}><Plus className="h-4 w-4 mr-2" />Nova Equipe</Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Equipe</TableHead><TableHead>Supervisor</TableHead><TableHead>Veículo</TableHead>
            <TableHead>Situação</TableHead><TableHead className="text-right">Ações</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">Carregando...</TableCell></TableRow>}
            {!isLoading && equipes.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">Nenhuma equipe cadastrada.</TableCell></TableRow>}
            {equipes.map(e => (
              <TableRow key={e.id}>
                <TableCell>
                  <div className="font-medium">{e.nome}</div>
                  <div className="text-xs text-muted-foreground">
                    {ESPECIALIDADES_EQUIPE.find(x => x.value === e.especialidade)?.label ?? e.especialidade}
                  </div>
                </TableCell>
                <TableCell className="text-sm">{e.supervisor_nome ?? "-"}</TableCell>
                <TableCell className="text-sm">{e.veiculo_descricao ?? "-"}</TableCell>
                <TableCell>
                  <Badge variant={e.status === "ativa" ? "default" : "secondary"}>{e.status}</Badge>
                  {e.em_campo && <Badge variant="outline" className="ml-1">Em campo</Badge>}
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => setMembrosOf(e)}><Users className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => {
                    setEditing(e);
                    setForm({
                      nome: e.nome, especialidade: e.especialidade ?? "geral",
                      supervisor_nome: e.supervisor_nome ?? "", veiculo_descricao: e.veiculo_descricao ?? "",
                      equipamentos: e.equipamentos ?? "", status: e.status, em_campo: e.em_campo,
                      observacoes: e.observacoes ?? "",
                    });
                    setOpen(true);
                  }}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteEquipe.mutate(e.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? "Editar equipe" : "Nova equipe operacional"}</DialogTitle></DialogHeader>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1"><Label>Nome da equipe *</Label><Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} /></div>
            <div className="space-y-1">
              <Label>Especialidade</Label>
              <Select value={form.especialidade} onValueChange={v => setForm({ ...form, especialidade: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ESPECIALIDADES_EQUIPE.map(x => <SelectItem key={x.value} value={x.value}>{x.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Supervisor</Label><Input value={form.supervisor_nome} onChange={e => setForm({ ...form, supervisor_nome: e.target.value })} /></div>
            <div className="space-y-1"><Label>Veículo</Label><Input value={form.veiculo_descricao} onChange={e => setForm({ ...form, veiculo_descricao: e.target.value })} /></div>
            <div className="space-y-1">
              <Label>Situação</Label>
              <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativa">Ativa</SelectItem>
                  <SelectItem value="inativa">Inativa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Em campo</Label>
              <Select value={form.em_campo ? "sim" : "nao"} onValueChange={v => setForm({ ...form, em_campo: v === "sim" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="sim">Sim</SelectItem><SelectItem value="nao">Não</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1 md:col-span-2"><Label>Equipamentos</Label><Input value={form.equipamentos} onChange={e => setForm({ ...form, equipamentos: e.target.value })} /></div>
            <div className="space-y-1 md:col-span-2"><Label>Observações</Label><Textarea rows={2} value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={submit} disabled={!form.nome}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!membrosOf} onOpenChange={v => !v && setMembrosOf(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Membros — {membrosOf?.nome}</DialogTitle></DialogHeader>
          {membrosOf && <MembrosPanel equipe={membrosOf} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
