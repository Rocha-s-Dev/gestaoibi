import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface FilhoData {
  id: string;
  nome: string;
  numero_matricula: string;
  data_nascimento: string | null;
  situacao: string | null;
  turma: {
    id: string;
    nome: string;
    serie: string;
    turno: string;
  } | null;
  escola: {
    id: string;
    nome: string;
  } | null;
}

export interface NotaFilho {
  id: string;
  nota: number | null;
  bimestre: number;
  ano_letivo: number | null;
  observacoes: string | null;
  disciplina: {
    id: string;
    nome: string;
  } | null;
}

export interface FaltaFilho {
  id: string;
  data: string;
  justificada: boolean | null;
  motivo: string | null;
}

export function usePortalResponsavel() {
  const { session } = useAuth();

  // Buscar alunos vinculados ao responsável via responsaveis_alunos
  const { data: filhos = [], isLoading } = useQuery({
    queryKey: ["portal-filhos", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];

      // Buscar alunos onde o usuário é responsável via responsaveis_alunos table
      const { data, error } = await supabase
        .from("alunos")
        .select(`
          id,
          nome,
          numero_matricula,
          data_nascimento,
          situacao,
          escola:escolas(id, nome),
          turma:turmas(id, nome, serie, turno)
        `)
        .eq("responsavel_email", session.user.email);

      if (error) {
        console.error("Erro ao buscar filhos:", error);
        return [];
      }

      return (data as unknown as FilhoData[]) || [];
    },
    enabled: !!session?.user?.id,
  });

  return {
    filhos,
    isLoading,
  };
}

export function useNotasFilho(alunoId: string | undefined) {
  return useQuery({
    queryKey: ["portal-notas-filho", alunoId],
    queryFn: async (): Promise<NotaFilho[]> => {
      if (!alunoId) return [];

      const { data, error } = await supabase
        .from("notas")
        .select(`
          id,
          nota,
          bimestre,
          ano_letivo,
          observacoes,
          disciplina:disciplinas(id, nome)
        `)
        .eq("aluno_id", alunoId)
        .order("ano_letivo", { ascending: false })
        .order("bimestre", { ascending: true });

      if (error) {
        console.error("Erro ao buscar notas:", error);
        return [];
      }

      return (data as unknown as NotaFilho[]) || [];
    },
    enabled: !!alunoId,
  });
}

export function useFaltasFilho(alunoId: string | undefined) {
  return useQuery({
    queryKey: ["portal-faltas-filho", alunoId],
    queryFn: async (): Promise<FaltaFilho[]> => {
      if (!alunoId) return [];

      const { data, error } = await supabase
        .from("faltas")
        .select(`
          id,
          data,
          justificada,
          motivo
        `)
        .eq("aluno_id", alunoId)
        .order("data", { ascending: false });

      if (error) {
        console.error("Erro ao buscar faltas:", error);
        return [];
      }

      return (data as unknown as FaltaFilho[]) || [];
    },
    enabled: !!alunoId,
  });
}

export function useCardapioSemana(escolaId: string | undefined) {
  return useQuery({
    queryKey: ["portal-cardapio-semana", escolaId],
    queryFn: async () => {
      if (!escolaId) return [];

      const hoje = new Date();
      const inicioSemana = new Date(hoje);
      inicioSemana.setDate(hoje.getDate() - hoje.getDay());
      const fimSemana = new Date(inicioSemana);
      fimSemana.setDate(inicioSemana.getDate() + 6);

      const { data, error } = await supabase
        .from("cardapios")
        .select("*")
        .eq("escola_id", escolaId)
        .gte("data", inicioSemana.toISOString().split("T")[0])
        .lte("data", fimSemana.toISOString().split("T")[0])
        .order("data", { ascending: true });

      if (error) {
        console.error("Erro ao buscar cardápio:", error);
        return [];
      }

      return data || [];
    },
    enabled: !!escolaId,
  });
}
