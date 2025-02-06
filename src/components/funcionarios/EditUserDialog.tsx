import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EditUserDialogProps {
  user: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    department_id: string | null;
    role: string;
  };
}

export const EditUserDialog = ({ user }: EditUserDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user.first_name || "",
    lastName: user.last_name || "",
    department_id: user.department_id || "",
    role: user.role,
  });

  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          department_id: formData.department_id,
          role: formData.role,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Usuário atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      setOpen(false);
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      toast.error("Erro ao atualizar usuário. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Funcionário</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Nome"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
            <Input
              placeholder="Sobrenome"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>
          <Input
            placeholder="ID do Departamento"
            value={formData.department_id}
            onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
            required
          />
          <Select
            value={formData.role}
            onValueChange={(value) => setFormData({ ...formData, role: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o cargo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="mayor">Prefeito</SelectItem>
              <SelectItem value="secretary">Secretário</SelectItem>
              <SelectItem value="employee">Funcionário</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Atualizando..." : "Atualizar Funcionário"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};