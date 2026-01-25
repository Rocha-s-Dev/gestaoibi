import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type StatusSolicitacaoMatricula = 'pendente' | 'em_analise' | 'aprovada' | 'rejeitada' | 'lista_espera';

export interface DadosAluno {
  nome: string;
  data_nascimento: string;
  cpf?: string;
  endereco?: string;
  necessidades_especiais?: string;
}

export interface DadosResponsavel {
  nome: string;
  cpf: string;
  telefone: string;
  email?: string;
  grau_parentesco: string;
}

export interface SolicitacaoMatricula {
  id: string;
  protocolo: string;
  status: StatusSolicitacaoMatricula;
  nome_aluno: string;
  data_nascimento: string;
  cpf_aluno?: string;
  cpf_responsavel: string;
  nome_responsavel: string;
  telefone_responsavel: string;
  email_responsavel?: string;
  endereco?: string;
  escola_desejada_id?: string;
  serie_pretendida?: string;
  ano_letivo: number;
  documentos?: { tipo: string; url: string }[];
  observacoes?: string;
  motivo_rejeicao?: string;
  created_at: string;
  escola_desejada?: { nome: string };
}

export function useSolicitacoesMatricula() {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoMatricula[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSolicitacoes = useCallback(async (status?: StatusSolicitacaoMatricula) => {
    try {
      setLoading(true);
      let query = (supabase
        .from('solicitacoes_matricula') as any)
        .select(`
          *,
          escola_desejada:escolas(nome)
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
    data_nascimento: string;
    cpf_aluno?: string;
    cpf_responsavel: string;
    nome_responsavel: string;
    telefone_responsavel: string;
    email_responsavel?: string;
    endereco?: string;
    escola_desejada_id?: string;
    serie_pretendida?: string;
    ano_letivo: number;
    observacoes?: string;
  }) => {
    try {
      // Gerar protocolo simples
      const protocolo = `MAT${Date.now()}`;

      const { data, error } = await (supabase
        .from('solicitacoes_matricula') as any)
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
      const updates: Record<string, unknown> = { 
        status,
        updated_at: new Date().toISOString()
      };

      if (motivo) {
        updates.motivo_rejeicao = motivo;
      }

      const { error } = await (supabase
        .from('solicitacoes_matricula') as any)
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
      const { data: solicitacao } = await (supabase
        .from('solicitacoes_matricula') as any)
        .select('*')
        .eq('id', id)
        .single();

      if (!solicitacao) {
        toast.error('Solicitação não encontrada');
        return;
      }

      // Gerar número de matrícula simples
      const numeroMatricula = `${new Date().getFullYear()}${Date.now().toString().slice(-6)}`;

      // Criar aluno
      const { data: aluno, error: alunoError } = await supabase
        .from('alunos')
        .insert({
          nome: solicitacao.nome_aluno,
          data_nascimento: solicitacao.data_nascimento,
          cpf: solicitacao.cpf_aluno,
          endereco: solicitacao.endereco,
          escola_id: solicitacao.escola_desejada_id,
          turma_id: turmaId,
          numero_matricula: numeroMatricula,
          situacao: 'ativo',
          responsavel_nome: solicitacao.nome_responsavel,
          responsavel_telefone: solicitacao.telefone_responsavel,
          responsavel_email: solicitacao.email_responsavel
        })
        .select()
        .single();

      if (alunoError) throw alunoError;

      // Atualizar solicitação
      const { error: updateError } = await (supabase
        .from('solicitacoes_matricula') as any)
        .update({
          status: 'aprovada',
          updated_at: new Date().toISOString()
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
      const { data, error } = await (supabase
        .from('solicitacoes_matricula') as any)
        .select(`
          *,
          escola_desejada:escolas(nome)
        `)
        .eq('protocolo', protocolo)
        .maybeSingle();

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
