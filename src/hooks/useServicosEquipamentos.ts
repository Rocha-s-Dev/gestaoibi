import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ServicoEquipamento {
  id: string;
  nome: string;
  tipo: string | null;
  patrimonio: string | null;
  veiculo_id: string | null;
  situacao: string;
  horimetro: number | null;
  quilometragem: number | null;
  ultima_manutencao: string | null;
  proxima_manutencao: string | null;
  localizacao: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export const TIPOS_EQUIPAMENTO = [
  { value: "retroescavadeira", label: "Retroescavadeira" },
  { value: "motoniveladora", label: "Motoniveladora (patrol)" },
  { value: "pa_carregadeira", label: "Pá carregadeira" },
  { value: "trator", label: "Trator" },
  { value: "caminhao_cacamba", label: "Caminhão caçamba" },
  { value: "caminhao_pipa", label: "Caminhão pipa" },
  { value: "cesto_aereo", label: "Caminhão com cesto aéreo" },
  { value: "rolo_compactador", label: "Rolo compactador" },
  { value: "rocadeira", label: "Roçadeira" },
  { value: "motosserra", label: "Motosserra" },
  { value: "gerador", label: "Gerador" },
  { value: "compressor", label: "Compressor" },
  { value: "outro", label: "Outro" },
];

export const SITUACOES_EQUIPAMENTO = [
  { value: "disponivel", label: "Disponível", color: "bg-green-100 text-green-800" },
  { value: "em_uso", label: "Em uso", color: "bg-blue-100 text-blue-800" },
  { value: "manutencao", label: "Em manutenção", color: "bg-amber-100 text-amber-800" },
  { value: "inativo", label: "Inativo", color: "bg-gray-100 text-gray-800" },
];

const t = () => supabase.from("servicos_equipamentos" as any);

export function useServicosEquipamentos() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["servicos_equipamentos"] });

  const { data: equipamentos = [], isLoading } = useQuery({
    queryKey: ["servicos_equipamentos"],
    queryFn: async () => {
      const { data, error } = await t().select("*").order("nome");
      if (error) throw error;
      return (data || []) as unknown as ServicoEquipamento[];
    },
  });

  const createEquipamento = useMutation({
    mutationFn: async (payload: Partial<ServicoEquipamento>) => {
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await t().insert({ ...payload, created_by: auth.user?.id ?? null } as any);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("Equipamento cadastrado."); },
    onError: (e: any) => toast.error(e.message || "Erro ao cadastrar equipamento."),
  });

  const updateEquipamento = useMutation({
    mutationFn: async ({ id, ...patch }: Partial<ServicoEquipamento> & { id: string }) => {
      const { error } = await t().update(patch as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("Equipamento atualizado."); },
    onError: (e: any) => toast.error(e.message || "Erro ao atualizar equipamento."),
  });

  const deleteEquipamento = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await t().delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("Equipamento removido."); },
    onError: (e: any) => toast.error(e.message || "Erro ao remover equipamento."),
  });

  return { equipamentos, isLoading, createEquipamento, updateEquipamento, deleteEquipamento };
}
