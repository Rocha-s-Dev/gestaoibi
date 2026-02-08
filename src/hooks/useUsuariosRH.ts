import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface UsuarioRH {
  user_id: string;
  nome: string;
  email: string;
  cpf: string | null;
  matricula: string | null;
  status_cadastral: string | null;
  secretaria_atual: string | null;
}

export function useUsuariosRH() {
  const [usuarios, setUsuarios] = useState<UsuarioRH[]>([]);
  const [loading, setLoading] = useState(false);

  const buscarUsuarios = useCallback(async (termo: string) => {
    if (!termo || termo.length < 2) {
      setUsuarios([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("buscar_usuarios_rh", {
        p_termo: termo,
        p_limit: 20,
      });

      if (error) throw error;
      setUsuarios((data as unknown as UsuarioRH[]) || []);
    } catch (err) {
      console.error("Erro ao buscar usuários do RH:", err);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const limparBusca = useCallback(() => {
    setUsuarios([]);
  }, []);

  return { usuarios, loading, buscarUsuarios, limparBusca };
}
