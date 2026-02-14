import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface UnidadeSocioassistencial {
  id: string;
  nome: string;
  tipo: string;
  endereco: string | null;
  bairro: string | null;
  telefone: string | null;
  email: string | null;
  coordenador_id: string | null;
  capacidade_atendimento: number | null;
  horario_funcionamento: string | null;
  servicos_oferecidos: string[] | null;
  status: string;
  secretaria_id: string | null;
  municipio_id: string | null;
  created_at: string;
}

export interface FamiliaCadunico {
  id: string;
  codigo_familiar: string | null;
  nis_responsavel: string | null;
  responsavel_nome: string;
  responsavel_cpf: string | null;
  responsavel_data_nascimento: string | null;
  endereco: string | null;
  bairro: string | null;
  cep: string | null;
  telefone: string | null;
  renda_familiar: number;
  renda_per_capita: number;
  quantidade_membros: number;
  situacao_moradia: string | null;
  tipo_construcao: string | null;
  agua_encanada: boolean;
  esgoto_sanitario: boolean;
  energia_eletrica: boolean;
  coleta_lixo: boolean;
  programas_vinculados: string[] | null;
  observacoes: string | null;
  status: string;
  data_cadastro: string | null;
  unidade_referencia_id: string | null;
  secretaria_id: string | null;
  created_at: string;
}

export interface MembroFamilia {
  id: string;
  familia_id: string;
  nome: string;
  cpf: string | null;
  nis: string | null;
  data_nascimento: string | null;
  parentesco: string | null;
  sexo: string | null;
  escolaridade: string | null;
  ocupacao: string | null;
  renda_individual: number;
  deficiencia: boolean;
  tipo_deficiencia: string | null;
}

export interface AtendimentoSocial {
  id: string;
  familia_id: string | null;
  unidade_id: string | null;
  profissional_id: string | null;
  data_atendimento: string;
  tipo_atendimento: string;
  demanda: string;
  providencias: string | null;
  encaminhamentos: string | null;
  observacoes: string | null;
  status: string;
  sigilo: boolean;
  secretaria_id: string | null;
  created_at: string;
  // joined
  familia?: { responsavel_nome: string } | null;
  unidade?: { nome: string } | null;
}

export interface VisitaDomiciliar {
  id: string;
  familia_id: string;
  profissional_id: string | null;
  data_visita: string;
  hora_inicio: string | null;
  hora_fim: string | null;
  objetivo: string;
  relato: string | null;
  situacao_encontrada: string | null;
  providencias: string | null;
  proxima_visita: string | null;
  status: string;
  unidade_id: string | null;
  secretaria_id: string | null;
  created_at: string;
  familia?: { responsavel_nome: string } | null;
}

export function useSocial() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // ===== UNIDADES =====
  const [unidades, setUnidades] = useState<UnidadeSocioassistencial[]>([]);

  const fetchUnidades = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("unidades_socioassistenciais")
        .select("*")
        .order("nome");
      if (error) throw error;
      setUnidades((data as unknown as UnidadeSocioassistencial[]) || []);
    } catch (err: any) {
      toast({ title: "Erro ao carregar unidades", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const saveUnidade = useCallback(async (unidade: Partial<UnidadeSocioassistencial>) => {
    try {
      if (unidade.id) {
        const { error } = await supabase.from("unidades_socioassistenciais").update(unidade as any).eq("id", unidade.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("unidades_socioassistenciais").insert(unidade as any);
        if (error) throw error;
      }
      toast({ title: "Unidade salva com sucesso" });
      await fetchUnidades();
    } catch (err: any) {
      toast({ title: "Erro ao salvar unidade", description: err.message, variant: "destructive" });
    }
  }, [fetchUnidades, toast]);

  // ===== FAMÍLIAS =====
  const [familias, setFamilias] = useState<FamiliaCadunico[]>([]);

  const fetchFamilias = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("familias_cadunico")
        .select("*")
        .order("responsavel_nome");
      if (error) throw error;
      setFamilias((data as unknown as FamiliaCadunico[]) || []);
    } catch (err: any) {
      toast({ title: "Erro ao carregar famílias", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const saveFamilia = useCallback(async (familia: Partial<FamiliaCadunico>) => {
    try {
      if (familia.id) {
        const { error } = await supabase.from("familias_cadunico").update(familia as any).eq("id", familia.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("familias_cadunico").insert(familia as any);
        if (error) throw error;
      }
      toast({ title: "Família salva com sucesso" });
      await fetchFamilias();
    } catch (err: any) {
      toast({ title: "Erro ao salvar família", description: err.message, variant: "destructive" });
    }
  }, [fetchFamilias, toast]);

  // ===== MEMBROS =====
  const [membros, setMembros] = useState<MembroFamilia[]>([]);

  const fetchMembros = useCallback(async (familiaId: string) => {
    try {
      const { data, error } = await supabase
        .from("membros_familia")
        .select("*")
        .eq("familia_id", familiaId)
        .order("parentesco");
      if (error) throw error;
      setMembros((data as unknown as MembroFamilia[]) || []);
    } catch (err: any) {
      toast({ title: "Erro ao carregar membros", description: err.message, variant: "destructive" });
    }
  }, [toast]);

  const saveMembro = useCallback(async (membro: Partial<MembroFamilia>) => {
    try {
      if (membro.id) {
        const { error } = await supabase.from("membros_familia").update(membro as any).eq("id", membro.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("membros_familia").insert(membro as any);
        if (error) throw error;
      }
      toast({ title: "Membro salvo com sucesso" });
      if (membro.familia_id) await fetchMembros(membro.familia_id);
    } catch (err: any) {
      toast({ title: "Erro ao salvar membro", description: err.message, variant: "destructive" });
    }
  }, [fetchMembros, toast]);

  const deleteMembro = useCallback(async (id: string, familiaId: string) => {
    try {
      const { error } = await supabase.from("membros_familia").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Membro removido" });
      await fetchMembros(familiaId);
    } catch (err: any) {
      toast({ title: "Erro ao remover membro", description: err.message, variant: "destructive" });
    }
  }, [fetchMembros, toast]);

  // ===== ATENDIMENTOS =====
  const [atendimentos, setAtendimentos] = useState<AtendimentoSocial[]>([]);

  const fetchAtendimentos = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("atendimentos_sociais")
        .select("*, familias_cadunico(responsavel_nome), unidades_socioassistenciais(nome)")
        .order("data_atendimento", { ascending: false })
        .limit(100);
      if (error) throw error;
      const mapped = (data || []).map((d: any) => ({
        ...d,
        familia: d.familias_cadunico,
        unidade: d.unidades_socioassistenciais,
      }));
      setAtendimentos(mapped as AtendimentoSocial[]);
    } catch (err: any) {
      toast({ title: "Erro ao carregar atendimentos", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const saveAtendimento = useCallback(async (atendimento: Partial<AtendimentoSocial>) => {
    try {
      const payload = { ...atendimento } as any;
      delete payload.familia;
      delete payload.unidade;
      if (payload.id) {
        const { error } = await supabase.from("atendimentos_sociais").update(payload).eq("id", payload.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("atendimentos_sociais").insert(payload);
        if (error) throw error;
      }
      toast({ title: "Atendimento salvo com sucesso" });
      await fetchAtendimentos();
    } catch (err: any) {
      toast({ title: "Erro ao salvar atendimento", description: err.message, variant: "destructive" });
    }
  }, [fetchAtendimentos, toast]);

  // ===== VISITAS =====
  const [visitas, setVisitas] = useState<VisitaDomiciliar[]>([]);

  const fetchVisitas = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("visitas_domiciliares")
        .select("*, familias_cadunico(responsavel_nome)")
        .order("data_visita", { ascending: false })
        .limit(100);
      if (error) throw error;
      const mapped = (data || []).map((d: any) => ({
        ...d,
        familia: d.familias_cadunico,
      }));
      setVisitas(mapped as VisitaDomiciliar[]);
    } catch (err: any) {
      toast({ title: "Erro ao carregar visitas", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const saveVisita = useCallback(async (visita: Partial<VisitaDomiciliar>) => {
    try {
      const payload = { ...visita } as any;
      delete payload.familia;
      if (payload.id) {
        const { error } = await supabase.from("visitas_domiciliares").update(payload).eq("id", payload.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("visitas_domiciliares").insert(payload);
        if (error) throw error;
      }
      toast({ title: "Visita salva com sucesso" });
      await fetchVisitas();
    } catch (err: any) {
      toast({ title: "Erro ao salvar visita", description: err.message, variant: "destructive" });
    }
  }, [fetchVisitas, toast]);

  return {
    loading,
    unidades, fetchUnidades, saveUnidade,
    familias, fetchFamilias, saveFamilia,
    membros, fetchMembros, saveMembro, deleteMembro,
    atendimentos, fetchAtendimentos, saveAtendimento,
    visitas, fetchVisitas, saveVisita,
  };
}
