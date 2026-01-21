import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AlertConfig {
  percentual_faltas_warning: number;
  percentual_faltas_critical: number;
  nota_minima: number;
  dias_sem_frequencia_evasao: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Iniciando processamento de alertas educacionais...');

    // Buscar configurações de alertas
    const { data: config, error: configError } = await supabase
      .from('configuracoes_alertas')
      .select('*')
      .single();

    if (configError || !config) {
      console.error('Erro ao buscar configurações:', configError);
      return new Response(
        JSON.stringify({ error: 'Configurações não encontradas' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const alertConfig = config as AlertConfig;
    const anoAtual = new Date().getFullYear();
    const alertasGerados: string[] = [];
    const notificacoesEnviadas: string[] = [];

    // Buscar todos os alunos com suas escolas e turmas
    const { data: alunos, error: alunosError } = await supabase
      .from('alunos')
      .select('id, nome, escola_id, turma_atual_id, status')
      .eq('status', 'matriculado');

    if (alunosError) {
      console.error('Erro ao buscar alunos:', alunosError);
      throw alunosError;
    }

    console.log(`Processando ${alunos?.length || 0} alunos...`);

    for (const aluno of alunos || []) {
      // Buscar faltas do aluno no ano atual
      const { count: totalFaltas } = await supabase
        .from('faltas')
        .select('*', { count: 'exact', head: true })
        .eq('aluno_id', aluno.id)
        .gte('data_falta', `${anoAtual}-01-01`)
        .lt('data_falta', `${anoAtual + 1}-01-01`);

      // Buscar notas do aluno no ano atual
      const { data: notas } = await supabase
        .from('notas')
        .select('nota')
        .eq('aluno_id', aluno.id)
        .eq('ano_letivo', anoAtual);

      const mediaNotas = notas?.length 
        ? notas.reduce((acc, n) => acc + (Number(n.nota) || 0), 0) / notas.length 
        : null;

      // Calcular percentual de faltas (assumindo 200 dias letivos)
      const diasLetivos = 200;
      const percentualFaltas = ((totalFaltas || 0) / diasLetivos) * 100;

      // Verificar e criar alertas
      const alertasParaCriar: {
        tipo: string;
        nivel: string;
        mensagem: string;
      }[] = [];

      // Alerta de faltas críticas
      if (percentualFaltas >= alertConfig.percentual_faltas_critical) {
        alertasParaCriar.push({
          tipo: 'faltas_excessivas',
          nivel: 'critical',
          mensagem: `Aluno ${aluno.nome} atingiu ${percentualFaltas.toFixed(1)}% de faltas - CRÍTICO`,
        });
      } else if (percentualFaltas >= alertConfig.percentual_faltas_warning) {
        alertasParaCriar.push({
          tipo: 'faltas_excessivas',
          nivel: 'warning',
          mensagem: `Aluno ${aluno.nome} com ${percentualFaltas.toFixed(1)}% de faltas`,
        });
      }

      // Alerta de nota baixa
      if (mediaNotas !== null && mediaNotas < alertConfig.nota_minima) {
        const nivel = mediaNotas < 4 ? 'critical' : 'warning';
        alertasParaCriar.push({
          tipo: 'nota_baixa',
          nivel,
          mensagem: `Aluno ${aluno.nome} com média ${mediaNotas.toFixed(1)} abaixo do mínimo (${alertConfig.nota_minima})`,
        });
      }

      // Alerta de risco de reprovação (combinação de notas baixas e faltas)
      if (
        mediaNotas !== null && 
        mediaNotas < alertConfig.nota_minima && 
        percentualFaltas >= alertConfig.percentual_faltas_warning
      ) {
        alertasParaCriar.push({
          tipo: 'risco_reprovacao',
          nivel: 'critical',
          mensagem: `RISCO DE REPROVAÇÃO: ${aluno.nome} - média ${mediaNotas.toFixed(1)} e ${percentualFaltas.toFixed(1)}% de faltas`,
        });
      }

      // Criar alertas no banco
      for (const alertaInfo of alertasParaCriar) {
        // Verificar se já existe alerta não resolvido do mesmo tipo
        const { data: alertaExistente } = await supabase
          .from('alertas_educacionais')
          .select('id')
          .eq('aluno_id', aluno.id)
          .eq('tipo', alertaInfo.tipo)
          .eq('resolvido', false)
          .maybeSingle();

        if (!alertaExistente) {
          const { error: insertError } = await supabase
            .from('alertas_educacionais')
            .insert({
              aluno_id: aluno.id,
              tipo: alertaInfo.tipo,
              nivel: alertaInfo.nivel,
              mensagem: alertaInfo.mensagem,
            });

          if (!insertError) {
            alertasGerados.push(alertaInfo.mensagem);

            // Se for crítico, notificar responsáveis
            if (alertaInfo.nivel === 'critical') {
              await notificarSobreAlerta(supabase, aluno, alertaInfo, notificacoesEnviadas);
            }
          }
        }
      }
    }

    console.log(`Processamento concluído. Alertas gerados: ${alertasGerados.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        alertas_gerados: alertasGerados.length,
        notificacoes_enviadas: notificacoesEnviadas.length,
        detalhes: {
          alertas: alertasGerados,
          notificacoes: notificacoesEnviadas,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Erro no processamento:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function notificarSobreAlerta(
  supabase: any,
  aluno: { id: string; nome: string; escola_id: string; turma_atual_id: string },
  alertaInfo: { tipo: string; nivel: string; mensagem: string },
  notificacoesEnviadas: string[]
) {
  try {
    // Notificar secretaria (todos)
    const { data: secretaria } = await supabase
      .from('user_education_roles')
      .select('user_id')
      .eq('role', 'secretaria');

    // Notificar diretores da escola
    const { data: diretores } = await supabase
      .from('user_education_roles')
      .select('user_id')
      .eq('role', 'diretor')
      .eq('escola_id', aluno.escola_id);

    // Notificar responsáveis do aluno
    const { data: responsaveis } = await supabase
      .from('responsavel_alunos')
      .select('responsavel_user_id')
      .eq('aluno_id', aluno.id);

    const userIds = new Set<string>();

    secretaria?.forEach((s: any) => userIds.add(s.user_id));
    diretores?.forEach((d: any) => userIds.add(d.user_id));
    responsaveis?.forEach((r: any) => userIds.add(r.responsavel_user_id));

    const tipoNotificacao = alertaInfo.nivel === 'critical' ? 'alerta_critico' : 'alerta_warning';
    const titulo = alertaInfo.nivel === 'critical' 
      ? `⚠️ Alerta Crítico: ${aluno.nome}` 
      : `Aviso: ${aluno.nome}`;

    const notificacoes = Array.from(userIds).map(userId => ({
      user_id: userId,
      tipo: tipoNotificacao,
      titulo,
      mensagem: alertaInfo.mensagem,
      dados_referencia: {
        aluno_id: aluno.id,
        aluno_nome: aluno.nome,
        tipo_alerta: alertaInfo.tipo,
      },
    }));

    if (notificacoes.length > 0) {
      await supabase.from('notificacoes_educacionais').insert(notificacoes);
      notificacoesEnviadas.push(`Notificado ${notificacoes.length} usuários sobre ${aluno.nome}`);
    }

  } catch (err) {
    console.error('Erro ao enviar notificações:', err);
  }
}
