import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export interface UsuarioRH {
  id: string;
  user_id: string;
  name: string;
  email: string;
  cpf: string | null;
  status_cadastral: string | null;
  tipo_usuario: string | null;
  criado_pelo_rh: boolean | null;
  data_cadastro_rh: string | null;
  requer_troca_senha: boolean | null;
  primeiro_acesso: boolean | null;
  data_ultimo_login: string | null;
  vinculo_id: string | null;
  matricula: string | null;
  regime: string | null;
  situacao_vinculo: string | null;
  data_admissao: string | null;
  jornada_semanal: number | null;
  secretaria_id: string | null;
  secretaria_nome: string | null;
  secretaria_sigla: string | null;
  cargo_id: string | null;
  cargo_nome: string | null;
  funcao_id: string | null;
  funcao_nome: string | null;
  unidade_id: string | null;
  unidade_nome: string | null;
}

export interface NovoUsuarioRH {
  email: string;
  password: string;
  name: string;
  cpf?: string;
  tipo_usuario: 'administrador' | 'secretario' | 'funcionario' | 'auditor';
  secretaria_id?: string;
  cargo_id?: string;
  funcao_id?: string;
  unidade_id?: string;
  regime?: string;
  data_admissao?: string;
  jornada_semanal?: number;
  matricula?: string;
}

export function useRHCentral() {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  // Buscar todos usuários via view
  const { data: usuarios = [], isLoading, error } = useQuery({
    queryKey: ["rh_usuarios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("view_usuarios_rh" as any)
        .select("*")
        .order("name");
      if (error) throw error;
      return (data || []) as unknown as UsuarioRH[];
    },
  });

  // Criar usuário via edge function
  const criarUsuario = useMutation({
    mutationFn: async (novoUsuario: NovoUsuarioRH) => {
      const { data, error } = await supabase.functions.invoke("create-user-rh", {
        body: novoUsuario,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rh_usuarios"] });
      queryClient.invalidateQueries({ queryKey: ["vinculos_funcionais"] });
      toast.success("Usuário criado com sucesso pelo RH!");
    },
    onError: (error: Error) => {
      console.error("Erro ao criar usuário:", error);
      toast.error(error.message || "Erro ao criar usuário");
    },
  });

  // Atualizar status cadastral
  const atualizarStatus = useMutation({
    mutationFn: async ({ userId, status, motivo }: { userId: string; status: string; motivo?: string }) => {
      const updateData: Record<string, any> = { status_cadastral: status };
      if (status === 'inativo' || status === 'bloqueado') {
        updateData.data_inativacao = new Date().toISOString();
        updateData.motivo_inativacao = motivo || null;
        updateData.inativado_por = session?.user?.id;
      }
      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rh_usuarios"] });
      toast.success("Status atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status do usuário");
    },
  });

  // Regularizar usuário legado
  const regularizarUsuario = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("profiles")
        .update({
          criado_pelo_rh: true,
          data_cadastro_rh: new Date().toISOString(),
          rh_responsavel_id: session?.user?.id,
          status_cadastral: 'ativo',
        })
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rh_usuarios"] });
      toast.success("Usuário regularizado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao regularizar:", error);
      toast.error("Erro ao regularizar usuário");
    },
  });

  // Estatísticas do RH
  const stats = {
    total: usuarios.length,
    ativos: usuarios.filter(u => u.status_cadastral === 'ativo').length,
    pendentes: usuarios.filter(u => u.status_cadastral === 'pendente_regularizacao').length,
    inativos: usuarios.filter(u => u.status_cadastral === 'inativo').length,
    bloqueados: usuarios.filter(u => u.status_cadastral === 'bloqueado').length,
    comVinculo: usuarios.filter(u => u.vinculo_id).length,
    semVinculo: usuarios.filter(u => !u.vinculo_id).length,
  };

  return {
    usuarios,
    isLoading,
    error,
    stats,
    criarUsuario,
    atualizarStatus,
    regularizarUsuario,
  };
}

// Hook para verificar acesso do usuário logado
export function useUserAccess() {
  const { session } = useAuth();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["user_profile_rh", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const { data: vinculo, isLoading: vinculoLoading } = useQuery({
    queryKey: ["user_vinculo_rh", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data, error } = await supabase
        .from("vinculos_funcionais")
        .select(`
          *,
          secretarias:secretaria_id(id, nome, sigla),
          cargos_publicos:cargo_id(id, nome),
          funcoes_administrativas:funcao_id(id, nome)
        `)
        .eq("user_id", session.user.id)
        .eq("situacao", "ativo")
        .eq("is_primary", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const isLoading = profileLoading || vinculoLoading;
  const requerTrocaSenha = profile?.requer_troca_senha === true;
  const primeiroAcesso = profile?.primeiro_acesso === true;
  const statusCadastral = profile?.status_cadastral as string || 'pendente_regularizacao';
  const isAdmin = profile?.tipo_usuario === 'administrador';
  const isRegularizado = statusCadastral === 'ativo';
  const temVinculo = !!vinculo;
  const secretariaId = vinculo?.secretaria_id;

  return {
    profile,
    vinculo,
    isLoading,
    requerTrocaSenha,
    primeiroAcesso,
    statusCadastral,
    isAdmin,
    isRegularizado,
    temVinculo,
    secretariaId,
    canAccessSystem: isAdmin || (isRegularizado && temVinculo),
  };
}
