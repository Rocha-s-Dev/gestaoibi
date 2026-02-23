import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { UnidadeSaude } from "@/components/saude/CadastroUnidadesSaude";

type DbUnidade = {
  id: string;
  nome: string;
  tipo: string;
  endereco: string | null;
  telefone: string | null;
  email: string | null;
  horario_funcionamento: Record<string, string> | null;
  especialidades: string[] | null;
  responsavel: string | null;
  responsavel_id: string | null;
  capacidade_diaria: number | null;
  status: string | null;
  observacoes: string | null;
  created_at: string | null;
  updated_at: string | null;
};

const defaultHorario = {
  segunda: "08:00-17:00",
  terca: "08:00-17:00",
  quarta: "08:00-17:00",
  quinta: "08:00-17:00",
  sexta: "08:00-17:00",
  sabado: "Fechado",
  domingo: "Fechado",
};

function mapFromDb(row: DbUnidade): UnidadeSaude {
  return {
    id: row.id,
    nome: row.nome,
    tipo: (row.tipo || "UBS") as UnidadeSaude["tipo"],
    endereco: row.endereco || "",
    telefone: row.telefone || "",
    horarioFuncionamento: {
      ...defaultHorario,
      ...(row.horario_funcionamento as Record<string, string> | null),
    },
    especialidades: row.especialidades || [],
    responsavel: row.responsavel || "",
    capacidade: row.capacidade_diaria || 0,
    status: (row.status || "ativo") as UnidadeSaude["status"],
    observacoes: row.observacoes || undefined,
  };
}

type CreateInput = Omit<Partial<UnidadeSaude>, "id"> & { responsavel_id?: string };
type UpdateInput = CreateInput & { id: string };

function mapToDb(data: CreateInput, profissionalId: string | null) {
  return {
    nome: data.nome,
    tipo: data.tipo,
    endereco: data.endereco,
    telefone: data.telefone,
    horario_funcionamento: data.horarioFuncionamento as unknown as Record<string, unknown>,
    especialidades: data.especialidades,
    responsavel: data.responsavel,
    responsavel_id: profissionalId,
    capacidade_diaria: data.capacidade,
    status: data.status,
    observacoes: data.observacoes || null,
  };
}

/**
 * Resolve o responsavel_id (user_id do RH) para um profissionais_saude.id válido.
 * Se não existir registro, cria um com cargo diretor_unidade.
 */
async function resolveResponsavelId(userIdFromRH: string | undefined): Promise<string | null> {
  if (!userIdFromRH) return null;

  // userIdFromRH é profiles.user_id (auth.users.id), mas a FK profissionais_saude.user_id
  // referencia profiles.id (PK). Precisamos buscar o profiles.id correspondente.
  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", userIdFromRH)
    .maybeSingle();

  if (profileErr) throw new Error("Erro ao buscar perfil: " + profileErr.message);
  if (!profile) throw new Error("Perfil não encontrado para o usuário selecionado.");

  const profileId = profile.id;

  // Verificar se já existe profissional ativo para esse profile id
  const { data: existing, error: fetchErr } = await supabase
    .from("profissionais_saude")
    .select("id")
    .eq("user_id", profileId)
    .eq("status", "ativo")
    .limit(1)
    .maybeSingle();

  if (fetchErr) throw new Error("Erro ao verificar profissional: " + fetchErr.message);

  if (existing) return existing.id;

  // Criar novo profissional com cargo diretor_unidade
  const { data: created, error: createErr } = await supabase
    .from("profissionais_saude")
    .insert({
      user_id: profileId,
      cargo: "diretor_unidade" as any,
      status: "ativo",
    })
    .select("id")
    .single();

  if (createErr) throw new Error("Erro ao criar profissional de saúde: " + createErr.message);

  return created.id;
}

export function useUnidadesSaude() {
  const queryClient = useQueryClient();
  const queryKey = ["unidades_saude"];

  const { data: unidades = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("unidades_saude")
        .select("*")
        .order("nome");
      if (error) throw error;
      return (data as unknown as DbUnidade[]).map(mapFromDb);
    },
  });

  const createUnidade = useMutation({
    mutationFn: async (input: CreateInput) => {
      const profissionalId = await resolveResponsavelId(input.responsavel_id);

      const { data: created, error } = await supabase
        .from("unidades_saude")
        .insert(mapToDb(input, profissionalId) as any)
        .select("id")
        .single();
      if (error) throw error;

      // Vincular o profissional à unidade recém-criada
      if (profissionalId && created) {
        await supabase
          .from("profissionais_saude")
          .update({ unidade_id: created.id } as any)
          .eq("id", profissionalId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["unidades_saude_list"] });
      queryClient.invalidateQueries({ queryKey: ["profissionais_saude"] });
      toast.success("Unidade criada com sucesso!");
    },
    onError: (err: Error) => {
      toast.error("Erro ao criar unidade: " + err.message);
    },
  });

  const updateUnidade = useMutation({
    mutationFn: async (input: UpdateInput) => {
      const { id, ...rest } = input;
      const profissionalId = await resolveResponsavelId(rest.responsavel_id);

      const { error } = await supabase
        .from("unidades_saude")
        .update(mapToDb(rest, profissionalId) as any)
        .eq("id", id);
      if (error) throw error;

      // Vincular o profissional à unidade
      if (profissionalId) {
        await supabase
          .from("profissionais_saude")
          .update({ unidade_id: id } as any)
          .eq("id", profissionalId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["unidades_saude_list"] });
      queryClient.invalidateQueries({ queryKey: ["profissionais_saude"] });
      toast.success("Unidade atualizada com sucesso!");
    },
    onError: (err: Error) => {
      toast.error("Erro ao atualizar unidade: " + err.message);
    },
  });

  const deleteUnidade = useMutation({
    mutationFn: async (id: string) => {
      // Soft delete — marca como inativo
      const { error } = await supabase
        .from("unidades_saude")
        .update({ status: "inativo" } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Unidade desativada com sucesso!");
    },
    onError: (err: Error) => {
      toast.error("Erro ao desativar unidade: " + err.message);
    },
  });

  return { unidades, isLoading, createUnidade, updateUnidade, deleteUnidade };
}
