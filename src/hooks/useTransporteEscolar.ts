import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type StatusRota = 'ativa' | 'inativa' | 'em_manutencao';
export type StatusVeiculo = 'disponivel' | 'em_uso' | 'manutencao' | 'inativo';

export interface Rota {
  id: string;
  nome: string;
  descricao?: string;
  pontos_parada?: { nome: string; endereco: string; ordem: number }[];
  horario_inicio?: string;
  horario_fim?: string;
  km_estimado?: number;
  status: StatusRota;
  created_at: string;
  [key: string]: unknown;
}

export interface Veiculo {
  id: string;
  placa: string;
  modelo: string;
  ano?: number;
  capacidade: number;
  motorista_nome?: string;
  motorista_cnh?: string;
  motorista_telefone?: string;
  status: StatusVeiculo;
  observacoes?: string;
  created_at: string;
  [key: string]: unknown;
}

export interface AlunoRota {
  id: string;
  aluno_id: string;
  rota_id: string;
  veiculo_id?: string;
  ponto_embarque?: string;
  ponto_desembarque?: string;
  horario_embarque?: string;
  turno?: string;
  ativo: boolean;
  aluno?: { nome: string; numero_matricula: string };
  rota?: { nome: string };
  veiculo?: { placa: string; modelo: string };
  [key: string]: unknown;
}

export function useRotas() {
  const [rotas, setRotas] = useState<Rota[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRotas = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('rotas_transporte')
        .select('*')
        .order('nome');

      if (error) throw error;
      setRotas(data as unknown as Rota[] || []);
    } catch (err) {
      console.error('Erro ao buscar rotas:', err);
      toast.error('Erro ao carregar rotas');
    } finally {
      setLoading(false);
    }
  }, []);

  const createRota = async (rota: Omit<Rota, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('rotas_transporte')
        .insert(rota as any)
        .select()
        .single();

      if (error) throw error;
      toast.success('Rota criada com sucesso');
      await fetchRotas();
      return data;
    } catch (err) {
      console.error('Erro ao criar rota:', err);
      toast.error('Erro ao criar rota');
    }
  };

  const updateRota = async (id: string, updates: Partial<Rota>) => {
    try {
      const { error } = await supabase
        .from('rotas_transporte')
        .update(updates as any)
        .eq('id', id);

      if (error) throw error;
      toast.success('Rota atualizada');
      await fetchRotas();
    } catch (err) {
      console.error('Erro ao atualizar rota:', err);
      toast.error('Erro ao atualizar rota');
    }
  };

  const deleteRota = async (id: string) => {
    try {
      const { error } = await supabase
        .from('rotas_transporte')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Rota removida');
      await fetchRotas();
    } catch (err) {
      console.error('Erro ao remover rota:', err);
      toast.error('Erro ao remover rota');
    }
  };

  useEffect(() => {
    fetchRotas();
  }, [fetchRotas]);

  return { rotas, loading, createRota, updateRota, deleteRota, refreshRotas: fetchRotas };
}

export function useVeiculos() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVeiculos = useCallback(async () => {
    try {
      setLoading(true);
      // veiculos_transporte is the actual table name
      const { data, error } = await (supabase.from('veiculos_transporte' as any) as any)
        .select('*')
        .order('placa');

      if (error) throw error;
      setVeiculos(data as unknown as Veiculo[] || []);
    } catch (err) {
      console.error('Erro ao buscar veículos:', err);
      toast.error('Erro ao carregar veículos');
    } finally {
      setLoading(false);
    }
  }, []);

  const createVeiculo = async (veiculo: Omit<Veiculo, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await (supabase.from('veiculos_transporte' as any) as any)
        .insert(veiculo)
        .select()
        .single();

      if (error) throw error;
      toast.success('Veículo cadastrado');
      await fetchVeiculos();
      return data;
    } catch (err) {
      console.error('Erro ao cadastrar veículo:', err);
      toast.error('Erro ao cadastrar veículo');
    }
  };

  const updateVeiculo = async (id: string, updates: Partial<Veiculo>) => {
    try {
      const { error } = await (supabase.from('veiculos_transporte' as any) as any)
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      toast.success('Veículo atualizado');
      await fetchVeiculos();
    } catch (err) {
      console.error('Erro ao atualizar veículo:', err);
      toast.error('Erro ao atualizar veículo');
    }
  };

  const deleteVeiculo = async (id: string) => {
    try {
      const { error } = await (supabase.from('veiculos_transporte' as any) as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Veículo removido');
      await fetchVeiculos();
    } catch (err) {
      console.error('Erro ao remover veículo:', err);
      toast.error('Erro ao remover veículo');
    }
  };

  useEffect(() => {
    fetchVeiculos();
  }, [fetchVeiculos]);

  return { veiculos, loading, createVeiculo, updateVeiculo, deleteVeiculo, refreshVeiculos: fetchVeiculos };
}

export function useAlunosRotas() {
  const [alunosRotas, setAlunosRotas] = useState<AlunoRota[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlunosRotas = useCallback(async (rotaId?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('alunos_rotas')
        .select(`
          *,
          aluno:alunos(nome, numero_matricula),
          rota:rotas_transporte(nome)
        `)
        .order('created_at', { ascending: false });

      if (rotaId) {
        query = query.eq('rota_id', rotaId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAlunosRotas(data as unknown as AlunoRota[] || []);
    } catch (err) {
      console.error('Erro ao buscar alunos nas rotas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const vincularAluno = async (vinculo: Omit<AlunoRota, 'id' | 'aluno' | 'rota' | 'veiculo' | 'ativo'>) => {
    try {
      const { error } = await supabase
        .from('alunos_rotas')
        .insert(vinculo as any);

      if (error) throw error;
      toast.success('Aluno vinculado à rota');
      await fetchAlunosRotas();
    } catch (err) {
      console.error('Erro ao vincular aluno:', err);
      toast.error('Erro ao vincular aluno');
    }
  };

  const desvincularAluno = async (id: string) => {
    try {
      const { error } = await supabase
        .from('alunos_rotas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Aluno desvinculado da rota');
      await fetchAlunosRotas();
    } catch (err) {
      console.error('Erro ao desvincular aluno:', err);
      toast.error('Erro ao desvincular aluno');
    }
  };

  useEffect(() => {
    fetchAlunosRotas();
  }, [fetchAlunosRotas]);

  return { alunosRotas, loading, vincularAluno, desvincularAluno, refreshAlunosRotas: fetchAlunosRotas };
}
