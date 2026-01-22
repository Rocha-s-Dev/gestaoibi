import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type StatusSolicitacaoMatricula = 'pendente' | 'em_analise' | 'aprovada' | 'rejeitada' | 'lista_espera';

export interface DadosAluno {
  nome: string;
  data_nascimento: string;
  cpf?: string;
  rg?: string;
  genero?: string;
  endereco?: string;
  numero_endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  necessidades_especiais?: string;
}

export interface DadosResponsavel {
  nome: string;
  cpf: string;
  rg?: string;
  telefone: string;
  email?: string;
  grau_parentesco: string;
  endereco?: string;
  profissao?: string;
}

export interface SolicitacaoMatricula {
  id: string;
  protocolo: string;
  status: StatusSolicitacaoMatricula;
  dados_aluno: DadosAluno;
  dados_responsavel: DadosResponsavel;
  escola_preferida_id?: string;
  turma_sugerida_id?: string;
  ano_letivo: number;
  serie_pretendida: string;
  documentos?: { tipo: string; url: string }[];
  observacoes?: string;
  motivo_rejeicao?: string;
  aluno_criado_id?: string;
  data_processamento?: string;
  processado_por?: string;
  created_at: string;
  escola_preferida?: { nome: string };
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
          escola_preferida:escolas(nome)
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
    dados_aluno: DadosAluno;
    dados_responsavel: DadosResponsavel;
    escola_preferida_id?: string;
    ano_letivo: number;
    serie_pretendida: string;
    observacoes?: string;
  }) => {
    try {
      // Gerar protocolo
      const { data: protocolo } = await supabase.rpc('gerar_protocolo_matricula');

      const { data, error } = await supabase
        .from('solicitacoes_matricula')
        .insert({
          ...solicitacao,
          protocolo: protocolo || `MAT${Date.now()}`,
          status: 'pendente'
        } as never)
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
        data_processamento: new Date().toISOString()
      };

      if (motivo) {
        updates.motivo_rejeicao = motivo;
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

      const dadosAluno = solicitacao.dados_aluno as unknown as DadosAluno;
      const dadosResponsavel = solicitacao.dados_responsavel as unknown as DadosResponsavel;

      // Criar responsável
      const { data: responsavel, error: respError } = await supabase
        .from('responsaveis')
        .insert({
          nome: dadosResponsavel.nome,
          cpf: dadosResponsavel.cpf,
          rg: dadosResponsavel.rg,
          telefone: dadosResponsavel.telefone,
          email: dadosResponsavel.email,
          grau_parentesco: dadosResponsavel.grau_parentesco,
          endereco: dadosResponsavel.endereco,
          profissao: dadosResponsavel.profissao
        })
        .select()
        .single();

      if (respError) throw respError;

      // Gerar número de matrícula
      const { data: numeroMatricula } = await supabase.rpc('gerar_numero_matricula');

      // Criar aluno
      const { data: aluno, error: alunoError } = await supabase
        .from('alunos')
        .insert({
          nome: dadosAluno.nome,
          data_nascimento: dadosAluno.data_nascimento,
          cpf: dadosAluno.cpf,
          rg: dadosAluno.rg,
          genero: dadosAluno.genero,
          endereco: dadosAluno.endereco,
          numero_endereco: dadosAluno.numero_endereco,
          bairro: dadosAluno.bairro,
          cidade: dadosAluno.cidade,
          estado: dadosAluno.estado,
          cep: dadosAluno.cep,
          telefone: dadosAluno.telefone,
          email: dadosAluno.email,
          necessidades_especiais: dadosAluno.necessidades_especiais,
          escola_id: solicitacao.escola_preferida_id,
          turma_atual_id: turmaId || solicitacao.turma_sugerida_id,
          numero_matricula: numeroMatricula || `${new Date().getFullYear()}${Date.now().toString().slice(-6)}`,
          status: 'matriculado'
        })
        .select()
        .single();

      if (alunoError) throw alunoError;

      // Vincular aluno ao responsável
      await supabase
        .from('alunos_responsaveis')
        .insert({
          aluno_id: aluno.id,
          responsavel_id: responsavel.id,
          responsavel_principal: true,
          autorizado_buscar: true
        });

      // Atualizar solicitação
      const { error: updateError } = await supabase
        .from('solicitacoes_matricula')
        .update({
          status: 'aprovada',
          aluno_criado_id: aluno.id,
          turma_sugerida_id: turmaId || solicitacao.turma_sugerida_id,
          data_processamento: new Date().toISOString()
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
          escola_preferida:escolas(nome)
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
