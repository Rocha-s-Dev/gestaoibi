import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Escola } from "@/hooks/useEscolas";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

type DiretorOption = {
  user_id: string;
  nome: string;
  role: string;
};

type NovaEscolaDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (escola: Omit<Escola, "id"> | Escola) => void;
  escola?: Escola | null;
};

export function NovaEscolaDialog({ open, onOpenChange, onSubmit, escola }: NovaEscolaDialogProps) {
  const [formData, setFormData] = useState({
    nome: "",
    endereco: "",
    telefone: "",
    email: "",
    diretor_id: "",
    vice_diretor_id: "",
    tipo: "municipal",
    modalidade: "fundamental_i",
    capacidade: 0
  });

  // Fetch directors and vice-directors from user_education_roles
  const { data: diretores = [] } = useQuery<DiretorOption[]>({
    queryKey: ["diretores_educacao"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_education_roles")
        .select("user_id, role")
        .in("role", ["diretor", "vice_diretor"]);

      if (error) throw error;
      if (!data || data.length === 0) return [];

      // Fetch profile names
      const userIds = [...new Set(data.map(d => d.user_id))];
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("user_id, name")
        .in("user_id", userIds);

      if (profileError) throw profileError;

      const nameMap = new Map((profiles || []).map(p => [p.user_id, p.name || "Sem nome"]));

      return data.map(d => ({
        user_id: d.user_id,
        nome: nameMap.get(d.user_id) || "Sem nome",
        role: d.role as string
      }));
    },
    enabled: open,
  });

  const diretoresOnly = diretores.filter(d => d.role === "diretor");
  const viceDiretoresOnly = diretores.filter(d => d.role === "vice_diretor");

  useEffect(() => {
    if (escola) {
      setFormData({
        nome: escola.nome,
        endereco: escola.endereco || "",
        telefone: escola.telefone || "",
        email: escola.email || "",
        diretor_id: escola.diretor_id || "",
        vice_diretor_id: escola.vice_diretor_id || "",
        tipo: escola.tipo || "municipal",
        modalidade: escola.modalidade || "fundamental_i",
        capacidade: escola.capacidade || 0
      });
    } else {
      setFormData({
        nome: "",
        endereco: "",
        telefone: "",
        email: "",
        diretor_id: "",
        vice_diretor_id: "",
        tipo: "municipal",
        modalidade: "fundamental_i",
        capacidade: 0
      });
    }
  }, [escola]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      nome: formData.nome,
      endereco: formData.endereco || null,
      telefone: formData.telefone || null,
      email: formData.email || null,
      diretor_id: formData.diretor_id || null,
      vice_diretor_id: formData.vice_diretor_id || null,
      tipo: formData.tipo,
      modalidade: formData.modalidade,
      capacidade: formData.capacidade || null,
      // Keep legacy diretor field populated with the name for backwards compat
      diretor: diretores.find(d => d.user_id === formData.diretor_id)?.nome || null,
    };

    if (escola) {
      onSubmit({ ...submitData, id: escola.id });
    } else {
      onSubmit(submitData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {escola ? "Editar Escola" : "Nova Escola"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Escola *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Ex: EMEF Dom Pedro II"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) =>
                  setFormData(prev => ({ ...prev, tipo: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="municipal">Municipal</SelectItem>
                  <SelectItem value="estadual">Estadual</SelectItem>
                  <SelectItem value="federal">Federal</SelectItem>
                  <SelectItem value="privada">Privada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="modalidade">Modalidade *</Label>
              <Select
                value={formData.modalidade}
                onValueChange={(value) =>
                  setFormData(prev => ({ ...prev, modalidade: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="creche">Creche</SelectItem>
                  <SelectItem value="anos_iniciais">Anos Iniciais</SelectItem>
                  <SelectItem value="fundamental_i">Fundamental I</SelectItem>
                  <SelectItem value="fundamental_ii">Fundamental II</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Textarea
              id="endereco"
              value={formData.endereco}
              onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
              placeholder="Rua, número, bairro, cidade"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                placeholder="(11) 3456-7890"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="escola@educacao.gov.br"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Diretor(a)</Label>
              <Select
                value={formData.diretor_id || "none"}
                onValueChange={(value) =>
                  setFormData(prev => ({ ...prev, diretor_id: value === "none" ? "" : value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o diretor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {diretoresOnly.map((d) => (
                    <SelectItem key={d.user_id} value={d.user_id}>
                      {d.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {diretoresOnly.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Nenhum diretor cadastrado nos Papéis Administrativos.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Vice-Diretor(a)</Label>
              <Select
                value={formData.vice_diretor_id || "none"}
                onValueChange={(value) =>
                  setFormData(prev => ({ ...prev, vice_diretor_id: value === "none" ? "" : value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o vice-diretor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {viceDiretoresOnly.map((d) => (
                    <SelectItem key={d.user_id} value={d.user_id}>
                      {d.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {viceDiretoresOnly.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Nenhum vice-diretor cadastrado nos Papéis Administrativos.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacidade">Capacidade de Alunos</Label>
            <Input
              id="capacidade"
              type="number"
              value={formData.capacidade}
              onChange={(e) => setFormData(prev => ({ ...prev, capacidade: parseInt(e.target.value) || 0 }))}
              placeholder="0"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {escola ? "Atualizar" : "Cadastrar"} Escola
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
