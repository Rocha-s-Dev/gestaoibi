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
  const [tableExists, setTableExists] = useState(true);

  const fetchNotificacoes = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('notificacoes_educacionais' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          setTableExists(false);
          console.log('Tabela de notificações ainda não existe');
          return;
        }
        throw error;
      }

      const notifs = (data as unknown as NotificacaoEducacional[]) || [];
      setNotificacoes(notifs);
      setNaoLidas(notifs.filter(n => !n.lida).length);
      setTableExists(true);
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

  useEffect(() => {
    fetchNotificacoes();

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const channel = supabase
        .channel('notificacoes-educacionais-realtime')
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
            
            if (novaNotificacao.tipo === 'alerta_critico') {
              toast.error(novaNotificacao.titulo, {
                description: novaNotificacao.mensagem,
                duration: 10000,
              });
            } else if (novaNotificacao.tipo === 'alerta_warning') {
              toast.warning(novaNotificacao.titulo, {
                description: novaNotificacao.mensagem,
              });
            } else {
              toast.info(novaNotificacao.titulo, {
                description: novaNotificacao.mensagem,
              });
            }
          }
        )
        .subscribe();

      return channel;
    };

    let channel: ReturnType<typeof supabase.channel> | null = null;
    setupRealtime().then(ch => { channel = ch; });

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchNotificacoes]);

  return {
    notificacoes,
    loading,
    naoLidas,
    tableExists,
    marcarComoLida,
    marcarTodasComoLidas,
    refresh: fetchNotificacoes,
  };
}
