import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const SUPABASE_URL = "https://rdxrwxjypqsyasunupqs.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkeHJ3eGp5cHFzeWFzdW51cHFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg3MDkwMjAsImV4cCI6MjA1NDI4NTAyMH0.ULExBcjgLWCpdpuwR9qiBhAChOtJFiZfsKp3K2qE4zo";

export type NotificationType = 
  | 'deadline' 
  | 'message' 
  | 'goal_alert' 
  | 'event' 
  | 'alerta_critico' 
  | 'alerta_warning' 
  | 'comunicado_educacao' 
  | 'lembrete_educacao';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  link?: string;
  relatedId?: string;
}

/**
 * Cria uma notificação para um usuário específico
 */
export async function criarNotificacao({
  userId,
  type,
  title,
  content,
  link,
  relatedId,
}: CreateNotificationParams): Promise<boolean> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/notifications`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          user_id: userId,
          type,
          title,
          content,
          link,
          related_id: relatedId,
        })
      }
    );

    return response.ok;
  } catch (err) {
    console.error('Erro ao criar notificação:', err);
    return false;
  }
}

/**
 * Cria notificações para múltiplos usuários
 */
export async function criarNotificacaoEmLote(
  userIds: string[],
  type: NotificationType,
  title: string,
  content: string,
  link?: string,
  relatedId?: string
): Promise<number> {
  let sucesso = 0;
  
  const notificacoes = userIds.map(userId => ({
    user_id: userId,
    type,
    title,
    content,
    link,
    related_id: relatedId,
  }));

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/notifications`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(notificacoes)
      }
    );

    if (response.ok) {
      sucesso = userIds.length;
    }
  } catch (err) {
    console.error('Erro ao criar notificações em lote:', err);
  }

  return sucesso;
}

/**
 * Hook para usar funções de notificação educacional
 */
export function useNotificacaoEducacional() {
  const { toast } = useToast();

  const notificarAlertaCritico = async (
    userId: string,
    alunoNome: string,
    mensagem: string,
    alunoId?: string
  ) => {
    const success = await criarNotificacao({
      userId,
      type: 'alerta_critico',
      title: `⚠️ Alerta Crítico: ${alunoNome}`,
      content: mensagem,
      link: '/educacao/gestao',
      relatedId: alunoId,
    });

    if (success) {
      toast({
        title: "Notificação enviada",
        description: `Alerta sobre ${alunoNome} foi enviado.`,
      });
    }

    return success;
  };

  const notificarAlertaWarning = async (
    userId: string,
    alunoNome: string,
    mensagem: string,
    alunoId?: string
  ) => {
    return criarNotificacao({
      userId,
      type: 'alerta_warning',
      title: `Aviso: ${alunoNome}`,
      content: mensagem,
      link: '/educacao/gestao',
      relatedId: alunoId,
    });
  };

  const notificarComunicadoEducacional = async (
    userId: string,
    titulo: string,
    mensagem: string,
    link?: string
  ) => {
    return criarNotificacao({
      userId,
      type: 'comunicado_educacao',
      title: titulo,
      content: mensagem,
      link: link || '/educacao/gestao',
    });
  };

  const notificarLembreteEducacional = async (
    userId: string,
    titulo: string,
    mensagem: string,
    link?: string
  ) => {
    return criarNotificacao({
      userId,
      type: 'lembrete_educacao',
      title: titulo,
      content: mensagem,
      link: link || '/educacao/gestao',
    });
  };

  return {
    notificarAlertaCritico,
    notificarAlertaWarning,
    notificarComunicadoEducacional,
    notificarLembreteEducacional,
    criarNotificacao,
    criarNotificacaoEmLote,
  };
}
