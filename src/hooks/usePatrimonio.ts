import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type StatusBem =
  | "ativo" | "em_uso" | "em_manutencao" | "ocioso" | "em_transferencia"
  | "baixado" | "alienado" | "extraviado";

export type EstadoConservacao = "novo" | "bom" | "regular" | "ruim" | "inservivel";

export type TipoMovimentacao =
  | "transferencia_secretaria" | "transferencia_unidade" | "troca_responsavel" | "mudanca_localizacao";

export type StatusMovimentacao = "pendente" | "aprovada" | "recusada" | "concluida" | "cancelada";

export const STATUS_BEM_LABELS: Record<StatusBem, string> = {
  ativo: "Ativo",
  em_uso: "Em uso",
  em_manutencao: "Em manutenção",
  ocioso: "Ocioso",
  em_transferencia: "Em transferência",
  baixado: "Baixado",
  alienado: "Alienado",
  extraviado: "Extraviado",
};

export const ESTADO_CONSERVACAO_LABELS: Record<EstadoConservacao, string> = {
  novo: "Novo",
  bom: "Bom",
  regular: "Regular",
  ruim: "Ruim",
  inservivel: "Inservível",
};

export const TIPO_MOVIMENTACAO_LABELS: Record<TipoMovimentacao, string> = {
  transferencia_secretaria: "Transferência de Secretaria",
  transferencia_unidade: "Transferência de Unidade",
  troca_responsavel: "Troca de Responsável",
  mudanca_localizacao: "Mudança de Localização",
};

export const STATUS_MOVIMENTACAO_LABELS: Record<StatusMovimentacao, string> = {
  pendente: "Pendente",
  aprovada: "Aprovada",
  recusada: "Recusada",
  concluida: "Concluída",
  cancelada: "Cancelada",
};

export interface BemCategoria {
  id: string;
  municipio_id: string | null;
  nome: string;
  codigo: string | null;
  descricao: string | null;
  vida_util_padrao_anos: number | null;
  depreciavel: boolean;
  ativo: boolean;
}

export interface BemPatrimonial {
  id: string;
  municipio_id: string | null;
  numero_tombamento: string;
  descricao: string;
  categoria_id: string | null;
  categoria: string | null;
  tipo_bem: string;
  marca: string | null;
  modelo: string | null;
  numero_serie: string | null;
  estado_conservacao: EstadoConservacao;
  status: StatusBem;
  data_aquisicao: string | null;
  data_tombamento: string;
  valor_aquisicao: number | null;
  valor_atual: number | null;
  vida_util_anos: number | null;
  depreciavel: boolean;
  valor_depreciacao_acumulada: number;
  secretaria_id: string | null;
  unidade_id: string | null;
  responsavel_id: string | null;
  localizacao: string | null;
  observacoes: string | null;
  qr_code: string | null;
  motivo_baixa: string | null;
  data_baixa: string | null;
  empenho_id: string | null;
  contrato_id: string | null;
  convenio_id: string | null;
  fornecedor_id: string | null;
  veiculo_id: string | null;
  servico_equipamento_id: string | null;
  created_at: string;
  updated_at: string;
  bens_categorias?: { nome: string } | null;
  secretarias?: { nome: string; sigla: string | null } | null;
  unidades_administrativas?: { nome: string } | null;
}

export interface BemMovimentacao {
  id: string;
  bem_id: string;
  tipo_movimentacao: TipoMovimentacao;
  secretaria_origem_id: string | null;
  secretaria_destino_id: string | null;
  unidade_origem_id: string | null;
  unidade_destino_id: string | null;
  responsavel_origem_id: string | null;
  responsavel_destino_id: string | null;
  local_origem: string | null;
  local_destino: string | null;
  data_movimentacao: string;
  motivo: string | null;
  observacoes: string | null;
  solicitado_por: string | null;
  aprovado_por: string | null;
  status: StatusMovimentacao;
  created_at: string;
  updated_at: string;
  bens_patrimoniais?: { numero_tombamento: string; descricao: string } | null;
}

export interface BemTermo {
  id: string;
  bem_id: string;
  responsavel_id: string;
  secretaria_id: string | null;
  unidade_id: string | null;
  data_inicio: string;
  data_fim: string | null;
  observacoes: string | null;
  documento_url: string | null;
  created_at: string;
}

export function useBensCategorias() {
  const qc = useQueryClient();

  const { data: categorias = [], isLoading } = useQuery({
    queryKey: ["bens_categorias"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bens_categorias" as any)
        .select("*")
        .eq("ativo", true)
        .order("nome");
      if (error) throw error;
      return (data || []) as unknown as BemCategoria[];
    },
  });

  const createCategoria = useMutation({
    mutationFn: async (payload: { nome: string; codigo?: string | null; descricao?: string | null; vida_util_padrao_anos?: number | null; depreciavel?: boolean }) => {
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await supabase.from("bens_categorias" as any).insert({
        ...payload,
        created_by: auth.user?.id ?? null,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bens_categorias"] });
      toast.success("Categoria cadastrada.");
    },
    onError: (e: any) => toast.error(e.message || "Erro ao cadastrar categoria."),
  });

  return { categorias, isLoading, createCategoria };
}

export function usePatrimonio(secretariaId?: string) {
  const qc = useQueryClient();

  const { data: bens = [], isLoading } = useQuery({
    queryKey: ["bens_patrimoniais", secretariaId],
    queryFn: async () => {
      let q = supabase
        .from("bens_patrimoniais" as any)
        .select("*, bens_categorias:categoria_id(nome), secretarias:secretaria_id(nome, sigla), unidades_administrativas:unidade_id(nome)")
        .order("created_at", { ascending: false });
      if (secretariaId) q = q.eq("secretaria_id", secretariaId);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as unknown as BemPatrimonial[];
    },
  });

  const gerarNumeroTombamento = async (municipioId?: string | null) => {
    const { data, error } = await supabase.rpc("gerar_numero_tombamento" as any, {
      p_municipio_id: municipioId ?? null,
    } as any);
    if (error) throw error;
    return data as unknown as string;
  };

  const createBem = useMutation({
    mutationFn: async (payload: Record<string, any>) => {
      const { data: auth } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("bens_patrimoniais" as any)
        .insert({ ...payload, created_by: auth.user?.id ?? null } as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as BemPatrimonial;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bens_patrimoniais"] });
      toast.success("Bem patrimonial cadastrado.");
    },
    onError: (e: any) => toast.error(e.message || "Erro ao cadastrar bem."),
  });

  const updateBem = useMutation({
    mutationFn: async ({ id, ...patch }: Record<string, any> & { id: string }) => {
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("bens_patrimoniais" as any)
        .update({ ...patch, updated_by: auth.user?.id ?? null } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bens_patrimoniais"] });
      toast.success("Bem atualizado.");
    },
    onError: (e: any) => toast.error(e.message || "Erro ao atualizar bem."),
  });

  const baixarBem = useMutation({
    mutationFn: async ({ id, motivo }: { id: string; motivo: string }) => {
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("bens_patrimoniais" as any)
        .update({
          status: "baixado",
          motivo_baixa: motivo,
          data_baixa: new Date().toISOString().split("T")[0],
          updated_by: auth.user?.id ?? null,
        } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bens_patrimoniais"] });
      toast.success("Bem baixado. O histórico foi preservado.");
    },
    onError: (e: any) => toast.error(e.message || "Erro ao baixar bem."),
  });

  return { bens, isLoading, createBem, updateBem, baixarBem, gerarNumeroTombamento };
}

export function useMovimentacoesPatrimonio(bemId?: string) {
  const qc = useQueryClient();

  const { data: movimentacoes = [], isLoading } = useQuery({
    queryKey: ["bens_movimentacoes", bemId],
    queryFn: async () => {
      let q = supabase
        .from("bens_movimentacoes" as any)
        .select("*, bens_patrimoniais:bem_id(numero_tombamento, descricao)")
        .order("created_at", { ascending: false });
      if (bemId) q = q.eq("bem_id", bemId);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as unknown as BemMovimentacao[];
    },
  });

  const createMovimentacao = useMutation({
    mutationFn: async (payload: Record<string, any>) => {
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await supabase.from("bens_movimentacoes" as any).insert({
        ...payload,
        solicitado_por: payload.solicitado_por ?? auth.user?.id ?? null,
        created_by: auth.user?.id ?? null,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bens_movimentacoes"] });
      toast.success("Movimentação registrada.");
    },
    onError: (e: any) => toast.error(e.message || "Erro ao registrar movimentação."),
  });

  const atualizarStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: StatusMovimentacao }) => {
      const { data: auth } = await supabase.auth.getUser();
      const patch: Record<string, any> = { status, updated_by: auth.user?.id ?? null };
      if (status === "aprovada" || status === "recusada") patch.aprovado_por = auth.user?.id ?? null;
      const { error } = await supabase.from("bens_movimentacoes" as any).update(patch as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bens_movimentacoes"] });
      toast.success("Situação da movimentação atualizada.");
    },
    onError: (e: any) => toast.error(e.message || "Erro ao atualizar movimentação."),
  });

  /** Conclui a movimentação e aplica os destinos ao cadastro do bem. */
  const concluirMovimentacao = useMutation({
    mutationFn: async (mov: BemMovimentacao) => {
      const { data: auth } = await supabase.auth.getUser();
      const patchBem: Record<string, any> = { updated_by: auth.user?.id ?? null };
      if (mov.secretaria_destino_id) patchBem.secretaria_id = mov.secretaria_destino_id;
      if (mov.unidade_destino_id) patchBem.unidade_id = mov.unidade_destino_id;
      if (mov.responsavel_destino_id) patchBem.responsavel_id = mov.responsavel_destino_id;
      if (mov.local_destino) patchBem.localizacao = mov.local_destino;

      const { error: errBem } = await supabase
        .from("bens_patrimoniais" as any)
        .update(patchBem as any)
        .eq("id", mov.bem_id);
      if (errBem) throw errBem;

      const { error } = await supabase
        .from("bens_movimentacoes" as any)
        .update({ status: "concluida", updated_by: auth.user?.id ?? null } as any)
        .eq("id", mov.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bens_movimentacoes"] });
      qc.invalidateQueries({ queryKey: ["bens_patrimoniais"] });
      toast.success("Movimentação concluída e bem atualizado.");
    },
    onError: (e: any) => toast.error(e.message || "Erro ao concluir movimentação."),
  });

  return { movimentacoes, isLoading, createMovimentacao, atualizarStatus, concluirMovimentacao };
}

export function useTermosResponsabilidade(bemId?: string) {
  const qc = useQueryClient();

  const { data: termos = [], isLoading } = useQuery({
    queryKey: ["bens_termos", bemId],
    queryFn: async () => {
      if (!bemId) return [] as BemTermo[];
      const { data, error } = await supabase
        .from("bens_termos_responsabilidade" as any)
        .select("*")
        .eq("bem_id", bemId)
        .order("data_inicio", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as BemTermo[];
    },
    enabled: !!bemId,
  });

  const createTermo = useMutation({
    mutationFn: async (payload: Record<string, any>) => {
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await supabase.from("bens_termos_responsabilidade" as any).insert({
        ...payload,
        created_by: auth.user?.id ?? null,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bens_termos"] });
      toast.success("Termo de responsabilidade registrado.");
    },
    onError: (e: any) => toast.error(e.message || "Erro ao registrar termo."),
  });

  const encerrarTermo = useMutation({
    mutationFn: async ({ id, data_fim }: { id: string; data_fim: string }) => {
      const { error } = await supabase
        .from("bens_termos_responsabilidade" as any)
        .update({ data_fim } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bens_termos"] });
      toast.success("Responsabilidade encerrada. O histórico foi mantido.");
    },
    onError: (e: any) => toast.error(e.message || "Erro ao encerrar responsabilidade."),
  });

  return { termos, isLoading, createTermo, encerrarTermo };
}

/** Origens financeiras existentes (somente leitura, sem duplicar cadastros). */
export function useOrigensFinanceiras() {
  const { data: fornecedores = [] } = useQuery({
    queryKey: ["patrimonio_fornecedores"],
    queryFn: async () => {
      const { data, error } = await supabase.from("fornecedores").select("id, razao_social, nome_fantasia").order("razao_social").limit(500);
      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const { data: contratos = [] } = useQuery({
    queryKey: ["patrimonio_contratos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contracts").select("id, contract_number, title").order("created_at", { ascending: false }).limit(500);
      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const { data: empenhos = [] } = useQuery({
    queryKey: ["patrimonio_empenhos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("empenhos").select("id, numero, valor_empenhado").order("created_at", { ascending: false }).limit(500);
      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const { data: convenios = [] } = useQuery({
    queryKey: ["patrimonio_convenios"],
    queryFn: async () => {
      const { data, error } = await supabase.from("convenios").select("id, numero, objeto").order("created_at", { ascending: false }).limit(500);
      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const { data: veiculos = [] } = useQuery({
    queryKey: ["patrimonio_veiculos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("veiculos_frota").select("id, placa, modelo").order("placa").limit(500);
      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const { data: equipamentos = [] } = useQuery({
    queryKey: ["patrimonio_equipamentos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("servicos_equipamentos" as any).select("id, nome, patrimonio").order("nome").limit(500);
      if (error) throw error;
      return (data || []) as any[];
    },
  });

  return { fornecedores, contratos, empenhos, convenios, veiculos, equipamentos };
}
