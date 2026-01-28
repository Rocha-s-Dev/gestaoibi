import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Dependente {
  id: string;
  servidor_id: string;
  nome: string;
  cpf: string | null;
  data_nascimento: string;
  parentesco: string;
  sexo: string | null;
  possui_deficiencia: boolean;
  descricao_deficiencia: string | null;
  ir_dependente: boolean;
  plano_saude_dependente: boolean;
  salario_familia_dependente: boolean;
  ativo: boolean;
}

interface DependentesTabProps {
  servidorId: string;
}

const PARENTESCO_OPTIONS = [
  { value: "conjuge", label: "Cônjuge" },
  { value: "filho", label: "Filho" },
  { value: "filha", label: "Filha" },
  { value: "enteado", label: "Enteado" },
  { value: "enteada", label: "Enteada" },
  { value: "pai", label: "Pai" },
  { value: "mae", label: "Mãe" },
  { value: "irmao", label: "Irmão" },
  { value: "irma", label: "Irmã" },
  { value: "outro", label: "Outro" },
];

export function DependentesTab({ servidorId }: DependentesTabProps) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDependente, setEditingDependente] = useState<Dependente | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    data_nascimento: "",
    parentesco: "",
    sexo: "",
    possui_deficiencia: false,
    descricao_deficiencia: "",
    ir_dependente: false,
    plano_saude_dependente: false,
    salario_familia_dependente: false,
  });

  const { data: dependentes, isLoading } = useQuery({
    queryKey: ["dependentes", servidorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dependentes")
        .select("*")
        .eq("servidor_id", servidorId)
        .eq("ativo", true)
        .order("nome");
      if (error) throw error;
      return data as Dependente[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      const payload = {
        servidor_id: servidorId,
        nome: data.nome,
        cpf: data.cpf || null,
        data_nascimento: data.data_nascimento,
        parentesco: data.parentesco,
        sexo: data.sexo || null,
        possui_deficiencia: data.possui_deficiencia,
        descricao_deficiencia: data.descricao_deficiencia || null,
        ir_dependente: data.ir_dependente,
        plano_saude_dependente: data.plano_saude_dependente,
        salario_familia_dependente: data.salario_familia_dependente,
      };

      if (data.id) {
        const { error } = await supabase
          .from("dependentes")
          .update(payload)
          .eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("dependentes").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dependentes", servidorId] });
      toast.success(editingDependente ? "Dependente atualizado!" : "Dependente adicionado!");
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao salvar dependente");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("dependentes")
        .update({ ativo: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dependentes", servidorId] });
      toast.success("Dependente removido!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao remover dependente");
    },
  });

  const resetForm = () => {
    setFormData({
      nome: "",
      cpf: "",
      data_nascimento: "",
      parentesco: "",
      sexo: "",
      possui_deficiencia: false,
      descricao_deficiencia: "",
      ir_dependente: false,
      plano_saude_dependente: false,
      salario_familia_dependente: false,
    });
    setEditingDependente(null);
  };

  const handleEdit = (dependente: Dependente) => {
    setEditingDependente(dependente);
    setFormData({
      nome: dependente.nome,
      cpf: dependente.cpf || "",
      data_nascimento: dependente.data_nascimento,
      parentesco: dependente.parentesco,
      sexo: dependente.sexo || "",
      possui_deficiencia: dependente.possui_deficiencia,
      descricao_deficiencia: dependente.descricao_deficiencia || "",
      ir_dependente: dependente.ir_dependente,
      plano_saude_dependente: dependente.plano_saude_dependente,
      salario_familia_dependente: dependente.salario_familia_dependente,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({ ...formData, id: editingDependente?.id });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-semibold">Dependentes</h4>
        <Button
          size="sm"
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          Adicionar
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>
      ) : dependentes?.length === 0 ? (
        <p className="text-muted-foreground text-center py-4">
          Nenhum dependente cadastrado.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Parentesco</TableHead>
              <TableHead>Nascimento</TableHead>
              <TableHead>Benefícios</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dependentes?.map((dep) => (
              <TableRow key={dep.id}>
                <TableCell className="font-medium">{dep.nome}</TableCell>
                <TableCell>
                  {PARENTESCO_OPTIONS.find((p) => p.value === dep.parentesco)?.label}
                </TableCell>
                <TableCell>{format(new Date(dep.data_nascimento), "dd/MM/yyyy")}</TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {dep.ir_dependente && <Badge variant="outline">IR</Badge>}
                    {dep.plano_saude_dependente && <Badge variant="outline">Plano</Badge>}
                    {dep.salario_familia_dependente && <Badge variant="outline">Sal. Família</Badge>}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(dep)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(dep.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingDependente ? "Editar Dependente" : "Novo Dependente"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="dep_nome">Nome *</Label>
                <Input
                  id="dep_nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dep_cpf">CPF</Label>
                <Input
                  id="dep_cpf"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dep_nascimento">Data de Nascimento *</Label>
                <Input
                  id="dep_nascimento"
                  type="date"
                  value={formData.data_nascimento}
                  onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dep_parentesco">Parentesco *</Label>
                <Select
                  value={formData.parentesco}
                  onValueChange={(v) => setFormData({ ...formData, parentesco: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {PARENTESCO_OPTIONS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dep_sexo">Sexo</Label>
                <Select
                  value={formData.sexo}
                  onValueChange={(v) => setFormData({ ...formData, sexo: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Feminino</SelectItem>
                    <SelectItem value="O">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Benefícios</Label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ir_dep"
                    checked={formData.ir_dependente}
                    onCheckedChange={(c) => setFormData({ ...formData, ir_dependente: !!c })}
                  />
                  <Label htmlFor="ir_dep" className="text-sm">Dependente IR</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="plano_dep"
                    checked={formData.plano_saude_dependente}
                    onCheckedChange={(c) => setFormData({ ...formData, plano_saude_dependente: !!c })}
                  />
                  <Label htmlFor="plano_dep" className="text-sm">Plano de Saúde</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sal_familia"
                    checked={formData.salario_familia_dependente}
                    onCheckedChange={(c) => setFormData({ ...formData, salario_familia_dependente: !!c })}
                  />
                  <Label htmlFor="sal_familia" className="text-sm">Salário Família</Label>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="deficiencia"
                checked={formData.possui_deficiencia}
                onCheckedChange={(c) => setFormData({ ...formData, possui_deficiencia: !!c })}
              />
              <Label htmlFor="deficiencia" className="text-sm">Possui Deficiência</Label>
            </div>

            {formData.possui_deficiencia && (
              <div className="space-y-2">
                <Label htmlFor="desc_deficiencia">Descrição da Deficiência</Label>
                <Input
                  id="desc_deficiencia"
                  value={formData.descricao_deficiencia}
                  onChange={(e) => setFormData({ ...formData, descricao_deficiencia: e.target.value })}
                />
              </div>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
