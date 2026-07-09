import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DocumentoSocial {
  id: string;
  entidade_tipo: string;
  entidade_id: string;
  nome: string;
  descricao: string | null;
  storage_path: string;
  mime_type: string | null;
  tamanho_bytes: number | null;
  categoria: string | null;
  familia_id: string | null;
  created_at: string;
}

export function useDocumentosSociais(entidadeTipo?: string, entidadeId?: string) {
  const qc = useQueryClient();

  const { data: documentos, isLoading } = useQuery({
    queryKey: ["documentos_sociais", entidadeTipo, entidadeId],
    queryFn: async () => {
      if (!entidadeTipo || !entidadeId) return [];
      const { data, error } = await supabase
        .from("documentos_sociais")
        .select("*")
        .eq("entidade_tipo", entidadeTipo as any)
        .eq("entidade_id", entidadeId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any as DocumentoSocial[];
    },
    enabled: !!(entidadeTipo && entidadeId),
  });

  const upload = useMutation({
    mutationFn: async ({ file, entidade_tipo, entidade_id, categoria, familia_id, descricao }: {
      file: File; entidade_tipo: string; entidade_id: string; categoria?: string; familia_id?: string | null; descricao?: string;
    }) => {
      const { data: u } = await supabase.auth.getUser();
      const path = `${entidade_tipo}/${entidade_id}/${Date.now()}_${file.name}`;
      const { error: upErr } = await supabase.storage.from("documentos-social").upload(path, file);
      if (upErr) throw upErr;
      const { error } = await supabase.from("documentos_sociais").insert({
        entidade_tipo: entidade_tipo as any,
        entidade_id, nome: file.name, storage_path: path,
        mime_type: file.type, tamanho_bytes: file.size,
        categoria, familia_id, descricao, created_by: u.user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["documentos_sociais"] }); toast.success("Arquivo enviado"); },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });

  const remover = useMutation({
    mutationFn: async (doc: DocumentoSocial) => {
      await supabase.storage.from("documentos-social").remove([doc.storage_path]);
      const { error } = await supabase.from("documentos_sociais").delete().eq("id", doc.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["documentos_sociais"] }); toast.success("Arquivo removido"); },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });

  const download = async (doc: DocumentoSocial) => {
    const { data, error } = await supabase.storage.from("documentos-social").createSignedUrl(doc.storage_path, 3600);
    if (error) { toast.error(error.message); return; }
    window.open(data.signedUrl, "_blank");
  };

  return { documentos, isLoading, upload, remover, download };
}
