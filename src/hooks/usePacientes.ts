import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Paciente = {
  id: string;
  nome: string;
  cpf: string | null;
  cartao_sus: string | null;
  data_nascimento: string | null;
  sexo: string | null;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  bairro: string | null;
  cidade: string | null;
  nome_mae: string | null;
  nome_responsavel: string | null;
  telefone_responsavel: string | null;
  tipo_sanguineo: string | null;
  alergias: string[] | null;
  condicoes_cronicas: string[] | null;
  medicamentos_uso_continuo: string[] | null;
  observacoes: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
};

type PacienteInsert = Omit<Paciente, "id" | "created_at" | "updated_at">;

export function usePacientes() {
  const queryClient = useQueryClient();

  const { data: pacientes = [], isLoading } = useQuery({
    queryKey: ["pacientes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pacientes")
        .select("*")
        .order("nome");
      if (error) throw error;
      return data as Paciente[];
    },
  });

  const createPaciente = useMutation({
    mutationFn: async (data: PacienteInsert) => {
      const { data: result, error } = await supabase
        .from("pacientes")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pacientes"] });
      toast.success("Paciente cadastrado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao cadastrar paciente:", error);
      toast.error("Erro ao cadastrar paciente");
    },
  });

  const updatePaciente = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Paciente> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("pacientes")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pacientes"] });
      toast.success("Paciente atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar paciente:", error);
      toast.error("Erro ao atualizar paciente");
    },
  });

  const deletePaciente = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("pacientes")
        .update({ status: "inativo" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pacientes"] });
      toast.success("Paciente inativado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao inativar paciente:", error);
      toast.error("Erro ao inativar paciente");
    },
  });

  return { pacientes, isLoading, createPaciente, updatePaciente, deletePaciente };
}
