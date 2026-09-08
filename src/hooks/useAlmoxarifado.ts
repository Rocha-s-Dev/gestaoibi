import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useMunicipios } from "@/hooks/useMunicipios";

export interface AlmoxarifadoCategoria {
  id: string;
  municipio_id: string | null;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface AlmoxarifadoUnidadeMedida {
  id: string;
  municipio_id: string | null;
  sigla: string;
  nome: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface AlmoxarifadoLocalizacao {
  id: string;
  municipio_id: string | null;
  nome: string;
  codigo: string | null;
  descricao: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface AlmoxarifadoItem {
  id: string;
  municipio_id: string | null;
  codigo: string | null;
  nome: string;
  descricao: string | null;
  categoria_id: string;
  unidade_medida_id: string;
  marca: string | null;
  modelo: string | null;
  especificacao: string | null;
  estoque_minimo: number;
  estoque_maximo: number | null;
  estoque_atual: number;
  estoque_reservado: number;
  localizacao_id: string | null;
  valor_medio: number | null;
  controla_lote: boolean;
  controla_validade: boolean;
  ativo: boolean;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export type AlmoxarifadoItemInput = {
  nome: string;
  descricao?: string | null;
  categoria_id: string;
  unidade_medida_id: string;
  marca?: string | null;
  modelo?: string | null;
  especificacao?: string | null;
  estoque_minimo?: number;
  estoque_maximo?: number | null;
  localizacao_id?: string | null;
  valor_medio?: number | null;
  controla_lote?: boolean;
  controla_validade?: boolean;
  observacoes?: string | null;
  ativo?: boolean;
};

const table = (name: string) => supabase.from(name as any);

/* ------------------------- Configurações ------------------------- */

export function useAlmoxarifadoCategorias() {
  const qc = useQueryClient();
  const { municipioAtivo } = useMunicipios();

  const { data: categorias = [], isLoading } = useQuery({
    queryKey: ["almoxarifado_categorias"],
    queryFn: async () => {
      const { data, error } = await table("almoxarifado_categorias").select("*").order("nome");
      if (error) throw error;
      return (data || []) as unknown as AlmoxarifadoCategoria[];
    },
  });

  const salvar = useMutation({
    mutationFn: async (payload: { id?: string; nome: string; descricao?: string | null; ativo?: boolean }) => {
      const { data: auth } = await supabase.auth.getUser();
      if (payload.id) {
        const { error } = await table("almoxarifado_categorias")
          .update({
            nome: payload.nome.trim(),
            descricao: payload.descricao ?? null,
            ativo: payload.ativo ?? true,
            updated_by: auth.user?.id ?? null,
          } as any)
          .eq("id", payload.id);
        if (error) throw error;
      } else {
        const { error } = await table("almoxarifado_categorias").insert({
          nome: payload.nome.trim(),
          descricao: payload.descricao ?? null,
          municipio_id: municipioAtivo?.id ?? null,
          created_by: auth.user?.id ?? null,
        } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["almoxarifado_categorias"] });
      toast.success("Categoria salva.");
    },
    onError: (e: any) =>
      toast.error(
        e?.code === "23505" || String(e?.message).includes("almox_categorias_nome_unq")
          ? "Já existe uma categoria com esse nome neste município."
          : e?.message || "Erro ao salvar categoria.",
      ),
  });

  return { categorias, isLoading, salvar };
}

export function useAlmoxarifadoUnidades() {
  const qc = useQueryClient();
  const { municipioAtivo } = useMunicipios();

  const { data: unidades = [], isLoading } = useQuery({
    queryKey: ["almoxarifado_unidades_medida"],
    queryFn: async () => {
      const { data, error } = await table("almoxarifado_unidades_medida").select("*").order("sigla");
      if (error) throw error;
      return (data || []) as unknown as AlmoxarifadoUnidadeMedida[];
    },
  });

  const salvar = useMutation({
    mutationFn: async (payload: { id?: string; sigla: string; nome: string; ativo?: boolean }) => {
      const { data: auth } = await supabase.auth.getUser();
      if (payload.id) {
        const { error } = await table("almoxarifado_unidades_medida")
          .update({
            sigla: payload.sigla.trim().toUpperCase(),
            nome: payload.nome.trim(),
            ativo: payload.ativo ?? true,
            updated_by: auth.user?.id ?? null,
          } as any)
          .eq("id", payload.id);
        if (error) throw error;
      } else {
        const { error } = await table("almoxarifado_unidades_medida").insert({
          sigla: payload.sigla.trim().toUpperCase(),
          nome: payload.nome.trim(),
          municipio_id: municipioAtivo?.id ?? null,
          created_by: auth.user?.id ?? null,
        } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["almoxarifado_unidades_medida"] });
      toast.success("Unidade de medida salva.");
    },
    onError: (e: any) =>
      toast.error(
        String(e?.message).includes("almox_unidades_sigla_unq")
          ? "Já existe uma unidade com essa sigla neste município."
          : e?.message || "Erro ao salvar unidade.",
      ),
  });

  return { unidades, isLoading, salvar };
}

export function useAlmoxarifadoLocalizacoes() {
  const qc = useQueryClient();
  const { municipioAtivo } = useMunicipios();

  const { data: localizacoes = [], isLoading } = useQuery({
    queryKey: ["almoxarifado_localizacoes"],
    queryFn: async () => {
      const { data, error } = await table("almoxarifado_localizacoes").select("*").order("nome");
      if (error) throw error;
      return (data || []) as unknown as AlmoxarifadoLocalizacao[];
    },
  });

  const salvar = useMutation({
    mutationFn: async (payload: {
      id?: string;
      nome: string;
      codigo?: string | null;
      descricao?: string | null;
      ativo?: boolean;
    }) => {
      const { data: auth } = await supabase.auth.getUser();
      if (payload.id) {
        const { error } = await table("almoxarifado_localizacoes")
          .update({
            nome: payload.nome.trim(),
            codigo: payload.codigo ?? null,
            descricao: payload.descricao ?? null,
            ativo: payload.ativo ?? true,
            updated_by: auth.user?.id ?? null,
          } as any)
          .eq("id", payload.id);
        if (error) throw error;
      } else {
        const { error } = await table("almoxarifado_localizacoes").insert({
          nome: payload.nome.trim(),
          codigo: payload.codigo ?? null,
          descricao: payload.descricao ?? null,
          municipio_id: municipioAtivo?.id ?? null,
          created_by: auth.user?.id ?? null,
        } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["almoxarifado_localizacoes"] });
      toast.success("Localização salva.");
    },
    onError: (e: any) =>
      toast.error(
        String(e?.message).includes("almox_localizacoes_nome_unq")
          ? "Já existe uma localização com esse nome neste município."
          : e?.message || "Erro ao salvar localização.",
      ),
  });

  return { localizacoes, isLoading, salvar };
}

/* ------------------------- Materiais ------------------------- */

export function useAlmoxarifadoMateriais() {
  const qc = useQueryClient();
  const { municipioAtivo } = useMunicipios();

  const { data: itens = [], isLoading } = useQuery({
    queryKey: ["almoxarifado_itens"],
    queryFn: async () => {
      const { data, error } = await table("almoxarifado_itens").select("*").order("codigo");
      if (error) throw error;
      return (data || []) as unknown as AlmoxarifadoItem[];
    },
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["almoxarifado_itens"] });
  };

  const criarMaterial = useMutation({
    mutationFn: async (payload: AlmoxarifadoItemInput) => {
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await table("almoxarifado_itens").insert({
        nome: payload.nome.trim(),
        descricao: payload.descricao ?? null,
        categoria_id: payload.categoria_id,
        unidade_medida_id: payload.unidade_medida_id,
        marca: payload.marca ?? null,
        modelo: payload.modelo ?? null,
        especificacao: payload.especificacao ?? null,
        estoque_minimo: payload.estoque_minimo ?? 0,
        estoque_maximo: payload.estoque_maximo ?? null,
        localizacao_id: payload.localizacao_id ?? null,
        valor_medio: payload.valor_medio ?? null,
        controla_lote: payload.controla_lote ?? false,
        controla_validade: payload.controla_validade ?? false,
        observacoes: payload.observacoes ?? null,
        municipio_id: municipioAtivo?.id ?? null,
        created_by: auth.user?.id ?? null,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Material cadastrado.");
    },
    onError: (e: any) => toast.error(mapItemError(e)),
  });

  const atualizarMaterial = useMutation({
    mutationFn: async ({ id, ...payload }: AlmoxarifadoItemInput & { id: string }) => {
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await table("almoxarifado_itens")
        .update({
          nome: payload.nome.trim(),
          descricao: payload.descricao ?? null,
          categoria_id: payload.categoria_id,
          unidade_medida_id: payload.unidade_medida_id,
          marca: payload.marca ?? null,
          modelo: payload.modelo ?? null,
          especificacao: payload.especificacao ?? null,
          estoque_minimo: payload.estoque_minimo ?? 0,
          estoque_maximo: payload.estoque_maximo ?? null,
          localizacao_id: payload.localizacao_id ?? null,
          valor_medio: payload.valor_medio ?? null,
          controla_lote: payload.controla_lote ?? false,
          controla_validade: payload.controla_validade ?? false,
          observacoes: payload.observacoes ?? null,
          ativo: payload.ativo ?? true,
          updated_by: auth.user?.id ?? null,
        } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Material atualizado.");
    },
    onError: (e: any) => toast.error(mapItemError(e)),
  });

  const alterarSituacao = useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await table("almoxarifado_itens")
        .update({ ativo, updated_by: auth.user?.id ?? null } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      invalidate();
      toast.success(vars.ativo ? "Material reativado." : "Material inativado.");
    },
    onError: (e: any) => toast.error(e?.message || "Erro ao alterar situação."),
  });

  return { itens, isLoading, criarMaterial, atualizarMaterial, alterarSituacao };
}

function mapItemError(e: any) {
  const msg = String(e?.message || "");
  if (msg.includes("almox_itens_nome_unq")) return "Já existe um material com esse nome neste município.";
  if (msg.includes("estoque_max_maior")) return "O estoque máximo não pode ser menor que o mínimo.";
  if (msg.includes("nao_negativo")) return "Os valores de estoque não podem ser negativos.";
  return msg || "Erro ao salvar material.";
}

export const estoqueDisponivel = (item: AlmoxarifadoItem) =>
  Number(item.estoque_atual || 0) - Number(item.estoque_reservado || 0);
