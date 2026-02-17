import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useCoordenacaoPedagogica(escolaId?: string | null) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  // Fetch alunos with notas and faltas for risk analysis
  const { data: alunos = [], isLoading: loadingAlunos } = useQuery({
    queryKey: ["coordenacao-alunos", escolaId],
    queryFn: async () => {
      let query = supabase.from("alunos").select("*, turma:turmas(*, escola:escolas(*))");
      if (escolaId) {
        query = query.eq("escola_id", escolaId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!session,
  });

  const { data: notas = [], isLoading: loadingNotas } = useQuery({
    queryKey: ["coordenacao-notas", escolaId],
    queryFn: async () => {
      const { data, error } = await supabase.from("notas").select("*, aluno:alunos(*, escola:escolas(*)), disciplina:disciplinas(*)");
      if (error) throw error;
      if (escolaId) {
        return (data || []).filter((n: any) => n.aluno?.escola_id === escolaId);
      }
      return data || [];
    },
    enabled: !!session,
  });

  const { data: faltas = [], isLoading: loadingFaltas } = useQuery({
    queryKey: ["coordenacao-faltas", escolaId],
    queryFn: async () => {
      const { data, error } = await supabase.from("faltas").select("*, aluno:alunos(*)");
      if (error) throw error;
      if (escolaId) {
        return (data || []).filter((f: any) => f.aluno?.escola_id === escolaId);
      }
      return data || [];
    },
    enabled: !!session,
  });

  const { data: turmas = [] } = useQuery({
    queryKey: ["coordenacao-turmas", escolaId],
    queryFn: async () => {
      let query = supabase.from("turmas").select("*, escola:escolas(*)");
      if (escolaId) query = query.eq("escola_id", escolaId);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!session,
  });

  const { data: disciplinas = [] } = useQuery({
    queryKey: ["coordenacao-disciplinas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("disciplinas").select("*");
      if (error) throw error;
      return data || [];
    },
    enabled: !!session,
  });

  const { data: professores = [] } = useQuery({
    queryKey: ["coordenacao-professores", escolaId],
    queryFn: async () => {
      let query = supabase.from("professores").select("*, escola:escolas(*)");
      if (escolaId) query = query.eq("escola_id", escolaId);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!session,
  });

  const { data: escolas = [] } = useQuery({
    queryKey: ["coordenacao-escolas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("escolas").select("*").order("nome");
      if (error) throw error;
      return data || [];
    },
    enabled: !!session,
  });

  // Intervenções
  const { data: intervencoes = [], isLoading: loadingIntervencoes } = useQuery({
    queryKey: ["intervencoes-pedagogicas", escolaId],
    queryFn: async () => {
      let query = supabase.from("intervencoes_pedagogicas").select("*, aluno:alunos(*, turma:turmas(*))").order("created_at", { ascending: false });
      if (escolaId) query = query.eq("escola_id", escolaId);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!session,
  });

  const createIntervencao = useMutation({
    mutationFn: async (values: any) => {
      const { error } = await supabase.from("intervencoes_pedagogicas").insert(values);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intervencoes-pedagogicas"] });
      toast.success("Intervenção registrada com sucesso");
    },
    onError: (e: any) => toast.error("Erro ao registrar intervenção: " + e.message),
  });

  const updateIntervencao = useMutation({
    mutationFn: async ({ id, ...values }: any) => {
      const { error } = await supabase.from("intervencoes_pedagogicas").update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intervencoes-pedagogicas"] });
      toast.success("Intervenção atualizada");
    },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });

  // Eventos pedagógicos
  const { data: eventos = [], isLoading: loadingEventos } = useQuery({
    queryKey: ["eventos-pedagogicos", escolaId],
    queryFn: async () => {
      let query = supabase.from("eventos_pedagogicos").select("*").order("data_evento", { ascending: false });
      if (escolaId) query = query.eq("escola_id", escolaId);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!session,
  });

  const createEvento = useMutation({
    mutationFn: async (values: any) => {
      const { error } = await supabase.from("eventos_pedagogicos").insert(values);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventos-pedagogicos"] });
      toast.success("Evento criado com sucesso");
    },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });

  const updateEvento = useMutation({
    mutationFn: async ({ id, ...values }: any) => {
      const { error } = await supabase.from("eventos_pedagogicos").update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventos-pedagogicos"] });
      toast.success("Evento atualizado");
    },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });

  const deleteEvento = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("eventos_pedagogicos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventos-pedagogicos"] });
      toast.success("Evento removido");
    },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });

  return {
    alunos, notas, faltas, turmas, disciplinas, professores, escolas,
    intervencoes, eventos,
    loadingAlunos, loadingNotas, loadingFaltas, loadingIntervencoes, loadingEventos,
    createIntervencao, updateIntervencao,
    createEvento, updateEvento, deleteEvento,
  };
}
