import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { usePapeisUsuario } from "@/hooks/usePapeisUsuario";
import { useSecretarias } from "@/hooks/useSecretarias";
import { useUnidadesAdministrativas } from "@/hooks/useUnidadesAdministrativas";
import type { Database } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type PapelSistemico = Database["public"]["Enums"]["papel_sistemico"];

interface PapelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  papel?: Database["public"]["Tables"]["papeis_usuario"]["Row"];
}

const papeisSistemicos: { value: PapelSistemico; label: string; description: string }[] = [
  { value: "admin_municipal", label: "Admin Municipal", description: "Acesso total ao sistema" },
  { value: "secretario", label: "Secretário", description: "Gestão de secretaria" },
  { value: "secretario_adjunto", label: "Secretário Adjunto", description: "Apoio à gestão de secretaria" },
  { value: "diretor", label: "Diretor", description: "Gestão de departamento/unidade" },
  { value: "coordenador", label: "Coordenador", description: "Coordenação de área" },
  { value: "tecnico", label: "Técnico", description: "Operação técnica" },
  { value: "operador", label: "Operador", description: "Operação básica" },
  { value: "auditor", label: "Auditor", description: "Acesso somente leitura para auditoria" },
];

export function PapelDialog({ open, onOpenChange, papel }: PapelDialogProps) {
  const { createPapel, updatePapel } = usePapeisUsuario();
  const { secretarias } = useSecretarias();
  const { unidades } = useUnidadesAdministrativas();
  const isEditing = !!papel;

  // Buscar usuários do sistema
  const { data: profiles } = useQuery({
    queryKey: ["profiles_for_papel"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, email, role")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const [formData, setFormData] = useState({
    user_id: papel?.user_id || "",
    papel: (papel?.papel || "operador") as PapelSistemico,
    secretaria_id: papel?.secretaria_id || "",
    unidade_id: papel?.unidade_id || "",
    is_active: papel?.is_active ?? true,
    data_inicio: papel?.data_inicio || new Date().toISOString().split("T")[0],
    data_fim: papel?.data_fim || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      user_id: formData.user_id,
      papel: formData.papel,
      secretaria_id: formData.secretaria_id || null,
      unidade_id: formData.unidade_id || null,
      is_active: formData.is_active,
      data_inicio: formData.data_inicio,
      data_fim: formData.data_fim || null,
    };

    if (isEditing && papel) {
      await updatePapel.mutateAsync({ id: papel.id, ...payload });
    } else {
      await createPapel.mutateAsync(payload);
    }

    onOpenChange(false);
  };

  const selectedPapel = papeisSistemicos.find(p => p.value === formData.papel);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Papel" : "Atribuir Papel"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Atualize as informações do papel." : "Atribua um papel sistêmico ao usuário."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user_id">Usuário *</Label>
            <Select
              value={formData.user_id}
              onValueChange={(value) => setFormData({ ...formData, user_id: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um usuário" />
              </SelectTrigger>
              <SelectContent>
                {profiles?.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.name || "Sem nome"} ({profile.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="papel">Papel *</Label>
            <Select
              value={formData.papel}
              onValueChange={(value: PapelSistemico) => setFormData({ ...formData, papel: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {papeisSistemicos.map((papel) => (
                  <SelectItem key={papel.value} value={papel.value}>
                    {papel.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedPapel && (
              <p className="text-sm text-muted-foreground">{selectedPapel.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="secretaria_id">Secretaria (Escopo)</Label>
            <Select
              value={formData.secretaria_id}
              onValueChange={(value) => setFormData({ ...formData, secretaria_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as secretarias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as secretarias</SelectItem>
                {secretarias?.map((sec) => (
                  <SelectItem key={sec.id} value={sec.id}>
                    {sec.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unidade_id">Unidade Administrativa</Label>
            <Select
              value={formData.unidade_id}
              onValueChange={(value) => setFormData({ ...formData, unidade_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma unidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhuma</SelectItem>
                {unidades?.map((unidade) => (
                  <SelectItem key={unidade.id} value={unidade.id}>
                    {unidade.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_inicio">Data de Início</Label>
              <Input
                id="data_inicio"
                type="date"
                value={formData.data_inicio}
                onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_fim">Data de Fim</Label>
              <Input
                id="data_fim"
                type="date"
                value={formData.data_fim}
                onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Papel ativo</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createPapel.isPending || updatePapel.isPending}>
              {createPapel.isPending || updatePapel.isPending ? "Salvando..." : isEditing ? "Atualizar" : "Atribuir"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
