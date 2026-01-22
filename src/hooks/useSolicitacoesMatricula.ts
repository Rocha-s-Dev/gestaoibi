import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type StatusSolicitacaoMatricula = 'pendente' | 'em_analise' | 'aprovada' | 'rejeitada' | 'lista_espera';

export interface SolicitacaoMatricula {
  id: string;
  protocolo: string;
  status: StatusSolicitacaoMatricula;
  nome_aluno: string;
  nome_responsavel: string;
  cpf_aluno?: string;
  cpf_responsavel?: string;
  data_nascimento?: string;
  telefone_responsavel?: string;
  email_responsavel?: string;
  endereco?: string;
  escola_desejada_id?: string;
  serie_desejada?: string;
  turno_desejado?: string;
  documentos?: unknown;
  observacoes?: string;
  motivo_recusa?: string;
  created_at: string;
  updated_at: string;
  escola_desejada?: { nome: string };
  [key: string]: unknown;
}

export function useSolicitacoesMatricula() {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoMatricula[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSolicitacoes = useCallback(async (status?: StatusSolicitacaoMatricula) => {
    try {
      setLoading(true);
      let query = supabase
        .from('solicitacoes_matricula')
        .select(`
          *,
          escola_desejada:escolas!solicitacoes_matricula_escola_desejada_id_fkey(nome)
        `)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSolicitacoes(data as unknown as SolicitacaoMatricula[] || []);
    } catch (err) {
      console.error('Erro ao buscar solicitações:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const criarSolicitacao = async (solicitacao: {
    nome_aluno: string;
    nome_responsavel: string;
    cpf_aluno?: string;
    cpf_responsavel?: string;
    data_nascimento?: string;
    telefone_responsavel?: string;
    email_responsavel?: string;
    endereco?: string;
    escola_desejada_id?: string;
    serie_desejada?: string;
    turno_desejado?: string;
    observacoes?: string;
  }) => {
    try {
      // Gerar protocolo simples
      const protocolo = `MAT${Date.now()}`;

      const { data, error } = await supabase
        .from('solicitacoes_matricula')
        .insert({
          ...solicitacao,
          protocolo,
          status: 'pendente'
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success(`Solicitação criada! Protocolo: ${data.protocolo}`);
      return data;
    } catch (err) {
      console.error('Erro ao criar solicitação:', err);
      toast.error('Erro ao criar solicitação de matrícula');
      return null;
    }
  };

  const atualizarStatus = async (id: string, status: StatusSolicitacaoMatricula, motivo?: string) => {
    try {
      const updates: Record<string, unknown> = { status };

      if (motivo) {
        updates.motivo_recusa = motivo;
      }

      const { error } = await supabase
        .from('solicitacoes_matricula')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      toast.success('Status atualizado');
      await fetchSolicitacoes();
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      toast.error('Erro ao atualizar status');
    }
  };

  const aprovarSolicitacao = async (id: string, turmaId?: string) => {
    try {
      // Buscar solicitação
      const { data: solicitacao } = await supabase
        .from('solicitacoes_matricula')
        .select('*')
        .eq('id', id)
        .single();

      if (!solicitacao) {
        toast.error('Solicitação não encontrada');
        return;
      }

      const sol = solicitacao as SolicitacaoMatricula;

      // Gerar número de matrícula
      const numeroMatricula = `${new Date().getFullYear()}${Date.now().toString().slice(-6)}`;

      // Criar aluno
      const { data: aluno, error: alunoError } = await supabase
        .from('alunos')
        .insert({
          nome: sol.nome_aluno,
          data_nascimento: sol.data_nascimento,
          cpf: sol.cpf_aluno,
          endereco: sol.endereco,
          responsavel_nome: sol.nome_responsavel,
          responsavel_telefone: sol.telefone_responsavel,
          responsavel_email: sol.email_responsavel,
          escola_id: sol.escola_desejada_id,
          turma_id: turmaId,
          numero_matricula: numeroMatricula,
          situacao: 'ativo'
        })
        .select()
        .single();

      if (alunoError) throw alunoError;

      // Atualizar solicitação
      const { error: updateError } = await supabase
        .from('solicitacoes_matricula')
        .update({
          status: 'aprovada'
        })
        .eq('id', id);

      if (updateError) throw updateError;

      toast.success(`Matrícula aprovada! Número: ${aluno.numero_matricula}`);
      await fetchSolicitacoes();
      return aluno;
    } catch (err) {
      console.error('Erro ao aprovar solicitação:', err);
      toast.error('Erro ao aprovar solicitação');
      return null;
    }
  };

  const rejeitarSolicitacao = async (id: string, motivo: string) => {
    await atualizarStatus(id, 'rejeitada', motivo);
  };

  const consultarPorProtocolo = async (protocolo: string) => {
    try {
      const { data, error } = await supabase
        .from('solicitacoes_matricula')
        .select(`
          *,
          escola_desejada:escolas!solicitacoes_matricula_escola_desejada_id_fkey(nome)
        `)
        .eq('protocolo', protocolo)
        .single();

      if (error) throw error;
      return data as unknown as SolicitacaoMatricula;
    } catch (err) {
      console.error('Erro ao consultar solicitação:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchSolicitacoes();
  }, [fetchSolicitacoes]);

  return {
    solicitacoes,
    loading,
    fetchSolicitacoes,
    criarSolicitacao,
    atualizarStatus,
    aprovarSolicitacao,
    rejeitarSolicitacao,
    consultarPorProtocolo
  };
}
