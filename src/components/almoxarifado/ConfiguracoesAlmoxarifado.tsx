import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Loader2, Tags, Ruler, MapPin } from "lucide-react";
import { toast } from "sonner";
import {
  AlmoxarifadoCategoria,
  AlmoxarifadoLocalizacao,
  AlmoxarifadoUnidadeMedida,
  useAlmoxarifadoCategorias,
  useAlmoxarifadoLocalizacoes,
  useAlmoxarifadoMateriais,
  useAlmoxarifadoUnidades,
} from "@/hooks/useAlmoxarifado";

const StatusBadge = ({ ativo }: { ativo: boolean }) => (
  <Badge variant={ativo ? "default" : "secondary"}>{ativo ? "Ativo" : "Inativo"}</Badge>
);

/* ------------------------- Categorias ------------------------- */

function CategoriasCard() {
  const { categorias, isLoading, salvar } = useAlmoxarifadoCategorias();
  const { itens } = useAlmoxarifadoMateriais();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AlmoxarifadoCategoria | null>(null);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [ativo, setAtivo] = useState(true);

  useEffect(() => {
    if (!open) return;
    setNome(editing?.nome ?? "");
    setDescricao(editing?.descricao ?? "");
    setAtivo(editing?.ativo ?? true);
  }, [open, editing]);

  const submit = async () => {
    if (!nome.trim()) return toast.error("Informe o nome da categoria.");
    try {
      await salvar.mutateAsync({ id: editing?.id, nome, descricao: descricao || null, ativo });
      setOpen(false);
    } catch { /* toast no hook */ }
  };

  const qtd = (id: string) => itens.filter((i) => i.categoria_id === id).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2"><Tags className="h-5 w-5 text-primary" /> Categorias</CardTitle>
        <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Nova
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : categorias.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Nenhuma categoria cadastrada.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Materiais</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categorias.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.nome}</TableCell>
                    <TableCell className="text-muted-foreground">{c.descricao ?? "—"}</TableCell>
                    <TableCell className="text-right">{qtd(c.id)}</TableCell>
                    <TableCell><StatusBadge ativo={c.ativo} /></TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => { setEditing(c); setOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar categoria" : "Nova categoria"}</DialogTitle>
            <DialogDescription>Categorias não são excluídas, apenas inativadas.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Nome *</Label><Input value={nome} onChange={(e) => setNome(e.target.value)} /></div>
            <div className="space-y-2"><Label>Descrição</Label><Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={2} /></div>
            {editing && (
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label>Ativa</Label>
                <Switch checked={ativo} onCheckedChange={setAtivo} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={submit} disabled={salvar.isPending}>
              {salvar.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

/* ------------------------- Unidades ------------------------- */

function UnidadesCard() {
  const { unidades, isLoading, salvar } = useAlmoxarifadoUnidades();
  const { itens } = useAlmoxarifadoMateriais();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AlmoxarifadoUnidadeMedida | null>(null);
  const [sigla, setSigla] = useState("");
  const [nome, setNome] = useState("");
  const [ativo, setAtivo] = useState(true);

  useEffect(() => {
    if (!open) return;
    setSigla(editing?.sigla ?? "");
    setNome(editing?.nome ?? "");
    setAtivo(editing?.ativo ?? true);
  }, [open, editing]);

  const submit = async () => {
    if (!sigla.trim()) return toast.error("Informe a sigla.");
    if (!nome.trim()) return toast.error("Informe o nome da unidade.");
    try {
      await salvar.mutateAsync({ id: editing?.id, sigla, nome, ativo });
      setOpen(false);
    } catch { /* toast no hook */ }
  };

  const qtd = (id: string) => itens.filter((i) => i.unidade_medida_id === id).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2"><Ruler className="h-5 w-5 text-primary" /> Unidades de medida</CardTitle>
        <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Nova
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : unidades.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Nenhuma unidade cadastrada.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sigla</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead className="text-right">Materiais</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unidades.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-mono">{u.sigla}</TableCell>
                    <TableCell>{u.nome}</TableCell>
                    <TableCell className="text-right">{qtd(u.id)}</TableCell>
                    <TableCell><StatusBadge ativo={u.ativo} /></TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => { setEditing(u); setOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar unidade" : "Nova unidade de medida"}</DialogTitle>
            <DialogDescription>Unidades não são excluídas, apenas inativadas.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Sigla *</Label><Input value={sigla} onChange={(e) => setSigla(e.target.value)} placeholder="UN" /></div>
            <div className="space-y-2"><Label>Nome *</Label><Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Unidade" /></div>
            {editing && (
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label>Ativa</Label>
                <Switch checked={ativo} onCheckedChange={setAtivo} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={submit} disabled={salvar.isPending}>
              {salvar.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

/* ------------------------- Localizações ------------------------- */

function LocalizacoesCard() {
  const { localizacoes, isLoading, salvar } = useAlmoxarifadoLocalizacoes();
  const { itens } = useAlmoxarifadoMateriais();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AlmoxarifadoLocalizacao | null>(null);
  const [nome, setNome] = useState("");
  const [codigo, setCodigo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [ativo, setAtivo] = useState(true);

  useEffect(() => {
    if (!open) return;
    setNome(editing?.nome ?? "");
    setCodigo(editing?.codigo ?? "");
    setDescricao(editing?.descricao ?? "");
    setAtivo(editing?.ativo ?? true);
  }, [open, editing]);

  const submit = async () => {
    if (!nome.trim()) return toast.error("Informe o nome da localização.");
    try {
      await salvar.mutateAsync({ id: editing?.id, nome, codigo: codigo || null, descricao: descricao || null, ativo });
      setOpen(false);
    } catch { /* toast no hook */ }
  };

  const qtd = (id: string) => itens.filter((i) => i.localizacao_id === id).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Localizações</CardTitle>
        <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Nova
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : localizacoes.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Nenhuma localização cadastrada.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Materiais</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {localizacoes.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-mono text-xs">{l.codigo ?? "—"}</TableCell>
                    <TableCell className="font-medium">{l.nome}</TableCell>
                    <TableCell className="text-muted-foreground">{l.descricao ?? "—"}</TableCell>
                    <TableCell className="text-right">{qtd(l.id)}</TableCell>
                    <TableCell><StatusBadge ativo={l.ativo} /></TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => { setEditing(l); setOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar localização" : "Nova localização"}</DialogTitle>
            <DialogDescription>Localizações não são excluídas, apenas inativadas.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Nome *</Label><Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Almoxarifado Central" /></div>
            <div className="space-y-2"><Label>Código</Label><Input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="ALM-01" /></div>
            <div className="space-y-2"><Label>Descrição</Label><Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={2} placeholder="Prédio, setor, corredor, estante..." /></div>
            {editing && (
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label>Ativa</Label>
                <Switch checked={ativo} onCheckedChange={setAtivo} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={submit} disabled={salvar.isPending}>
              {salvar.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export function ConfiguracoesAlmoxarifado() {
  return (
    <div className="space-y-6">
      <CategoriasCard />
      <UnidadesCard />
      <LocalizacoesCard />
    </div>
  );
}
