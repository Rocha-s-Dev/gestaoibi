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
  };
}

export interface NotaFilho {
  id: string;
  nota: number | null;
  bimestre: number;
  ano_letivo: number;
  tipo_avaliacao: string | null;
  disciplina: {
    id: string;
    nome: string;
  };
}

export interface FaltaFilho {
  id: string;
  data_falta: string;
  tipo: string | null;
  justificativa: string | null;
  disciplina: {
    id: string;
    nome: string;
  };
}

export function usePortalResponsavel() {
  const { session } = useAuth();

  // Buscar responsável vinculado ao usuário logado
  const { data: responsavel, isLoading: loadingResponsavel } = useQuery({
    queryKey: ["portal-responsavel", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;

      const { data, error } = await supabase
        .from("usuarios_responsaveis")
        .select(`
          responsavel_id,
          responsaveis (
            id,
            nome,
            cpf,
            telefone,
            email
          )
        `)
        .eq("user_id", session.user.id)
        .single();

      if (error) {
        console.error("Erro ao buscar responsável:", error);
        return null;
      }

      return data?.responsaveis;
    },
    enabled: !!session?.user?.id,
  });

  // Buscar filhos vinculados ao responsável
  const { data: filhos = [], isLoading: loadingFilhos } = useQuery({
    queryKey: ["portal-filhos", responsavel?.id],
    queryFn: async () => {
      if (!responsavel?.id) return [];

      const { data, error } = await supabase
        .from("alunos_responsaveis")
        .select(`
          aluno_id,
          responsavel_principal,
          alunos (
            id,
            nome,
            numero_matricula,
            data_nascimento,
            status,
            turma_atual_id,
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

      return data?.map((item) => ({
        id: item.alunos?.id,
        nome: item.alunos?.nome,
        numero_matricula: item.alunos?.numero_matricula,
        data_nascimento: item.alunos?.data_nascimento,
        status: item.alunos?.status,
        turma: item.alunos?.turmas,
        escola: item.alunos?.escolas,
        responsavel_principal: item.responsavel_principal,
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
          tipo_avaliacao,
          data_avaliacao,
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

      return data?.map((nota) => ({
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
          data_falta,
          tipo,
          justificativa,
          disciplinas (
            id,
            nome
          )
        `)
        .eq("aluno_id", alunoId)
        .order("data_falta", { ascending: false });

      if (error) {
        console.error("Erro ao buscar faltas:", error);
        return [];
      }

      return data?.map((falta) => ({
        ...falta,
        disciplina: falta.disciplinas,
      })) || [];
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
