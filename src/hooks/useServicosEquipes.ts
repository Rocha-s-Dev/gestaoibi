import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ServicoEquipe {
  id: string;
  nome: string;
  especialidade: string | null;
  supervisor_id: string | null;
  supervisor_nome: string | null;
  veiculo_id: string | null;
  veiculo_descricao: string | null;
  equipamentos: string | null;
  status: string;
  em_campo: boolean;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServicoEquipeMembro {
  id: string;
  equipe_id: string;
  profile_id: string | null;
  nome: string;
  funcao: string | null;
  created_at: string;
}

export const ESPECIALIDADES_EQUIPE = [
  { value: "geral", label: "Serviços gerais" },
  { value: "iluminacao", label: "Iluminação pública" },
  { value: "pavimentacao", label: "Pavimentação" },
  { value: "limpeza_urbana", label: "Limpeza urbana" },
  { value: "capina_rocada", label: "Capina e roçada" },
  { value: "drenagem", label: "Drenagem" },
  { value: "hidraulica", label: "Hidráulica" },
  { value: "eletrica", label: "Elétrica" },
  { value: "construcao_civil", label: "Construção civil" },
  { value: "maquinas", label: "Máquinas e equipamentos" },
];

const t = (name: string) => supabase.from(name as any);

export function useServicosEquipes() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["servicos_equipes"] });

  const { data: equipes = [], isLoading } = useQuery({
    queryKey: ["servicos_equipes"],
    queryFn: async () => {
      const { data, error } = await t("servicos_equipes").select("*").order("nome");
      if (error) throw error;
      return (data || []) as unknown as ServicoEquipe[];
    },
  });

  const createEquipe = useMutation({
    mutationFn: async (payload: Partial<ServicoEquipe>) => {
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await t("servicos_equipes").insert({ ...payload, created_by: auth.user?.id ?? null } as any);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("Equipe cadastrada."); },
    onError: (e: any) => toast.error(e.message || "Erro ao cadastrar equipe."),
  });

  const updateEquipe = useMutation({
    mutationFn: async ({ id, ...patch }: Partial<ServicoEquipe> & { id: string }) => {
      const { error } = await t("servicos_equipes").update(patch as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("Equipe atualizada."); },
    onError: (e: any) => toast.error(e.message || "Erro ao atualizar equipe."),
  });

  const deleteEquipe = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await t("servicos_equipes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("Equipe removida."); },
    onError: (e: any) => toast.error(e.message || "Erro ao remover equipe."),
  });

  return { equipes, isLoading, createEquipe, updateEquipe, deleteEquipe };
}

export function useEquipeMembros(equipeId?: string) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["servicos_equipe_membros", equipeId] });

  const { data: membros = [], isLoading } = useQuery({
    queryKey: ["servicos_equipe_membros", equipeId],
    queryFn: async () => {
      const { data, error } = await t("servicos_equipe_membros")
        .select("*").eq("equipe_id", equipeId!).order("created_at");
      if (error) throw error;
      return (data || []) as unknown as ServicoEquipeMembro[];
    },
    enabled: !!equipeId,
  });

  const addMembro = useMutation({
    mutationFn: async (payload: { profile_id?: string | null; nome: string; funcao?: string | null }) => {
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await t("servicos_equipe_membros").insert({
        equipe_id: equipeId, profile_id: payload.profile_id ?? null,
        nome: payload.nome, funcao: payload.funcao ?? null,
        created_by: auth.user?.id ?? null,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("Membro adicionado à equipe."); },
    onError: (e: any) => toast.error(e.message || "Erro ao adicionar membro."),
  });

  const removeMembro = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await t("servicos_equipe_membros").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("Membro removido da equipe."); },
    onError: (e: any) => toast.error(e.message || "Erro ao remover membro."),
  });

  return { membros, isLoading, addMembro, removeMembro };
}
