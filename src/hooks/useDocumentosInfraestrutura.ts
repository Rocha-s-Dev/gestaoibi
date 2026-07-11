import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DocumentoInfraestrutura {
  id: string;
  entidade: string;
  entidade_id: string;
  tipo: string | null;
  titulo: string;
  descricao: string | null;
  arquivo_path: string;
  arquivo_nome: string | null;
  arquivo_tamanho: number | null;
  mime_type: string | null;
  uploaded_by: string | null;
  created_at: string;
}

const BUCKET = "documentos-infraestrutura";

export function useDocumentosInfraestrutura(entidade?: string, entidadeId?: string) {
  const qc = useQueryClient();

  const { data: documentos = [], isLoading } = useQuery({
    queryKey: ["documentos_infraestrutura", entidade, entidadeId],
    queryFn: async () => {
      let q = supabase.from("documentos_infraestrutura" as any).select("*").order("created_at", { ascending: false });
      if (entidade) q = q.eq("entidade", entidade);
      if (entidadeId) q = q.eq("entidade_id", entidadeId);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as unknown as DocumentoInfraestrutura[];
    },
    enabled: !entidade || !!entidadeId,
  });

  const uploadDocumento = useMutation({
    mutationFn: async (params: { file: File; entidade: string; entidade_id: string; titulo: string; tipo?: string; descricao?: string }) => {
      const { data: auth } = await supabase.auth.getUser();
      const path = `${params.entidade}/${params.entidade_id}/${Date.now()}_${params.file.name}`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, params.file);
      if (upErr) throw upErr;
      const { error } = await supabase.from("documentos_infraestrutura" as any).insert({
        entidade: params.entidade,
        entidade_id: params.entidade_id,
        tipo: params.tipo ?? null,
        titulo: params.titulo,
        descricao: params.descricao ?? null,
        arquivo_path: path,
        arquivo_nome: params.file.name,
        arquivo_tamanho: params.file.size,
        mime_type: params.file.type,
        uploaded_by: auth.user?.id ?? null,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documentos_infraestrutura"] });
      toast.success("Documento enviado.");
    },
    onError: (e: any) => toast.error(e.message || "Erro ao enviar documento."),
  });

  const downloadDocumento = async (path: string) => {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 300);
    if (error) { toast.error("Erro ao gerar link."); return; }
    window.open(data.signedUrl, "_blank");
  };

  const deleteDocumento = useMutation({
    mutationFn: async (doc: DocumentoInfraestrutura) => {
      await supabase.storage.from(BUCKET).remove([doc.arquivo_path]);
      const { error } = await supabase.from("documentos_infraestrutura" as any).delete().eq("id", doc.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documentos_infraestrutura"] });
      toast.success("Documento removido.");
    },
  });

  return { documentos, isLoading, uploadDocumento, downloadDocumento, deleteDocumento };
}
