import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CargoSecretaria {
  id: string;
  nome: string;
  secretaria_id: string;
  nivel: string;
  ativo: boolean;
}

export function useCargosSecretaria(secretariaId?: string) {
  const { data: cargos = [], isLoading } = useQuery({
    queryKey: ["cargos_secretaria", secretariaId],
    queryFn: async () => {
      if (!secretariaId) return [];
      const { data, error } = await supabase
        .from("cargos_secretaria" as any)
        .select("*")
        .eq("secretaria_id", secretariaId)
        .eq("ativo", true)
        .order("nivel")
        .order("nome");
      if (error) throw error;
      return (data || []) as unknown as CargoSecretaria[];
    },
    enabled: !!secretariaId,
  });

  return { cargos, isLoading };
}
