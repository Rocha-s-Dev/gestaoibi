import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const CARGOS_APOIO_EDUCACAO = [
  "Porteiro",
  "Vigia",
  "Merendeira",
  "Auxiliar de Cozinha",
  "Faxineiro",
  "Auxiliar de Serviços Gerais",
  "Zelador",
  "Monitor Escolar",
  "Inspetor de Alunos",
  "Motorista Escolar",
  "Cuidador Escolar",
  "Estagiário",
  "Técnico de Informática",
] as const;

export const TURNOS = [
  { value: "matutino", label: "Matutino" },
  { value: "vespertino", label: "Vespertino" },
  { value: "noturno", label: "Noturno" },
  { value: "integral", label: "Integral" },
] as const;

export interface EquipeEducacaoMembro {
  id: string;
  usuario_id: string;
  cargo: string;
  escola_id: string | null;
  turno: string;
  data_inicio: string;
  status: string;
  created_at: string;
  profiles: {
    id: string;
    name: string;
    email: string;
    cpf: string | null;
    telefone: string | null;
  } | null;
  escolas: {
    id: string;
    nome: string;
  } | null;
}

export interface NovoMembroEquipe {
  usuario_id: string;
  cargo: string;
  escola_id?: string | null;
  turno: string;
  data_inicio: string;
  status?: string;
}

export function useEquipeEducacao() {
  const queryClient = useQueryClient();

  const { data: membros = [], isLoading } = useQuery({
    queryKey: ["educacao_equipe"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("educacao_equipe" as any)
        .select(`
          *,
          profiles:usuario_id(id, name, email, cpf, telefone),
          escolas:escola_id(id, nome)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as EquipeEducacaoMembro[];
    },
  });

  const adicionarMembro = useMutation({
    mutationFn: async (novo: NovoMembroEquipe) => {
      const { error } = await supabase
        .from("educacao_equipe" as any)
        .insert({
          usuario_id: novo.usuario_id,
          cargo: novo.cargo,
          escola_id: novo.escola_id || null,
          turno: novo.turno,
          data_inicio: novo.data_inicio,
          status: novo.status || "ativo",
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["educacao_equipe"] });
      toast.success("Membro adicionado à equipe!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Erro ao adicionar membro");
    },
  });

  const atualizarMembro = useMutation({
    mutationFn: async ({ id, ...dados }: { id: string } & Partial<NovoMembroEquipe>) => {
      const { error } = await supabase
        .from("educacao_equipe" as any)
        .update(dados as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["educacao_equipe"] });
      toast.success("Membro atualizado!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Erro ao atualizar membro");
    },
  });

  const removerMembro = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("educacao_equipe" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["educacao_equipe"] });
      toast.success("Membro removido da equipe!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Erro ao remover membro");
    },
  });

  return { membros, isLoading, adicionarMembro, atualizarMembro, removerMembro };
}
