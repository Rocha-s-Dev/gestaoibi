import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, FileText, MapPin, CreditCard, Users, AlertTriangle } from "lucide-react";
import { DependentesTab } from "./DependentesTab";
import { DadosBancariosTab } from "./DadosBancariosTab";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
  department: string | null;
  role: string;
  cpf?: string | null;
  rg?: string | null;
  rg_orgao_emissor?: string | null;
  rg_uf?: string | null;
  data_nascimento?: string | null;
  sexo?: string | null;
  estado_civil?: string | null;
  nacionalidade?: string | null;
  naturalidade?: string | null;
  nome_mae?: string | null;
  nome_pai?: string | null;
  pis_pasep?: string | null;
  titulo_eleitor?: string | null;
  zona_eleitoral?: string | null;
  secao_eleitoral?: string | null;
  ctps_numero?: string | null;
  ctps_serie?: string | null;
  ctps_uf?: string | null;
  cnh_numero?: string | null;
  cnh_categoria?: string | null;
  cnh_validade?: string | null;
  telefone_residencial?: string | null;
  telefone_celular?: string | null;
  endereco_logradouro?: string | null;
  endereco_numero?: string | null;
  endereco_complemento?: string | null;
  endereco_bairro?: string | null;
  endereco_cidade?: string | null;
  endereco_uf?: string | null;
  endereco_cep?: string | null;
  observacoes?: string | null;
  tipo_usuario?: string | null;
  created_at: string;
  updated_at: string;
}

interface ServidorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servidor?: Profile;
}

const UF_OPTIONS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

export function ServidorDialog({ open, onOpenChange, servidor }: ServidorDialogProps) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [activeTab, setActiveTab] = useState("pessoais");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    cpf: "",
    rg: "",
    rg_orgao_emissor: "",
    rg_uf: "",
    data_nascimento: "",
    sexo: "",
    estado_civil: "",
    nacionalidade: "Brasileira",
    naturalidade: "",
    nome_mae: "",
    nome_pai: "",
    telefone_residencial: "",
    telefone_celular: "",
    pis_pasep: "",
    titulo_eleitor: "",
    zona_eleitoral: "",
    secao_eleitoral: "",
    ctps_numero: "",
    ctps_serie: "",
    ctps_uf: "",
    cnh_numero: "",
    cnh_categoria: "",
    cnh_validade: "",
    endereco_logradouro: "",
    endereco_numero: "",
    endereco_complemento: "",
    endereco_bairro: "",
    endereco_cidade: "",
    endereco_uf: "",
    endereco_cep: "",
    tipo_usuario: "funcionario",
    secretaria_id: "",
    observacoes: "",
  });

  // Buscar secretarias para quando tipo_usuario = secretario
  const { data: secretarias } = useQuery({
    queryKey: ["secretarias_for_servidor"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("secretarias")
        .select("id, nome, sigla")
        .eq("status", "ativa")
        .order("nome");
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
        cpf: servidor.cpf || "",
        rg: servidor.rg || "",
        rg_orgao_emissor: servidor.rg_orgao_emissor || "",
        rg_uf: servidor.rg_uf || "",
        data_nascimento: servidor.data_nascimento || "",
        sexo: servidor.sexo || "",
        estado_civil: servidor.estado_civil || "",
        nacionalidade: servidor.nacionalidade || "Brasileira",
        naturalidade: servidor.naturalidade || "",
        nome_mae: servidor.nome_mae || "",
        nome_pai: servidor.nome_pai || "",
        telefone_residencial: servidor.telefone_residencial || "",
        telefone_celular: servidor.telefone_celular || "",
        pis_pasep: servidor.pis_pasep || "",
        titulo_eleitor: servidor.titulo_eleitor || "",
        zona_eleitoral: servidor.zona_eleitoral || "",
        secao_eleitoral: servidor.secao_eleitoral || "",
        ctps_numero: servidor.ctps_numero || "",
        ctps_serie: servidor.ctps_serie || "",
        ctps_uf: servidor.ctps_uf || "",
        cnh_numero: servidor.cnh_numero || "",
        cnh_categoria: servidor.cnh_categoria || "",
        cnh_validade: servidor.cnh_validade || "",
        endereco_logradouro: servidor.endereco_logradouro || "",
        endereco_numero: servidor.endereco_numero || "",
        endereco_complemento: servidor.endereco_complemento || "",
        endereco_bairro: servidor.endereco_bairro || "",
        endereco_cidade: servidor.endereco_cidade || "",
        endereco_uf: servidor.endereco_uf || "",
        endereco_cep: servidor.endereco_cep || "",
        tipo_usuario: servidor.tipo_usuario || "funcionario",
        secretaria_id: "",
        observacoes: servidor.observacoes || "",
      });
    } else {
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
        cpf: "",
        rg: "",
        rg_orgao_emissor: "",
        rg_uf: "",
        data_nascimento: "",
        sexo: "",
        estado_civil: "",
        nacionalidade: "Brasileira",
        naturalidade: "",
        nome_mae: "",
        nome_pai: "",
        telefone_residencial: "",
        telefone_celular: "",
        pis_pasep: "",
        titulo_eleitor: "",
        zona_eleitoral: "",
        secao_eleitoral: "",
        ctps_numero: "",
        ctps_serie: "",
        ctps_uf: "",
        cnh_numero: "",
        cnh_categoria: "",
        cnh_validade: "",
        endereco_logradouro: "",
        endereco_numero: "",
        endereco_complemento: "",
        endereco_bairro: "",
        endereco_cidade: "",
        endereco_uf: "",
        endereco_cep: "",
        tipo_usuario: "funcionario",
        secretaria_id: "",
        observacoes: "",
      });
    }
    setPasswordError("");
    setActiveTab("pessoais");
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

    // Validações obrigatórias
    if (!formData.firstName.trim()) {
      toast.error("Nome completo é obrigatório");
      return;
    }
    if (!formData.cpf.trim()) {
      toast.error("CPF é obrigatório");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Email institucional é obrigatório");
      return;
    }
    if (!formData.telefone_celular.trim()) {
      toast.error("Telefone é obrigatório");
      return;
    }

    // REGRA: Secretário sem secretaria = PROIBIDO
    if (formData.tipo_usuario === "secretario" && !formData.secretaria_id) {
      toast.error("Secretário deve ter uma secretaria vinculada. É PROIBIDO criar secretário sem secretaria.");
      return;
    }

    // REGRA: Gestor RH sem secretaria = PROIBIDO (precisa estar vinculado)
    if (formData.tipo_usuario === "gestor_rh" && !formData.secretaria_id) {
      toast.error("Gestor de RH deve ter uma secretaria vinculada.");
      return;
    }

    if (!validatePasswords()) return;

    setLoading(true);

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();

      if (servidor) {
        // EDIÇÃO: atualizar profile diretamente
        const profileData = {
          name: fullName,
          cpf: formData.cpf || null,
          rg: formData.rg || null,
          rg_orgao_emissor: formData.rg_orgao_emissor || null,
          rg_uf: formData.rg_uf || null,
          data_nascimento: formData.data_nascimento || null,
          sexo: formData.sexo || null,
          estado_civil: formData.estado_civil || null,
          nacionalidade: formData.nacionalidade || null,
          naturalidade: formData.naturalidade || null,
          nome_mae: formData.nome_mae || null,
          nome_pai: formData.nome_pai || null,
          telefone_residencial: formData.telefone_residencial || null,
          telefone_celular: formData.telefone_celular || null,
          pis_pasep: formData.pis_pasep || null,
          titulo_eleitor: formData.titulo_eleitor || null,
          zona_eleitoral: formData.zona_eleitoral || null,
          secao_eleitoral: formData.secao_eleitoral || null,
          ctps_numero: formData.ctps_numero || null,
          ctps_serie: formData.ctps_serie || null,
          ctps_uf: formData.ctps_uf || null,
          cnh_numero: formData.cnh_numero || null,
          cnh_categoria: formData.cnh_categoria || null,
          cnh_validade: formData.cnh_validade || null,
          endereco_logradouro: formData.endereco_logradouro || null,
          endereco_numero: formData.endereco_numero || null,
          endereco_complemento: formData.endereco_complemento || null,
          endereco_bairro: formData.endereco_bairro || null,
          endereco_cidade: formData.endereco_cidade || null,
          endereco_uf: formData.endereco_uf || null,
          endereco_cep: formData.endereco_cep || null,
          observacoes: formData.observacoes || null,
          tipo_usuario: formData.tipo_usuario || "funcionario",
        };

        const { error } = await supabase
          .from("profiles")
          .update(profileData as any)
          .eq("id", servidor.id);

        if (error) throw error;

        if (formData.password) {
          const { error: pwError } = await supabase.functions.invoke(
            "update-user-password",
            { body: { userId: servidor.user_id, password: formData.password } }
          );
          if (pwError) throw pwError;
        }

        toast.success("Servidor atualizado com sucesso!");
      } else {
        // CRIAÇÃO: usar edge function create-user-rh (REGRA INSTITUCIONAL)
        const { data, error } = await supabase.functions.invoke("create-user-rh", {
          body: {
            email: formData.email,
            password: formData.password,
            name: fullName,
            cpf: formData.cpf || null,
            tipo_usuario: formData.tipo_usuario,
            secretaria_id: formData.secretaria_id || null,
          },
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        // Atualizar profile com dados completos
        if (data?.userId) {
          await supabase.from("profiles").update({
            telefone_celular: formData.telefone_celular || null,
            telefone_residencial: formData.telefone_residencial || null,
            rg: formData.rg || null,
            rg_orgao_emissor: formData.rg_orgao_emissor || null,
            rg_uf: formData.rg_uf || null,
            data_nascimento: formData.data_nascimento || null,
            sexo: formData.sexo || null,
            estado_civil: formData.estado_civil || null,
            nacionalidade: formData.nacionalidade || null,
            naturalidade: formData.naturalidade || null,
            nome_mae: formData.nome_mae || null,
            nome_pai: formData.nome_pai || null,
            pis_pasep: formData.pis_pasep || null,
            titulo_eleitor: formData.titulo_eleitor || null,
            zona_eleitoral: formData.zona_eleitoral || null,
            secao_eleitoral: formData.secao_eleitoral || null,
            ctps_numero: formData.ctps_numero || null,
            ctps_serie: formData.ctps_serie || null,
            ctps_uf: formData.ctps_uf || null,
            cnh_numero: formData.cnh_numero || null,
            cnh_categoria: formData.cnh_categoria || null,
            cnh_validade: formData.cnh_validade || null,
            endereco_logradouro: formData.endereco_logradouro || null,
            endereco_numero: formData.endereco_numero || null,
            endereco_complemento: formData.endereco_complemento || null,
            endereco_bairro: formData.endereco_bairro || null,
            endereco_cidade: formData.endereco_cidade || null,
            endereco_uf: formData.endereco_uf || null,
            endereco_cep: formData.endereco_cep || null,
            observacoes: formData.observacoes || null,
          } as any).eq("user_id", data.userId);
        }

        toast.success("Servidor criado com sucesso! Troca de senha será exigida no primeiro acesso.");
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
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {servidor ? "Editar Servidor" : "Novo Servidor (via RH)"}
          </DialogTitle>
          <DialogDescription>
            {servidor
              ? "Atualize os dados do servidor."
              : "O RH é o ÚNICO ponto de criação de usuários do sistema. Troca de senha será obrigatória no primeiro acesso."}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="pessoais" className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="hidden sm:inline">Pessoais</span>
            </TabsTrigger>
            <TabsTrigger value="documentos" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span className="hidden sm:inline">Documentos</span>
            </TabsTrigger>
            <TabsTrigger value="endereco" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="hidden sm:inline">Endereço</span>
            </TabsTrigger>
            <TabsTrigger value="bancarios" className="flex items-center gap-1" disabled={!servidor}>
              <CreditCard className="h-3 w-3" />
              <span className="hidden sm:inline">Bancários</span>
            </TabsTrigger>
            <TabsTrigger value="dependentes" className="flex items-center gap-1" disabled={!servidor}>
              <Users className="h-3 w-3" />
              <span className="hidden sm:inline">Dependentes</span>
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <TabsContent value="pessoais" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nome *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Sobrenome *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                    required
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
                  <Label htmlFor="sexo">Sexo</Label>
                  <Select value={formData.sexo} onValueChange={(v) => setFormData({ ...formData, sexo: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Feminino</SelectItem>
                      <SelectItem value="O">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado_civil">Estado Civil</Label>
                  <Select value={formData.estado_civil} onValueChange={(v) => setFormData({ ...formData, estado_civil: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                      <SelectItem value="casado">Casado(a)</SelectItem>
                      <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                      <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                      <SelectItem value="uniao_estavel">União Estável</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nacionalidade">Nacionalidade</Label>
                  <Input
                    id="nacionalidade"
                    value={formData.nacionalidade}
                    onChange={(e) => setFormData({ ...formData, nacionalidade: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="naturalidade">Naturalidade</Label>
                  <Input
                    id="naturalidade"
                    value={formData.naturalidade}
                    onChange={(e) => setFormData({ ...formData, naturalidade: e.target.value })}
                    placeholder="Cidade/UF"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nome_mae">Nome da Mãe</Label>
                  <Input
                    id="nome_mae"
                    value={formData.nome_mae}
                    onChange={(e) => setFormData({ ...formData, nome_mae: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nome_pai">Nome do Pai</Label>
                  <Input
                    id="nome_pai"
                    value={formData.nome_pai}
                    onChange={(e) => setFormData({ ...formData, nome_pai: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Institucional *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required={!servidor}
                    disabled={!!servidor}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone_celular">Telefone Celular *</Label>
                  <Input
                    id="telefone_celular"
                    value={formData.telefone_celular}
                    onChange={(e) => setFormData({ ...formData, telefone_celular: e.target.value })}
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone_residencial">Telefone Residencial</Label>
                  <Input
                    id="telefone_residencial"
                    value={formData.telefone_residencial}
                    onChange={(e) => setFormData({ ...formData, telefone_residencial: e.target.value })}
                    placeholder="(00) 0000-0000"
                  />
                </div>
              </div>

              {!servidor && (
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-semibold mb-3">Informações de Acesso</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Senha Temporária *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  {passwordError && <p className="text-sm text-destructive mt-1">{passwordError}</p>}
                  <p className="text-xs text-muted-foreground mt-2">
                    O servidor será obrigado a trocar a senha no primeiro acesso.
                  </p>
                </div>
              )}

              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-semibold mb-3">Tipo de Usuário</h4>
                <Alert className="mb-3">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    O RH define apenas a identidade-base. Cargos funcionais são vinculados pelas secretarias.
                    Exceção: <strong>Secretário</strong> — atribuído exclusivamente aqui.
                  </AlertDescription>
                </Alert>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo_usuario">Tipo *</Label>
                    <Select
                      value={formData.tipo_usuario}
                      onValueChange={(v) => setFormData({ ...formData, tipo_usuario: v, secretaria_id: "" })}
                    >
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="funcionario">Funcionário</SelectItem>
                        <SelectItem value="secretario">Secretário</SelectItem>
                        <SelectItem value="gestor_rh">Gestor de RH</SelectItem>
                        <SelectItem value="prefeito">Prefeito</SelectItem>
                        <SelectItem value="auditor">Auditor</SelectItem>
                        <SelectItem value="juridico">Jurídico</SelectItem>
                        <SelectItem value="administrador">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(formData.tipo_usuario === "secretario" || formData.tipo_usuario === "gestor_rh") && (
                    <div className="space-y-2">
                      <Label htmlFor="secretaria_id">Secretaria * (obrigatória)</Label>
                      <Select value={formData.secretaria_id} onValueChange={(v) => setFormData({ ...formData, secretaria_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Selecione a secretaria" /></SelectTrigger>
                        <SelectContent>
                          {secretarias?.map((sec) => (
                            <SelectItem key={sec.id} value={sec.id}>{sec.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {!formData.secretaria_id && (
                        <p className="text-xs text-destructive">
                          {formData.tipo_usuario === "secretario" ? "Secretário" : "Gestor de RH"} sem secretaria é PROIBIDO.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {servidor && (
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-semibold mb-3">Alterar Senha (opcional)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Nova Senha</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Deixe em branco para manter"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      />
                    </div>
                  </div>
                  {passwordError && <p className="text-sm text-destructive mt-1">{passwordError}</p>}
                </div>
              )}
            </TabsContent>

            <TabsContent value="documentos" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rg">RG</Label>
                  <Input id="rg" value={formData.rg} onChange={(e) => setFormData({ ...formData, rg: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rg_orgao_emissor">Órgão Emissor</Label>
                  <Input id="rg_orgao_emissor" value={formData.rg_orgao_emissor} onChange={(e) => setFormData({ ...formData, rg_orgao_emissor: e.target.value })} placeholder="SSP" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rg_uf">UF RG</Label>
                  <Select value={formData.rg_uf} onValueChange={(v) => setFormData({ ...formData, rg_uf: v })}>
                    <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                    <SelectContent>
                      {UF_OPTIONS.map((uf) => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pis_pasep">PIS/PASEP</Label>
                  <Input id="pis_pasep" value={formData.pis_pasep} onChange={(e) => setFormData({ ...formData, pis_pasep: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="titulo_eleitor">Título de Eleitor</Label>
                  <Input id="titulo_eleitor" value={formData.titulo_eleitor} onChange={(e) => setFormData({ ...formData, titulo_eleitor: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zona_eleitoral">Zona Eleitoral</Label>
                  <Input id="zona_eleitoral" value={formData.zona_eleitoral} onChange={(e) => setFormData({ ...formData, zona_eleitoral: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secao_eleitoral">Seção Eleitoral</Label>
                  <Input id="secao_eleitoral" value={formData.secao_eleitoral} onChange={(e) => setFormData({ ...formData, secao_eleitoral: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ctps_numero">CTPS Número</Label>
                  <Input id="ctps_numero" value={formData.ctps_numero} onChange={(e) => setFormData({ ...formData, ctps_numero: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ctps_serie">CTPS Série</Label>
                  <Input id="ctps_serie" value={formData.ctps_serie} onChange={(e) => setFormData({ ...formData, ctps_serie: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ctps_uf">CTPS UF</Label>
                  <Select value={formData.ctps_uf} onValueChange={(v) => setFormData({ ...formData, ctps_uf: v })}>
                    <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                    <SelectContent>
                      {UF_OPTIONS.map((uf) => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cnh_numero">CNH Número</Label>
                  <Input id="cnh_numero" value={formData.cnh_numero} onChange={(e) => setFormData({ ...formData, cnh_numero: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnh_categoria">CNH Categoria</Label>
                  <Select value={formData.cnh_categoria} onValueChange={(v) => setFormData({ ...formData, cnh_categoria: v })}>
                    <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="AB">AB</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                      <SelectItem value="D">D</SelectItem>
                      <SelectItem value="E">E</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnh_validade">CNH Validade</Label>
                  <Input id="cnh_validade" type="date" value={formData.cnh_validade} onChange={(e) => setFormData({ ...formData, cnh_validade: e.target.value })} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="endereco" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="endereco_cep">CEP</Label>
                  <Input id="endereco_cep" value={formData.endereco_cep} onChange={(e) => setFormData({ ...formData, endereco_cep: e.target.value })} placeholder="00000-000" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-2 sm:col-span-3">
                  <Label htmlFor="endereco_logradouro">Logradouro</Label>
                  <Input id="endereco_logradouro" value={formData.endereco_logradouro} onChange={(e) => setFormData({ ...formData, endereco_logradouro: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endereco_numero">Número</Label>
                  <Input id="endereco_numero" value={formData.endereco_numero} onChange={(e) => setFormData({ ...formData, endereco_numero: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="endereco_complemento">Complemento</Label>
                  <Input id="endereco_complemento" value={formData.endereco_complemento} onChange={(e) => setFormData({ ...formData, endereco_complemento: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endereco_bairro">Bairro</Label>
                  <Input id="endereco_bairro" value={formData.endereco_bairro} onChange={(e) => setFormData({ ...formData, endereco_bairro: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="endereco_cidade">Cidade</Label>
                  <Input id="endereco_cidade" value={formData.endereco_cidade} onChange={(e) => setFormData({ ...formData, endereco_cidade: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endereco_uf">UF</Label>
                  <Select value={formData.endereco_uf} onValueChange={(v) => setFormData({ ...formData, endereco_uf: v })}>
                    <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                    <SelectContent>
                      {UF_OPTIONS.map((uf) => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea id="observacoes" value={formData.observacoes} onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })} rows={3} />
              </div>
            </TabsContent>

            <TabsContent value="bancarios" className="mt-4">
              {servidor ? (
                <DadosBancariosTab servidorId={servidor.id} />
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Salve o servidor primeiro para adicionar dados bancários.
                </p>
              )}
            </TabsContent>

            <TabsContent value="dependentes" className="mt-4">
              {servidor ? (
                <DependentesTab servidorId={servidor.id} />
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Salve o servidor primeiro para adicionar dependentes.
                </p>
              )}
            </TabsContent>

            {(activeTab === "pessoais" || activeTab === "documentos" || activeTab === "endereco") && (
              <div className="flex justify-end mt-6">
                <Button type="submit" disabled={loading}>
                  {loading ? "Salvando..." : servidor ? "Atualizar Servidor" : "Criar Servidor"}
                </Button>
              </div>
            )}
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
