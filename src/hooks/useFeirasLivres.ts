import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSecretariaContext } from "@/contexts/SecretariaContext";

export function useFeirasLivres() {
  const queryClient = useQueryClient();
  const { secretariaAtiva, municipio } = useSecretariaContext();

  // Feiras Livres
  const { data: feiras = [], isLoading: loadingFeiras } = useQuery({
    queryKey: ["feiras_livres", municipio?.id],
    queryFn: async () => {
      let query = supabase
        .from("feiras_livres")
        .select("*")
        .order("nome");

      if (municipio?.id) {
        query = query.eq("municipio_id", municipio.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const createFeira = useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from("feiras_livres")
        .insert({
          ...data,
          municipio_id: municipio?.id,
          secretaria_id: secretariaAtiva?.id,
        })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feiras_livres"] });
      toast.success("Feira cadastrada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao cadastrar feira:", error);
      toast.error("Erro ao cadastrar feira");
    },
  });

  const updateFeira = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { data: result, error } = await supabase
        .from("feiras_livres")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feiras_livres"] });
      toast.success("Feira atualizada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar feira:", error);
      toast.error("Erro ao atualizar feira");
    },
  });

  // Permissionários - usando any para contornar types desatualizados
  const { data: permissionarios = [], isLoading: loadingPermissionarios } = useQuery({
    queryKey: ["permissionarios_feira"],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("permissionarios_feira" as any)
        .select("*, feiras_livres(nome)")
        .order("nome") as any);
      if (error) throw error;
      return data || [];
    },
  });

  const createPermissionario = useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await (supabase
        .from("permissionarios_feira" as any)
        .insert(data)
        .select()
        .single() as any);
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissionarios_feira"] });
      toast.success("Permissionário cadastrado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao cadastrar permissionário:", error);
      toast.error("Erro ao cadastrar permissionário");
    },
  });

  const updatePermissionario = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { data: result, error } = await (supabase
        .from("permissionarios_feira" as any)
        .update(data)
        .eq("id", id)
        .select()
        .single() as any);
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissionarios_feira"] });
      toast.success("Permissionário atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar permissionário:", error);
      toast.error("Erro ao atualizar permissionário");
    },
  });

  // Fiscalizações - usando any para contornar types desatualizados
  const { data: fiscalizacoes = [], isLoading: loadingFiscalizacoes } = useQuery({
    queryKey: ["fiscalizacoes_feira"],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("fiscalizacoes_feira" as any)
        .select("*, feiras_livres(nome)")
        .order("data_fiscalizacao", { ascending: false }) as any);
      if (error) throw error;
      return data || [];
    },
  });

  const createFiscalizacao = useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await (supabase
        .from("fiscalizacoes_feira" as any)
        .insert(data)
        .select()
        .single() as any);
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fiscalizacoes_feira"] });
      toast.success("Fiscalização registrada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao registrar fiscalização:", error);
      toast.error("Erro ao registrar fiscalização");
    },
  });

  return {
    feiras,
    loadingFeiras,
    createFeira,
    updateFeira,
    permissionarios,
    loadingPermissionarios,
    createPermissionario,
    updatePermissionario,
    fiscalizacoes,
    loadingFiscalizacoes,
    createFiscalizacao,
  };
}
