import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type TipoRefeicao = 'cafe_manha' | 'lanche_manha' | 'almoco' | 'lanche_tarde' | 'jantar';

export interface Cardapio {
  id: string;
  escola_id?: string;
  data: string;
  refeicao: TipoRefeicao;
  itens: { nome: string; quantidade?: string }[];
  calorias_estimadas?: number;
  observacoes?: string;
  escola?: { nome: string };
}

export interface EstoqueAlimento {
  id: string;
  escola_id?: string;
  item: string;
  quantidade: number;
  unidade: string;
  data_validade?: string;
  fornecedor?: string;
  lote?: string;
  preco_unitario?: number;
  estoque_minimo?: number;
  escola?: { nome: string };
}

export interface RestricaoAlimentar {
  id: string;
  aluno_id: string;
  tipo_restricao: string;
  descricao?: string;
  alimentos_proibidos?: string[];
  orientacoes_medicas?: string;
  documento_medico_url?: string;
  aluno?: { nome: string; numero_matricula: string };
}

export interface ConsumoMerenda {
  id: string;
  escola_id: string;
  cardapio_id?: string;
  data: string;
  refeicao: string;
  porcoes_servidas: number;
  porcoes_planejadas?: number;
  observacoes?: string;
  escola?: { nome: string };
  cardapio?: { itens: { nome: string; quantidade?: string }[] };
}

export function useCardapios() {
  const [cardapios, setCardapios] = useState<Cardapio[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCardapios = useCallback(async (escolaId?: string, dataInicio?: string, dataFim?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('cardapios')
        .select(`
          *,
          escola:escolas(nome)
        `)
        .order('data', { ascending: false });

      if (escolaId) {
        query = query.eq('escola_id', escolaId);
      }
      if (dataInicio) {
        query = query.gte('data', dataInicio);
      }
      if (dataFim) {
        query = query.lte('data', dataFim);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCardapios(data as unknown as Cardapio[] || []);
    } catch (err) {
      console.error('Erro ao buscar cardápios:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCardapio = async (cardapio: Omit<Cardapio, 'id' | 'escola'>) => {
    try {
      const { error } = await supabase
        .from('cardapios')
        .insert(cardapio);

      if (error) throw error;
      toast.success('Cardápio cadastrado');
      await fetchCardapios();
    } catch (err) {
      console.error('Erro ao criar cardápio:', err);
      toast.error('Erro ao cadastrar cardápio');
    }
  };

  const updateCardapio = async (id: string, updates: Partial<Cardapio>) => {
    try {
      const { error } = await supabase
        .from('cardapios')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      toast.success('Cardápio atualizado');
      await fetchCardapios();
    } catch (err) {
      console.error('Erro ao atualizar cardápio:', err);
      toast.error('Erro ao atualizar cardápio');
    }
  };

  const deleteCardapio = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cardapios')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Cardápio removido');
      await fetchCardapios();
    } catch (err) {
      console.error('Erro ao remover cardápio:', err);
      toast.error('Erro ao remover cardápio');
    }
  };

  useEffect(() => {
    fetchCardapios();
  }, [fetchCardapios]);

  return { cardapios, loading, createCardapio, updateCardapio, deleteCardapio, fetchCardapios };
}

export function useEstoqueAlimentos() {
  const [estoque, setEstoque] = useState<EstoqueAlimento[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEstoque = useCallback(async (escolaId?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('estoque_alimentos')
        .select(`
          *,
          escola:escolas(nome)
        `)
        .order('item');

      if (escolaId) {
        query = query.eq('escola_id', escolaId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEstoque(data as unknown as EstoqueAlimento[] || []);
    } catch (err) {
      console.error('Erro ao buscar estoque:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createItem = async (item: Omit<EstoqueAlimento, 'id' | 'escola'>) => {
    try {
      const { error } = await supabase
        .from('estoque_alimentos')
        .insert(item);

      if (error) throw error;
      toast.success('Item adicionado ao estoque');
      await fetchEstoque();
    } catch (err) {
      console.error('Erro ao adicionar item:', err);
      toast.error('Erro ao adicionar item');
    }
  };

  const updateItem = async (id: string, updates: Partial<EstoqueAlimento>) => {
    try {
      const { error } = await supabase
        .from('estoque_alimentos')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      toast.success('Estoque atualizado');
      await fetchEstoque();
    } catch (err) {
      console.error('Erro ao atualizar estoque:', err);
      toast.error('Erro ao atualizar estoque');
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('estoque_alimentos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Item removido do estoque');
      await fetchEstoque();
    } catch (err) {
      console.error('Erro ao remover item:', err);
      toast.error('Erro ao remover item');
    }
  };

  const getItensVencendo = async (diasAntecedencia: number = 7) => {
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() + diasAntecedencia);
    
    const { data } = await supabase
      .from('estoque_alimentos')
      .select('*')
      .lte('data_validade', dataLimite.toISOString().split('T')[0])
      .order('data_validade');

    return data || [];
  };

  const getItensEstoqueBaixo = async () => {
    const { data } = await supabase
      .from('estoque_alimentos')
      .select('*')
      .not('estoque_minimo', 'is', null);

    return (data || []).filter(item => 
      item.estoque_minimo && item.quantidade <= item.estoque_minimo
    );
  };

  useEffect(() => {
    fetchEstoque();
  }, [fetchEstoque]);

  return { 
    estoque, 
    loading, 
    createItem, 
    updateItem, 
    deleteItem, 
    fetchEstoque,
    getItensVencendo,
    getItensEstoqueBaixo
  };
}

export function useRestricoesAlimentares() {
  const [restricoes, setRestricoes] = useState<RestricaoAlimentar[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRestricoes = useCallback(async (alunoId?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('restricoes_alimentares')
        .select(`
          *,
          aluno:alunos(nome, numero_matricula)
        `)
        .order('created_at', { ascending: false });

      if (alunoId) {
        query = query.eq('aluno_id', alunoId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRestricoes(data as unknown as RestricaoAlimentar[] || []);
    } catch (err) {
      console.error('Erro ao buscar restrições:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createRestricao = async (restricao: Omit<RestricaoAlimentar, 'id' | 'aluno'>) => {
    try {
      const { error } = await supabase
        .from('restricoes_alimentares')
        .insert(restricao);

      if (error) throw error;
      toast.success('Restrição alimentar cadastrada');
      await fetchRestricoes();
    } catch (err) {
      console.error('Erro ao cadastrar restrição:', err);
      toast.error('Erro ao cadastrar restrição');
    }
  };

  const updateRestricao = async (id: string, updates: Partial<RestricaoAlimentar>) => {
    try {
      const { error } = await supabase
        .from('restricoes_alimentares')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      toast.success('Restrição atualizada');
      await fetchRestricoes();
    } catch (err) {
      console.error('Erro ao atualizar restrição:', err);
      toast.error('Erro ao atualizar restrição');
    }
  };

  const deleteRestricao = async (id: string) => {
    try {
      const { error } = await supabase
        .from('restricoes_alimentares')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Restrição removida');
      await fetchRestricoes();
    } catch (err) {
      console.error('Erro ao remover restrição:', err);
      toast.error('Erro ao remover restrição');
    }
  };

  useEffect(() => {
    fetchRestricoes();
  }, [fetchRestricoes]);

  return { restricoes, loading, createRestricao, updateRestricao, deleteRestricao, fetchRestricoes };
}

export function useConsumoMerenda() {
  const [consumos, setConsumos] = useState<ConsumoMerenda[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConsumos = useCallback(async (escolaId?: string, dataInicio?: string, dataFim?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('consumo_merenda')
        .select(`
          *,
          escola:escolas(nome),
          cardapio:cardapios(itens)
        `)
        .order('data', { ascending: false });

      if (escolaId) {
        query = query.eq('escola_id', escolaId);
      }
      if (dataInicio) {
        query = query.gte('data', dataInicio);
      }
      if (dataFim) {
        query = query.lte('data', dataFim);
      }

      const { data, error } = await query;

      if (error) throw error;
      setConsumos(data as unknown as ConsumoMerenda[] || []);
    } catch (err) {
      console.error('Erro ao buscar consumos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const registrarConsumo = async (consumo: Omit<ConsumoMerenda, 'id' | 'escola' | 'cardapio'>) => {
    try {
      const { error } = await supabase
        .from('consumo_merenda')
        .insert(consumo);

      if (error) throw error;
      toast.success('Consumo registrado');
      await fetchConsumos();
      return true;
    } catch (err) {
      console.error('Erro ao registrar consumo:', err);
      toast.error('Erro ao registrar consumo');
      return false;
    }
  };

  const updateConsumo = async (id: string, updates: Partial<ConsumoMerenda>) => {
    try {
      const { error } = await supabase
        .from('consumo_merenda')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      toast.success('Consumo atualizado');
      await fetchConsumos();
    } catch (err) {
      console.error('Erro ao atualizar consumo:', err);
      toast.error('Erro ao atualizar consumo');
    }
  };

  const deleteConsumo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('consumo_merenda')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Consumo removido');
      await fetchConsumos();
    } catch (err) {
      console.error('Erro ao remover consumo:', err);
      toast.error('Erro ao remover consumo');
    }
  };

  const getEstatisticasConsumo = async (escolaId?: string, mes?: number, ano?: number) => {
    const dataInicio = new Date(ano || new Date().getFullYear(), (mes || new Date().getMonth()), 1);
    const dataFim = new Date(ano || new Date().getFullYear(), (mes || new Date().getMonth()) + 1, 0);

    let query = supabase
      .from('consumo_merenda')
      .select('*')
      .gte('data', dataInicio.toISOString().split('T')[0])
      .lte('data', dataFim.toISOString().split('T')[0]);

    if (escolaId) {
      query = query.eq('escola_id', escolaId);
    }

    const { data } = await query;

    if (!data || data.length === 0) {
      return {
        totalPorcoes: 0,
        mediaDiaria: 0,
        totalDias: 0
      };
    }

    const totalPorcoes = data.reduce((acc, c) => acc + (c.porcoes_servidas || 0), 0);
    const diasUnicos = new Set(data.map(c => c.data)).size;

    return {
      totalPorcoes,
      mediaDiaria: diasUnicos > 0 ? Math.round(totalPorcoes / diasUnicos) : 0,
      totalDias: diasUnicos
    };
  };

  useEffect(() => {
    fetchConsumos();
  }, [fetchConsumos]);

  return { 
    consumos, 
    loading, 
    registrarConsumo, 
    updateConsumo, 
    deleteConsumo, 
    fetchConsumos,
    getEstatisticasConsumo
  };
}
