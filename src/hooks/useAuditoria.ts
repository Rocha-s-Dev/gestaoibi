import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type CategoriaAuditoria = 'seguranca' | 'dados' | 'financeiro' | 'documental';
export type TipoAcaoAuditoria = 'criar' | 'editar' | 'excluir' | 'visualizar' | 'aprovar' | 'rejeitar' | 'login' | 'logout' | 'exportar' | 'importar' | 'reverter';

export interface RegistroAuditoria {
  id: string;
  created_at: string;
  user_id: string | null;
  user_email: string | null;
  user_nome: string | null;
  secretaria_id: string | null;
  secretaria_nome: string | null;
  modulo: string;
  entidade: string;
  entidade_id: string | null;
  tipo_acao: TipoAcaoAuditoria;
  categoria: CategoriaAuditoria;
  ip_address: string | null;
  user_agent: string | null;
  estado_anterior: Record<string, any> | null;
  estado_posterior: Record<string, any> | null;
  alteracoes: Record<string, any> | null;
  metadata: Record<string, any> | null;
  hash_registro: string;
  hash_anterior: string | null;
  versao: number;
}

export interface VersaoEntidade {
  id: string;
  created_at: string;
  entidade: string;
  entidade_id: string;
  versao: number;
  dados: Record<string, any>;
  hash_dados: string;
  hash_anterior: string | null;
  user_id: string | null;
  motivo: string | null;
  aprovado_por: string | null;
  aprovado_em: string | null;
  revertido: boolean;
  revertido_para_versao: number | null;
}

export interface SolicitacaoReversao {
  id: string;
  created_at: string;
  entidade: string;
  entidade_id: string;
  versao_atual: number;
  versao_destino: number;
  solicitante_id: string;
  motivo: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  aprovador_id: string | null;
  aprovado_em: string | null;
  motivo_rejeicao: string | null;
}

export interface FiltrosAuditoria {
  dataInicio?: string;
  dataFim?: string;
  categoria?: CategoriaAuditoria;
  tipoAcao?: TipoAcaoAuditoria;
  modulo?: string;
  entidade?: string;
  userId?: string;
  secretariaId?: string;
  busca?: string;
}

export function useAuditoria(filtros: FiltrosAuditoria = {}) {
  return useQuery({
    queryKey: ['auditoria', filtros],
    queryFn: async () => {
      let query = supabase
        .from('auditoria_global')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (filtros.dataInicio) {
        query = query.gte('created_at', filtros.dataInicio);
      }
      if (filtros.dataFim) {
        query = query.lte('created_at', filtros.dataFim);
      }
      if (filtros.categoria) {
        query = query.eq('categoria', filtros.categoria);
      }
      if (filtros.tipoAcao) {
        query = query.eq('tipo_acao', filtros.tipoAcao);
      }
      if (filtros.modulo) {
        query = query.eq('modulo', filtros.modulo);
      }
      if (filtros.entidade) {
        query = query.eq('entidade', filtros.entidade);
      }
      if (filtros.userId) {
        query = query.eq('user_id', filtros.userId);
      }
      if (filtros.secretariaId) {
        query = query.eq('secretaria_id', filtros.secretariaId);
      }
      if (filtros.busca) {
        query = query.or(`user_email.ilike.%${filtros.busca}%,user_nome.ilike.%${filtros.busca}%,entidade.ilike.%${filtros.busca}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as RegistroAuditoria[];
    },
  });
}

export function useVersoesEntidade(entidade: string, entidadeId: string) {
  return useQuery({
    queryKey: ['versoes-entidade', entidade, entidadeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('entidade_versoes')
        .select('*')
        .eq('entidade', entidade)
        .eq('entidade_id', entidadeId)
        .order('versao', { ascending: false });

      if (error) throw error;
      return data as VersaoEntidade[];
    },
    enabled: !!entidade && !!entidadeId,
  });
}

export function useSolicitacoesReversao(status?: string) {
  return useQuery({
    queryKey: ['solicitacoes-reversao', status],
    queryFn: async () => {
      let query = supabase
        .from('solicitacoes_reversao')
        .select('*')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SolicitacaoReversao[];
    },
  });
}

export function useSolicitarReversao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      entidade: string;
      entidade_id: string;
      versao_atual: number;
      versao_destino: number;
      motivo: string;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('solicitacoes_reversao')
        .insert({
          entidade: params.entidade,
          entidade_id: params.entidade_id,
          versao_atual: params.versao_atual,
          versao_destino: params.versao_destino,
          motivo: params.motivo,
          solicitante_id: user.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitacoes-reversao'] });
      toast.success('Solicitação de reversão enviada');
    },
    onError: (error) => {
      console.error('Erro ao solicitar reversão:', error);
      toast.error('Erro ao solicitar reversão');
    },
  });
}

export function useAprovarReversao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; aprovar: boolean; motivo_rejeicao?: string }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const updateData: any = {
        status: params.aprovar ? 'aprovado' : 'rejeitado',
        aprovador_id: user.user.id,
        aprovado_em: new Date().toISOString(),
      };

      if (!params.aprovar && params.motivo_rejeicao) {
        updateData.motivo_rejeicao = params.motivo_rejeicao;
      }

      const { data, error } = await supabase
        .from('solicitacoes_reversao')
        .update(updateData)
        .eq('id', params.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['solicitacoes-reversao'] });
      toast.success(data.status === 'aprovado' ? 'Reversão aprovada' : 'Reversão rejeitada');
    },
    onError: (error) => {
      console.error('Erro ao processar reversão:', error);
      toast.error('Erro ao processar reversão');
    },
  });
}

export function useEstatisticasAuditoria() {
  return useQuery({
    queryKey: ['estatisticas-auditoria'],
    queryFn: async () => {
      const hoje = new Date();
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString();
      
      const { data, error } = await supabase
        .from('auditoria_global')
        .select('tipo_acao, categoria, created_at')
        .gte('created_at', inicioMes);

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        porCategoria: {} as Record<string, number>,
        porTipoAcao: {} as Record<string, number>,
        porDia: {} as Record<string, number>,
      };

      data?.forEach((registro) => {
        // Por categoria
        stats.porCategoria[registro.categoria] = (stats.porCategoria[registro.categoria] || 0) + 1;
        
        // Por tipo de ação
        stats.porTipoAcao[registro.tipo_acao] = (stats.porTipoAcao[registro.tipo_acao] || 0) + 1;
        
        // Por dia
        const dia = registro.created_at.split('T')[0];
        stats.porDia[dia] = (stats.porDia[dia] || 0) + 1;
      });

      return stats;
    },
  });
}
