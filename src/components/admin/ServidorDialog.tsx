import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
  department: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

interface ServidorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servidor?: Profile;
}

export function ServidorDialog({ open, onOpenChange, servidor }: ServidorDialogProps) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    department_id: "",
    role: "employee",
  });

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .order("name");
      if (error) throw error;
      return data || [];
    },
    enabled: open,
  });

  useEffect(() => {
    if (servidor) {
      const nameParts = servidor.name?.split(" ") || [];
      setFormData({
        email: servidor.email || "",
        password: "",
        confirmPassword: "",
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        department_id: servidor.department || "",
        role: servidor.role,
      });
    } else {
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
        department_id: "",
        role: "employee",
      });
    }
    setPasswordError("");
  }, [servidor, open]);

  const validatePasswords = () => {
    setPasswordError("");
    
    if (!servidor) {
      if (!formData.password) {
        setPasswordError("Senha é obrigatória");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setPasswordError("As senhas não coincidem");
        return false;
      }
      if (formData.password.length < 6) {
        setPasswordError("A senha deve ter pelo menos 6 caracteres");
        return false;
      }
    } else {
      if (formData.password || formData.confirmPassword) {
        if (formData.password !== formData.confirmPassword) {
          setPasswordError("As senhas não coincidem");
          return false;
        }
        if (formData.password.length < 6) {
          setPasswordError("A senha deve ter pelo menos 6 caracteres");
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswords()) return;
    
    setLoading(true);

    try {
      const isValidUUID =
        formData.department_id &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          formData.department_id
        );
      const departmentValue = isValidUUID ? formData.department_id : null;

      if (servidor) {
        const { error } = await supabase
          .from("profiles")
          .update({
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            email: formData.email || null,
            department: departmentValue,
            role: formData.role,
          })
          .eq("id", servidor.id);

        if (error) throw error;

        if (formData.password) {
          const { error: pwError } = await supabase.functions.invoke(
            "update-user-password",
            { body: { userId: servidor.id, password: formData.password } }
          );
          if (pwError) throw pwError;
        }

        toast.success("Servidor atualizado com sucesso!");
      } else {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              first_name: formData.firstName,
              last_name: formData.lastName,
            },
          },
        });

        if (authError) throw authError;

        if (authData.user) {
          const { error: profileError } = await supabase
            .from("profiles")
            .update({
              name: `${formData.firstName} ${formData.lastName}`.trim(),
              department: departmentValue,
              role: formData.role,
              email: formData.email,
            })
            .eq("id", authData.user.id);

          if (profileError) throw profileError;
        }

        toast.success("Servidor criado com sucesso!");
      }

      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erro:", error);
      toast.error(error.message || "Erro ao salvar servidor. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {servidor ? "Editar Servidor" : "Novo Servidor"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Informações Pessoais</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nome</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Sobrenome</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required={!servidor}
                  disabled={!!servidor}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold">
              {servidor ? "Alterar Senha" : "Informações de Acesso"}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">
                  {servidor ? "Nova Senha" : "Senha"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required={!servidor}
                  placeholder={servidor ? "Deixe em branco para manter" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  required={!servidor}
                />
              </div>
            </div>
            {passwordError && (
              <p className="text-sm text-destructive mt-1">{passwordError}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              A senha deve ter pelo menos 6 caracteres.
              {servidor && " Deixe em branco para manter a senha atual."}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Informações Profissionais</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department_id">Departamento</Label>
                <Select
                  value={formData.department_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, department_id: value })
                  }
                >
                  <SelectTrigger id="department_id">
                    <SelectValue placeholder="Selecione o departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum departamento</SelectItem>
                    {departments?.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Cargo</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Selecione o cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="mayor">Prefeito</SelectItem>
                    <SelectItem value="secretary">Secretário</SelectItem>
                    <SelectItem value="employee">Funcionário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? servidor
                ? "Atualizando..."
                : "Criando..."
              : servidor
              ? "Atualizar Servidor"
              : "Criar Servidor"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
