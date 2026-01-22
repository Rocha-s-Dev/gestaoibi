
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

interface EditUserDialogProps {
  user: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    department_id: string | null;
    role: string;
    email?: string | null;
    endereco?: string | null;
    numero_endereco?: string | null;
    bairro?: string | null;
    cidade?: string | null;
    estado?: string | null;
    pais?: string | null;
    cpf?: string | null;
    rg?: string | null;
    data_nascimento?: string | null;
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
    email: user.email || "",
    endereco: user.endereco || "",
    numero_endereco: user.numero_endereco || "",
    bairro: user.bairro || "",
    cidade: user.cidade || "",
    estado: user.estado || "",
    pais: user.pais || "Brasil",
    cpf: user.cpf || "",
    rg: user.rg || "",
    data_nascimento: user.data_nascimento ? user.data_nascimento.split('T')[0] : "",
    password: "", // New password field
    confirmPassword: "", // Confirm password field
  });
  
  const [passwordError, setPasswordError] = useState("");

  // Buscar departamentos para exibir em um select
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
    enabled: open, // Só busca quando o modal estiver aberto
  });

  const queryClient = useQueryClient();

  const validatePasswords = () => {
    // Reset previous error
    setPasswordError("");
    
    // If both password fields are empty, we're not changing the password
    if (!formData.password && !formData.confirmPassword) {
      return true;
    }
    
    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("As senhas não coincidem");
      return false;
    }
    
    // Check password length
    if (formData.password.length < 6) {
      setPasswordError("A senha deve ter pelo menos 6 caracteres");
      return false;
    }
    
    return true;
  };

  const updateUserPassword = async (userId: string, password: string) => {
    try {
      // Use .invoke and add specific error handling
      const { data, error } = await supabase.functions.invoke('update-user-password', {
        body: { userId, password }
      });

      if (error) {
        console.error("Error details:", error);
        throw new Error(error.message || "Erro ao atualizar senha");
      }

      // Check for application-level errors in the response
      if (data && data.error) {
        console.error("Application error:", data.error);
        throw new Error(data.error);
      }

      return { success: true };
    } catch (error) {
      console.error("Erro ao chamar a função de atualização de senha:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords before proceeding
    if (!validatePasswords()) {
      return;
    }
    
    setLoading(true);

    try {
      // Validar se department_id é um UUID válido ou deixar como null
      const isValidUUID = 
        formData.department_id && 
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(formData.department_id);
      
      // Prepare data for update, ensuring proper data formatting
      const updateData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        department_id: isValidUUID ? formData.department_id : null,
        role: formData.role,
        email: formData.email || null,
        endereco: formData.endereco || null,
        numero_endereco: formData.numero_endereco || null,
        bairro: formData.bairro || null,
        cidade: formData.cidade || null,
        estado: formData.estado || null,
        pais: formData.pais || "Brasil",
        cpf: formData.cpf || null,
        rg: formData.rg || null,
        data_nascimento: formData.data_nascimento || null,
      };
      
      console.log("Atualizando usuário com os dados:", updateData);
      
      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);

      if (error) {
        console.error("Erro detalhado:", error);
        throw error;
      }
      
      // Handle password update if a new password was provided
      if (formData.password) {
        try {
          await updateUserPassword(user.id, formData.password);
          // Only show success message if password update succeeds
        } catch (error) {
          console.error("Password update failed:", error);
          toast.error("Erro ao atualizar senha: " + (error.message || "Tente novamente"));
          setLoading(false);
          return;
        }
      }

      toast.success("Usuário atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      setOpen(false);
      
      // Reset password fields
      setFormData({
        ...formData,
        password: "",
        confirmPassword: ""
      });
      
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
      <DialogContent className="sm:max-w-[650px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Funcionário</DialogTitle>
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
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Sobrenome</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                <Input
                  id="data_nascimento"
                  type="date"
                  value={formData.data_nascimento}
                  onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rg">RG</Label>
                <Input
                  id="rg"
                  value={formData.rg}
                  onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Informações Profissionais</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department_id">Departamento</Label>
                <Select
                  value={formData.department_id}
                  onValueChange={(value) => setFormData({ ...formData, department_id: value })}
                >
                  <SelectTrigger id="department_id">
                    <SelectValue placeholder="Selecione o departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum departamento</SelectItem>
                    {departments?.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Cargo</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
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

          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Alterar Senha</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nova Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Deixe em branco para manter a senha atual"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirme a nova senha"
                />
              </div>
            </div>
            {passwordError && (
              <p className="text-sm text-red-500 mt-1">{passwordError}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              A senha deve ter pelo menos 6 caracteres. Deixe em branco para manter a senha atual.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Endereço</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numero_endereco">Número</Label>
                <Input
                  id="numero_endereco"
                  value={formData.numero_endereco}
                  onChange={(e) => setFormData({ ...formData, numero_endereco: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  value={formData.bairro}
                  onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pais">País</Label>
                <Input
                  id="pais"
                  value={formData.pais}
                  onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                />
              </div>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Atualizando..." : "Atualizar Funcionário"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
