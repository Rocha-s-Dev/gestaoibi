import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";

type GoalTerm = Database["public"]["Enums"]["goal_term"];
type GoalStatus = Database["public"]["Enums"]["goal_status"];

interface AddGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoalAdded: () => void;
}

export function AddGoalDialog({ open, onOpenChange, onGoalAdded }: AddGoalDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    term: "short" as GoalTerm,
    status: "pending" as GoalStatus,
    department_id: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from("goals").insert({
        title: formData.title,
        description: formData.description,
        term: formData.term,
        status: formData.status,
        department_id: formData.department_id || null,
        created_by: user.id,
      });

      if (error) throw error;

      toast({
        title: "Meta criada com sucesso",
        description: "A nova meta foi adicionada ao sistema.",
      });

      onGoalAdded();
      onOpenChange(false);
      setFormData({
        title: "",
        description: "",
        term: "short" as GoalTerm,
        status: "pending" as GoalStatus,
        department_id: "",
      });
    } catch (error) {
      console.error("Error adding goal:", error);
      toast({
        title: "Erro ao criar meta",
        description: "Não foi possível criar a meta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-background">
        <DialogHeader>
          <DialogTitle>Nova Meta</DialogTitle>
          <DialogDescription>
            Crie uma nova meta preenchendo os campos abaixo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Título"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <Textarea
            placeholder="Descrição"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <Select
            value={formData.department_id}
            onValueChange={(value) => setFormData({ ...formData, department_id: value })}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Selecione a secretaria" />
            </SelectTrigger>
            <SelectContent>
              {departments?.map((department) => (
                <SelectItem key={department.id} value={department.id}>
                  {department.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={formData.term}
            onValueChange={(value: GoalTerm) => setFormData({ ...formData, term: value })}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Prazo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short">Curto Prazo</SelectItem>
              <SelectItem value="medium">Médio Prazo</SelectItem>
              <SelectItem value="long">Longo Prazo</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={formData.status}
            onValueChange={(value: GoalStatus) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="in_progress">Em Andamento</SelectItem>
              <SelectItem value="delayed">Atrasada</SelectItem>
              <SelectItem value="completed">Concluída</SelectItem>
              <SelectItem value="cancelled">Cancelada</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar Meta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}