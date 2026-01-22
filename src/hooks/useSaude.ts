import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Types
export interface UnidadeSaude {
  id: string;
  nome: string;
  tipo: "UBS" | "UPA" | "Hospital" | "Clinica" | "CAPS" | "Laboratorio";
  endereco: string | null;
  telefone: string | null;
  email: string | null;
  horario_funcionamento: Record<string, string>;
  especialidades: string[];
  responsavel: string | null;
  capacidade_diaria: number | null;
  status: "ativo" | "inativo" | "manutencao";
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Paciente {
  id: string;
  nome: string;
  cpf: string | null;
  data_nascimento: string | null;
  sexo: "masculino" | "feminino" | "outro" | null;
  tipo_sanguineo: string | null;
  endereco: string | null;
  bairro: string | null;
  cidade: string | null;
  telefone: string | null;
  email: string | null;
  cartao_sus: string | null;
  nome_mae: string | null;
  nome_responsavel: string | null;
  telefone_responsavel: string | null;
  alergias: string[];
  condicoes_cronicas: string[];
  medicamentos_uso_continuo: string[];
  observacoes: string | null;
  status: "ativo" | "inativo" | "falecido" | "mudou";
  created_at: string;
  updated_at: string;
}

export interface ProfissionalSaude {
  id: string;
  user_id: string | null;
  nome: string;
  cpf: string | null;
  registro_conselho: string | null;
  tipo_conselho: string | null;
  especialidade: string | null;
  unidade_id: string | null;
  telefone: string | null;
  email: string | null;
  carga_horaria_semanal: number | null;
  status: "ativo" | "inativo" | "ferias" | "licenca";
  created_at: string;
  updated_at: string;
  unidade?: UnidadeSaude;
}

export interface Agendamento {
  id: string;
  paciente_id: string;
  profissional_id: string | null;
  unidade_id: string;
  data_hora: string;
  tipo: "consulta" | "retorno" | "exame" | "vacina" | "procedimento" | "urgencia";
  especialidade: string | null;
  status: "agendado" | "confirmado" | "em_atendimento" | "realizado" | "cancelado" | "faltou";
  prioridade: "baixa" | "normal" | "alta" | "urgente";
  observacoes: string | null;
  motivo_cancelamento: string | null;
  created_at: string;
  updated_at: string;
  paciente?: Paciente;
  profissional?: ProfissionalSaude;
  unidade?: UnidadeSaude;
}

export interface Prontuario {
  id: string;
  paciente_id: string;
  agendamento_id: string | null;
  profissional_id: string | null;
  unidade_id: string | null;
  data_atendimento: string;
  tipo_atendimento: "consulta" | "emergencia" | "retorno" | "procedimento" | "exame";
  queixa_principal: string | null;
  historia_doenca_atual: string | null;
  exame_fisico: Record<string, unknown>;
  sinais_vitais: {
    pressao?: string;
    temperatura?: number;
    peso?: number;
    altura?: number;
    frequencia_cardiaca?: number;
    frequencia_respiratoria?: number;
  };
  hipotese_diagnostica: string | null;
  cid_principal: string | null;
  cid_secundarios: string[];
  conduta: string | null;
  prescricao_medicamentos: Array<{
    medicamento: string;
    dosagem: string;
    posologia: string;
    duracao: string;
  }>;
  solicitacao_exames: Array<{
    exame: string;
    justificativa: string;
  }>;
  encaminhamentos: string[];
  observacoes: string | null;
  assinatura_digital: string | null;
  created_at: string;
  updated_at: string;
  paciente?: Paciente;
  profissional?: ProfissionalSaude;
}

export interface Tratamento {
  id: string;
  paciente_id: string;
  profissional_id: string | null;
  unidade_id: string | null;
  nome_tratamento: string;
  cid: string | null;
  data_inicio: string;
  data_prevista_fim: string | null;
  data_fim: string | null;
  status: "em_andamento" | "concluido" | "suspenso" | "abandonado";
  progresso: number;
  medicamentos: Array<{
    nome: string;
    dosagem: string;
    frequencia: string;
  }>;
  orientacoes: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
  paciente?: Paciente;
  profissional?: ProfissionalSaude;
}

// Hook para Unidades de Saúde
export function useUnidadesSaude() {
  const [unidades, setUnidades] = useState<UnidadeSaude[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUnidades = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("unidades_saude")
        .select("*")
        .order("nome");

      if (error) throw error;
      setUnidades(data as UnidadeSaude[]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao carregar unidades";
      setError(message);
      console.error("Erro ao carregar unidades:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createUnidade = async (unidade: Omit<UnidadeSaude, "id" | "created_at" | "updated_at">) => {
    const { data, error } = await supabase
      .from("unidades_saude")
      .insert(unidade)
      .select()
      .single();

    if (error) throw error;
    await fetchUnidades();
    return data;
  };

  const updateUnidade = async (id: string, unidade: Partial<UnidadeSaude>) => {
    const { data, error } = await supabase
      .from("unidades_saude")
      .update(unidade)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    await fetchUnidades();
    return data;
  };

  const deleteUnidade = async (id: string) => {
    const { error } = await supabase.from("unidades_saude").delete().eq("id", id);
    if (error) throw error;
    await fetchUnidades();
  };

  useEffect(() => {
    fetchUnidades();
  }, [fetchUnidades]);

  return { unidades, loading, error, fetchUnidades, createUnidade, updateUnidade, deleteUnidade };
}

// Hook para Pacientes
export function usePacientes() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPacientes = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("pacientes")
        .select("*")
        .order("nome");

      if (error) throw error;
      setPacientes(data as Paciente[]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao carregar pacientes";
      setError(message);
      console.error("Erro ao carregar pacientes:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchPacientes = async (termo: string) => {
    const { data, error } = await supabase
      .from("pacientes")
      .select("*")
      .or(`nome.ilike.%${termo}%,cpf.ilike.%${termo}%,cartao_sus.ilike.%${termo}%`)
      .limit(20);

    if (error) throw error;
    return data as Paciente[];
  };

  const createPaciente = async (paciente: Omit<Paciente, "id" | "created_at" | "updated_at">) => {
    const { data, error } = await supabase
      .from("pacientes")
      .insert(paciente)
      .select()
      .single();

    if (error) throw error;
    await fetchPacientes();
    return data;
  };

  const updatePaciente = async (id: string, paciente: Partial<Paciente>) => {
    const { data, error } = await supabase
      .from("pacientes")
      .update(paciente)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    await fetchPacientes();
    return data;
  };

  const deletePaciente = async (id: string) => {
    const { error } = await supabase.from("pacientes").delete().eq("id", id);
    if (error) throw error;
    await fetchPacientes();
  };

  useEffect(() => {
    fetchPacientes();
  }, [fetchPacientes]);

  return { pacientes, loading, error, fetchPacientes, searchPacientes, createPaciente, updatePaciente, deletePaciente };
}

// Hook para Profissionais de Saúde
export function useProfissionaisSaude() {
  const [profissionais, setProfissionais] = useState<ProfissionalSaude[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfissionais = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profissionais_saude")
        .select(`
          *,
          unidade:unidades_saude(id, nome, tipo)
        `)
        .order("nome");

      if (error) throw error;
      setProfissionais(data as unknown as ProfissionalSaude[]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao carregar profissionais";
      setError(message);
      console.error("Erro ao carregar profissionais:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createProfissional = async (profissional: Omit<ProfissionalSaude, "id" | "created_at" | "updated_at" | "unidade">) => {
    const { data, error } = await supabase
      .from("profissionais_saude")
      .insert(profissional)
      .select()
      .single();

    if (error) throw error;
    await fetchProfissionais();
    return data;
  };

  const updateProfissional = async (id: string, profissional: Partial<ProfissionalSaude>) => {
    const { unidade, ...updateData } = profissional;
    const { data, error } = await supabase
      .from("profissionais_saude")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    await fetchProfissionais();
    return data;
  };

  const deleteProfissional = async (id: string) => {
    const { error } = await supabase.from("profissionais_saude").delete().eq("id", id);
    if (error) throw error;
    await fetchProfissionais();
  };

  useEffect(() => {
    fetchProfissionais();
  }, [fetchProfissionais]);

  return { profissionais, loading, error, fetchProfissionais, createProfissional, updateProfissional, deleteProfissional };
}

// Hook para Agendamentos
export function useAgendamentos(unidadeId?: string) {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgendamentos = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("agendamentos")
        .select(`
          *,
          paciente:pacientes(id, nome, cpf, telefone),
          profissional:profissionais_saude(id, nome, especialidade),
          unidade:unidades_saude(id, nome, tipo)
        `)
        .order("data_hora", { ascending: true });

      if (unidadeId) {
        query = query.eq("unidade_id", unidadeId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAgendamentos(data as unknown as Agendamento[]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao carregar agendamentos";
      setError(message);
      console.error("Erro ao carregar agendamentos:", err);
    } finally {
      setLoading(false);
    }
  }, [unidadeId]);

  const createAgendamento = async (agendamento: Omit<Agendamento, "id" | "created_at" | "updated_at" | "paciente" | "profissional" | "unidade">) => {
    const { data, error } = await supabase
      .from("agendamentos")
      .insert(agendamento)
      .select()
      .single();

    if (error) throw error;
    await fetchAgendamentos();
    return data;
  };

  const updateAgendamento = async (id: string, agendamento: Partial<Agendamento>) => {
    const { paciente, profissional, unidade, ...updateData } = agendamento;
    const { data, error } = await supabase
      .from("agendamentos")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    await fetchAgendamentos();
    return data;
  };

  const cancelAgendamento = async (id: string, motivo: string) => {
    const { error } = await supabase
      .from("agendamentos")
      .update({ status: "cancelado", motivo_cancelamento: motivo })
      .eq("id", id);

    if (error) throw error;
    await fetchAgendamentos();
  };

  useEffect(() => {
    fetchAgendamentos();
  }, [fetchAgendamentos]);

  return { agendamentos, loading, error, fetchAgendamentos, createAgendamento, updateAgendamento, cancelAgendamento };
}

// Hook para Prontuários
export function useProntuarios(pacienteId?: string) {
  const [prontuarios, setProntuarios] = useState<Prontuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProntuarios = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("prontuarios")
        .select(`
          *,
          paciente:pacientes(id, nome, cpf, data_nascimento),
          profissional:profissionais_saude(id, nome, especialidade, registro_conselho)
        `)
        .order("data_atendimento", { ascending: false });

      if (pacienteId) {
        query = query.eq("paciente_id", pacienteId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProntuarios(data as unknown as Prontuario[]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao carregar prontuários";
      setError(message);
      console.error("Erro ao carregar prontuários:", err);
    } finally {
      setLoading(false);
    }
  }, [pacienteId]);

  const createProntuario = async (prontuario: Omit<Prontuario, "id" | "created_at" | "updated_at" | "paciente" | "profissional">) => {
    const { data, error } = await supabase
      .from("prontuarios")
      .insert(prontuario as any)
      .select()
      .single();

    if (error) throw error;
    await fetchProntuarios();
    return data;
  };

  const updateProntuario = async (id: string, prontuario: Partial<Prontuario>) => {
    const { paciente, profissional, ...updateData } = prontuario;
    const { data, error } = await supabase
      .from("prontuarios")
      .update(updateData as any)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    await fetchProntuarios();
    return data;
  };

  useEffect(() => {
    fetchProntuarios();
  }, [fetchProntuarios]);

  return { prontuarios, loading, error, fetchProntuarios, createProntuario, updateProntuario };
}

// Hook para Tratamentos
export function useTratamentos(pacienteId?: string) {
  const [tratamentos, setTratamentos] = useState<Tratamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTratamentos = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("tratamentos")
        .select(`
          *,
          paciente:pacientes(id, nome, cpf),
          profissional:profissionais_saude(id, nome, especialidade)
        `)
        .order("data_inicio", { ascending: false });

      if (pacienteId) {
        query = query.eq("paciente_id", pacienteId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTratamentos(data as unknown as Tratamento[]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao carregar tratamentos";
      setError(message);
      console.error("Erro ao carregar tratamentos:", err);
    } finally {
      setLoading(false);
    }
  }, [pacienteId]);

  const createTratamento = async (tratamento: Omit<Tratamento, "id" | "created_at" | "updated_at" | "paciente" | "profissional">) => {
    const { data, error } = await supabase
      .from("tratamentos")
      .insert(tratamento)
      .select()
      .single();

    if (error) throw error;
    await fetchTratamentos();
    return data;
  };

  const updateTratamento = async (id: string, tratamento: Partial<Tratamento>) => {
    const { paciente, profissional, ...updateData } = tratamento;
    const { data, error } = await supabase
      .from("tratamentos")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    await fetchTratamentos();
    return data;
  };

  useEffect(() => {
    fetchTratamentos();
  }, [fetchTratamentos]);

  return { tratamentos, loading, error, fetchTratamentos, createTratamento, updateTratamento };
}

// Hook para Indicadores de Saúde
export function useIndicadoresSaude() {
  const [indicadores, setIndicadores] = useState<Array<{
    id: string;
    nome: string;
    categoria: string;
    valor: number;
    unidade_medida: string;
    periodo: string;
    meta: number | null;
    tendencia: string | null;
    status: string | null;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIndicadores = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("indicadores_saude")
        .select("*")
        .order("nome");

      if (error) throw error;
      setIndicadores(data || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao carregar indicadores";
      setError(message);
      console.error("Erro ao carregar indicadores:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createIndicador = async (indicador: {
    nome: string;
    categoria: string;
    valor: number;
    unidade_medida: string;
    periodo: string;
    meta?: number;
    tendencia?: string;
    status?: string;
  }) => {
    const { data, error } = await supabase
      .from("indicadores_saude")
      .insert(indicador)
      .select()
      .single();

    if (error) throw error;
    await fetchIndicadores();
    return data;
  };

  useEffect(() => {
    fetchIndicadores();
  }, [fetchIndicadores]);

  return { indicadores, loading, error, fetchIndicadores, createIndicador };
}

// Hook para Metas de Saúde
export function useMetasSaude() {
  const [metas, setMetas] = useState<Array<{
    id: string;
    titulo: string;
    tipo: string;
    descricao: string | null;
    valor_meta: number;
    valor_atual: number;
    unidade_medida: string;
    prazo: string | null;
    status: string;
    responsavel: string | null;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetas = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("metas_saude")
        .select("*")
        .order("prazo");

      if (error) throw error;
      setMetas(data || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao carregar metas";
      setError(message);
      console.error("Erro ao carregar metas:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createMeta = async (meta: {
    titulo: string;
    tipo: string;
    descricao?: string;
    valor_meta: number;
    valor_atual?: number;
    unidade_medida: string;
    prazo?: string;
    responsavel?: string;
  }) => {
    const { data, error } = await supabase
      .from("metas_saude")
      .insert(meta)
      .select()
      .single();

    if (error) throw error;
    await fetchMetas();
    return data;
  };

  const updateMeta = async (id: string, meta: Partial<{
    titulo: string;
    tipo: string;
    descricao: string;
    valor_meta: number;
    valor_atual: number;
    unidade_medida: string;
    prazo: string;
    status: string;
    responsavel: string;
  }>) => {
    const { data, error } = await supabase
      .from("metas_saude")
      .update(meta)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    await fetchMetas();
    return data;
  };

  useEffect(() => {
    fetchMetas();
  }, [fetchMetas]);

  return { metas, loading, error, fetchMetas, createMeta, updateMeta };
}
