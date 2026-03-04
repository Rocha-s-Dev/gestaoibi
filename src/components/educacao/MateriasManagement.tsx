import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { useDisciplinas, Disciplina } from "@/hooks/useDisciplinas";

export function MateriasManagement() {
  const { disciplinas, loading, createDisciplina, updateDisciplina, deleteDisciplina } = useDisciplinas();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDisciplina, setSelectedDisciplina] = useState<Disciplina | null>(null);
  const [formData, setFormData] = useState({ nome: "", codigo: "", carga_horaria: "" });

  const openNew = () => {
    setSelectedDisciplina(null);
    setFormData({ nome: "", codigo: "", carga_horaria: "" });
    setDialogOpen(true);
  };

  const openEdit = (d: Disciplina) => {
    setSelectedDisciplina(d);
    setFormData({
      nome: d.nome,
      codigo: d.codigo || "",
      carga_horaria: d.carga_horaria?.toString() || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        nome: formData.nome,
        codigo: formData.codigo || null,
        carga_horaria: formData.carga_horaria ? parseInt(formData.carga_horaria) : null,
      };
      if (selectedDisciplina) {
        await updateDisciplina(selectedDisciplina.id, data);
        toast.success("Matéria atualizada!");
      } else {
        await createDisciplina(data);
        toast.success("Matéria cadastrada!");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Erro ao salvar matéria.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta matéria?")) return;
    try {
      await deleteDisciplina(id);
      toast.success("Matéria excluída!");
    } catch {
      toast.error("Erro ao excluir matéria. Pode estar vinculada a professores ou notas.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Matérias Cadastradas</h2>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Matéria
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8"><p>Carregando matérias...</p></div>
      ) : disciplinas.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhuma matéria cadastrada. Clique em "Nova Matéria" para começar.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Carga Horária (h)</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disciplinas.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        {d.nome}
                      </div>
                    </TableCell>
                    <TableCell>{d.codigo || "-"}</TableCell>
                    <TableCell>{d.carga_horaria || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(d)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(d.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedDisciplina ? "Editar Matéria" : "Nova Matéria"}</DialogTitle>
            <DialogDescription>
              {selectedDisciplina ? "Atualize os dados da matéria." : "Cadastre uma nova matéria/disciplina no sistema."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Matéria *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Ex: Matemática, Português, Ciências..."
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  value={formData.codigo}
                  onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                  placeholder="Ex: MAT, POR"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carga_horaria">Carga Horária (h/ano)</Label>
                <Input
                  id="carga_horaria"
                  type="number"
                  value={formData.carga_horaria}
                  onChange={(e) => setFormData(prev => ({ ...prev, carga_horaria: e.target.value }))}
                  placeholder="Ex: 120"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit">{selectedDisciplina ? "Atualizar" : "Cadastrar"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
