import { useDocumentosSociais, type DocumentoSocial } from "@/hooks/useDocumentosSociais";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Trash2, Download, FileText } from "lucide-react";
import { useRef } from "react";

export function DocumentosSociaisPanel({
  entidadeTipo, entidadeId, familiaId, categoria,
}: {
  entidadeTipo: string; entidadeId: string;
  familiaId?: string | null; categoria?: string;
}) {
  const { documentos, upload, remover, download } = useDocumentosSociais(entidadeTipo, entidadeId);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = async (f: File | null) => {
    if (!f) return;
    await upload.mutateAsync({ file: f, entidade_tipo: entidadeTipo, entidade_id: entidadeId, categoria, familia_id: familiaId ?? null });
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Input ref={inputRef} type="file" className="max-w-xs" onChange={(e) => onFile(e.target.files?.[0] || null)} />
        <Upload className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        {(documentos || []).length === 0 && <p className="text-sm text-muted-foreground">Nenhum documento anexado.</p>}
        {(documentos || []).map((d: DocumentoSocial) => (
          <div key={d.id} className="flex items-center justify-between rounded border p-2 text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{d.nome}</span>
              {d.categoria && <span className="text-xs text-muted-foreground">({d.categoria})</span>}
            </div>
            <div className="flex gap-1 shrink-0">
              <Button size="icon" variant="ghost" onClick={() => download(d)}><Download className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => remover.mutate(d)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
