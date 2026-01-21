import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface NotificacaoEducacional {
  id: string;
  user_id: string;
  tipo: 'alerta_critico' | 'alerta_warning' | 'comunicado' | 'lembrete';
  titulo: string;
  mensagem: string;
  dados_referencia?: Record<string, unknown>;
  lida: boolean;
  created_at: string;
}

export function useNotificacoesEducacionais() {
  const [notificacoes, setNotificacoes] = useState<NotificacaoEducacional[]>([]);
  const [loading, setLoading] = useState(true);
  const [naoLidas, setNaoLidas] = useState(0);

  const fetchNotificacoes = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Use 'as any' since the table may not exist in types yet
      const { data, error } = await supabase
        .from('notificacoes_educacionais' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        // Table may not exist yet
        if (error.code === '42P01') {
          console.log('Tabela de notificações ainda não existe');
          return;
        }
        throw error;
      }

      const notifs = (data as unknown as NotificacaoEducacional[]) || [];
      setNotificacoes(notifs);
      setNaoLidas(notifs.filter(n => !n.lida).length);
    } catch (err) {
      console.error('Erro ao buscar notificações:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const marcarComoLida = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notificacoes_educacionais' as any)
        .update({ lida: true })
        .eq('id', id);

      if (error) throw error;

      setNotificacoes(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
      setNaoLidas(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Erro ao marcar notificação como lida:', err);
    }
  };

  const marcarTodasComoLidas = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notificacoes_educacionais' as any)
        .update({ lida: true })
        .eq('user_id', user.id)
        .eq('lida', false);

      if (error) throw error;

      setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
      setNaoLidas(0);
      toast.success('Todas as notificações marcadas como lidas');
    } catch (err) {
      console.error('Erro ao marcar notificações:', err);
    }
  };

  // Escutar notificações em tempo real
  useEffect(() => {
    fetchNotificacoes();

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel('notificacoes-educacionais')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notificacoes_educacionais',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const novaNotificacao = payload.new as NotificacaoEducacional;
            setNotificacoes(prev => [novaNotificacao, ...prev]);
            setNaoLidas(prev => prev + 1);
            
            // Mostrar toast para notificação crítica
            if (novaNotificacao.tipo === 'alerta_critico') {
              toast.error(novaNotificacao.titulo, {
                description: novaNotificacao.mensagem,
                duration: 10000,
              });
            } else if (novaNotificacao.tipo === 'alerta_warning') {
              toast.warning(novaNotificacao.titulo, {
                description: novaNotificacao.mensagem,
              });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtime();
  }, [fetchNotificacoes]);

  return {
    notificacoes,
    loading,
    naoLidas,
    marcarComoLida,
    marcarTodasComoLidas,
    refresh: fetchNotificacoes,
  };
}

// Hook para disparar notificações (usado internamente ou por edge functions)
export function useDispararNotificacao() {
  const dispararParaUsuario = async (
    userId: string,
    tipo: NotificacaoEducacional['tipo'],
    titulo: string,
    mensagem: string,
    dadosReferencia?: Record<string, unknown>
  ) => {
    try {
      const { error } = await supabase
        .from('notificacoes_educacionais' as any)
        .insert({
          user_id: userId,
          tipo,
          titulo,
          mensagem,
          dados_referencia: dadosReferencia,
        });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Erro ao disparar notificação:', err);
      return false;
    }
  };

  const dispararParaPapel = async (
    role: 'secretaria' | 'diretor' | 'professor' | 'responsavel',
    tipo: NotificacaoEducacional['tipo'],
    titulo: string,
    mensagem: string,
    escolaId?: string,
    dadosReferencia?: Record<string, unknown>
  ) => {
    try {
      // Buscar usuários com o papel específico
      let query = supabase
        .from('user_education_roles' as any)
        .select('user_id')
        .eq('role', role);

      if (escolaId && (role === 'diretor' || role === 'professor')) {
        query = query.eq('escola_id', escolaId);
      }

      const { data: users, error: usersError } = await query;
      if (usersError) throw usersError;

      // Criar notificações para todos os usuários
      const usersArray = users as unknown as Array<{ user_id: string }>;
      const notificacoes = usersArray?.map(u => ({
        user_id: u.user_id,
        tipo,
        titulo,
        mensagem,
        dados_referencia: dadosReferencia,
      })) || [];

      if (notificacoes.length > 0) {
        const { error } = await supabase
          .from('notificacoes_educacionais' as any)
          .insert(notificacoes);

        if (error) throw error;
      }

      return true;
    } catch (err) {
      console.error('Erro ao disparar notificações:', err);
      return false;
    }
  };

  return { dispararParaUsuario, dispararParaPapel };
}
