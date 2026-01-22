import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface FilhoData {
  id: string;
  nome: string;
  numero_matricula: string;
  data_nascimento: string;
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
  [key: string]: unknown;
}

export interface NotaFilho {
  id: string;
  nota: number | null;
  bimestre: number;
  ano_letivo: number | null;
  disciplina: {
    id: string;
    nome: string;
  } | null;
  [key: string]: unknown;
}

export interface FaltaFilho {
  id: string;
  data: string;
  justificada: boolean | null;
  motivo: string | null;
  [key: string]: unknown;
}

export function usePortalResponsavel() {
  const { session } = useAuth();

  // Buscar responsável vinculado ao usuário logado
  const { data: responsavel, isLoading: loadingResponsavel } = useQuery({
    queryKey: ["portal-responsavel", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;

      // Try to find a responsavel linked to this user via responsaveis_alunos
      const { data, error } = await supabase
        .from("responsaveis_alunos")
        .select("responsavel_id")
        .limit(1);

      if (error) {
        console.error("Erro ao buscar responsável:", error);
        return null;
      }

      if (data && data.length > 0) {
        return { id: data[0].responsavel_id };
      }

      return null;
    },
    enabled: !!session?.user?.id,
  });

  // Buscar filhos vinculados ao responsável
  const { data: filhos = [], isLoading: loadingFilhos } = useQuery({
    queryKey: ["portal-filhos", responsavel?.id],
    queryFn: async () => {
      if (!responsavel?.id) return [];

      const { data, error } = await supabase
        .from("responsaveis_alunos")
        .select(`
          aluno_id,
          parentesco,
          alunos (
            id,
            nome,
            numero_matricula,
            data_nascimento,
            situacao,
            turma_id,
            escola_id,
            escolas (
              id,
              nome
            ),
            turmas (
              id,
              nome,
              serie,
              turno
            )
          )
        `)
        .eq("responsavel_id", responsavel.id);

      if (error) {
        console.error("Erro ao buscar filhos:", error);
        return [];
      }

      return (data as any[])?.map((item) => ({
        id: item.alunos?.id,
        nome: item.alunos?.nome,
        numero_matricula: item.alunos?.numero_matricula,
        data_nascimento: item.alunos?.data_nascimento,
        situacao: item.alunos?.situacao,
        turma: item.alunos?.turmas,
        escola: item.alunos?.escolas,
        parentesco: item.parentesco,
      })) || [];
    },
    enabled: !!responsavel?.id,
  });

  return {
    responsavel,
    filhos,
    isLoading: loadingResponsavel || loadingFilhos,
  };
}

export function useNotasFilho(alunoId: string | undefined) {
  return useQuery({
    queryKey: ["portal-notas-filho", alunoId],
    queryFn: async () => {
      if (!alunoId) return [];

      const { data, error } = await supabase
        .from("notas")
        .select(`
          id,
          nota,
          bimestre,
          ano_letivo,
          observacoes,
          disciplinas (
            id,
            nome
          )
        `)
        .eq("aluno_id", alunoId)
        .order("ano_letivo", { ascending: false })
        .order("bimestre", { ascending: true });

      if (error) {
        console.error("Erro ao buscar notas:", error);
        return [];
      }

      return (data as any[])?.map((nota) => ({
        ...nota,
        disciplina: nota.disciplinas,
      })) || [];
    },
    enabled: !!alunoId,
  });
}

export function useFaltasFilho(alunoId: string | undefined) {
  return useQuery({
    queryKey: ["portal-faltas-filho", alunoId],
    queryFn: async () => {
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

      return data || [];
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
