import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PontoServidor {
  id: string;
  servidor_id: string;
  data: string;
  entrada: string | null;
  saida_intervalo: string | null;
  retorno_intervalo: string | null;
  saida: string | null;
  tipo_jornada: string;
  horas_trabalhadas: number;
  horas_extras: number;
  horas_faltantes: number;
  jornada_esperada: number;
  falta: boolean;
  abono: boolean;
  observacoes: string | null;
  servidor?: {
    name: string;
  };
}

export interface JustificativaPonto {
  id: string;
  ponto_id: string | null;
  servidor_id: string;
  data: string;
  tipo: string;
  motivo: string;
  documento_url: string | null;
  status: string;
  aprovado_por: string | null;
  data_aprovacao: string | null;
  motivo_rejeicao: string | null;
}

export interface BancoHoras {
  id: string;
  servidor_id: string;
  competencia: string;
  saldo_anterior: number;
  horas_creditadas: number;
  horas_debitadas: number;
  saldo_atual: number;
  limite_acumulado: number;
  servidor?: {
    name: string;
  };
}

export function usePontoServidor(servidorId?: string, data?: string) {
  const queryClient = useQueryClient();

  const { data: pontos, isLoading } = useQuery({
    queryKey: ["ponto_servidor", servidorId, data],
    queryFn: async () => {
      let query = supabase
        .from("ponto_servidor")
        .select(`*, servidor:profiles(name)`)
        .order("data", { ascending: false });
      
      if (servidorId) {
        query = query.eq("servidor_id", servidorId);
      }
      if (data) {
        query = query.eq("data", data);
      }

      const { data: result, error } = await query.limit(100);
      if (error) throw error;
      return result as PontoServidor[];
    },
  });

  const registrarPonto = useMutation({
    mutationFn: async (registro: {
      servidor_id: string;
      tipo: "entrada" | "saida_intervalo" | "retorno_intervalo" | "saida";
    }) => {
      const hoje = new Date().toISOString().split("T")[0];
      const agora = new Date().toISOString();

      // Buscar ou criar registro do dia
      const { data: existente } = await supabase
        .from("ponto_servidor")
        .select("*")
        .eq("servidor_id", registro.servidor_id)
        .eq("data", hoje)
        .maybeSingle();

      if (existente) {
        const updateData: Record<string, string | null> = {};
        if (registro.tipo === "entrada") updateData.entrada = agora;
        if (registro.tipo === "saida_intervalo") updateData.saida_intervalo = agora;
        if (registro.tipo === "retorno_intervalo") updateData.retorno_intervalo = agora;
        if (registro.tipo === "saida") updateData.saida = agora;
        
        const { error } = await supabase
          .from("ponto_servidor")
          .update(updateData)
          .eq("id", existente.id);
        if (error) throw error;
      } else {
        const insertData = {
          servidor_id: registro.servidor_id,
          data: hoje,
          entrada: registro.tipo === "entrada" ? agora : null,
          saida_intervalo: registro.tipo === "saida_intervalo" ? agora : null,
          retorno_intervalo: registro.tipo === "retorno_intervalo" ? agora : null,
          saida: registro.tipo === "saida" ? agora : null,
        };

        const { error } = await supabase
          .from("ponto_servidor")
          .insert(insertData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ponto_servidor"] });
      toast.success("Ponto registrado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao registrar ponto: ${error.message}`);
    },
  });

  const criarJustificativa = useMutation({
    mutationFn: async (justificativa: Omit<JustificativaPonto, "id" | "aprovado_por" | "data_aprovacao" | "motivo_rejeicao">) => {
      const { error } = await supabase
        .from("justificativas_ponto")
        .insert({
          ...justificativa,
          status: "pendente",
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["justificativas_ponto"] });
      toast.success("Justificativa enviada com sucesso!");
    },
  });

  return {
    pontos,
    isLoading,
    registrarPonto,
    criarJustificativa,
  };
}

export function useJustificativasPonto() {
  const queryClient = useQueryClient();

  const { data: justificativas, isLoading } = useQuery({
    queryKey: ["justificativas_ponto"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("justificativas_ponto")
        .select(`*, servidor:profiles(name)`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const aprovarJustificativa = useMutation({
    mutationFn: async ({ id, aprovado }: { id: string; aprovado: boolean; motivoRejeicao?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("justificativas_ponto")
        .update({
          status: aprovado ? "aprovada" : "rejeitada",
          aprovado_por: user?.id,
          data_aprovacao: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["justificativas_ponto"] });
      toast.success("Justificativa processada!");
    },
  });

  return { justificativas, isLoading, aprovarJustificativa };
}

export function useBancoHoras(servidorId?: string) {
  const { data: bancoHoras, isLoading } = useQuery({
    queryKey: ["banco_horas", servidorId],
    queryFn: async () => {
      let query = supabase
        .from("banco_horas")
        .select(`*, servidor:profiles(name)`)
        .order("competencia", { ascending: false });
      
      if (servidorId) {
        query = query.eq("servidor_id", servidorId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as BancoHoras[];
    },
  });

  return { bancoHoras, isLoading };
}
