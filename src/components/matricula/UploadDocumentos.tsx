import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, X, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Documento {
  tipo: string;
  url: string;
  nome?: string;
}

interface UploadDocumentosProps {
  documentos: Documento[];
  onChange: (documentos: Documento[]) => void;
}

const TIPOS_DOCUMENTO = [
  { value: "certidao_nascimento", label: "Certidão de Nascimento" },
  { value: "rg_aluno", label: "RG do Aluno" },
  { value: "cpf_aluno", label: "CPF do Aluno" },
  { value: "comprovante_residencia", label: "Comprovante de Residência" },
  { value: "historico_escolar", label: "Histórico Escolar" },
  { value: "rg_responsavel", label: "RG do Responsável" },
  { value: "cpf_responsavel", label: "CPF do Responsável" },
  { value: "cartao_vacinacao", label: "Cartão de Vacinação" },
  { value: "laudo_medico", label: "Laudo Médico" },
  { value: "foto_3x4", label: "Foto 3x4" },
  { value: "outros", label: "Outros" },
];

export function UploadDocumentos({ documentos, onChange }: UploadDocumentosProps) {
  const [tipoSelecionado, setTipoSelecionado] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!tipoSelecionado) {
      toast.error("Selecione o tipo de documento primeiro");
      return;
    }

    // Validar tamanho (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 5MB");
      return;
    }

    // Validar tipo
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Tipo de arquivo não permitido. Use JPG, PNG ou PDF");
      return;
    }

    setUploading(true);

    try {
      // Simular upload - em produção, fazer upload para Supabase Storage
      // const { data, error } = await supabase.storage.from('documentos-matricula').upload(...)
      
      // Por enquanto, criar uma URL temporária
      const fakeUrl = URL.createObjectURL(file);
      
      const novoDocumento: Documento = {
        tipo: tipoSelecionado,
        url: fakeUrl,
        nome: file.name,
      };

      onChange([...documentos, novoDocumento]);
      toast.success("Documento adicionado");
      setTipoSelecionado("");
      
      // Reset input
      e.target.value = "";
    } catch (error) {
      toast.error("Erro ao fazer upload do documento");
    } finally {
      setUploading(false);
    }
  };

  const removerDocumento = (index: number) => {
    const novosDocumentos = documentos.filter((_, i) => i !== index);
    onChange(novosDocumentos);
    toast.success("Documento removido");
  };

  const getTipoLabel = (tipo: string) => {
    return TIPOS_DOCUMENTO.find((t) => t.value === tipo)?.label || tipo;
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="flex-1">
          <Select value={tipoSelecionado} onValueChange={setTipoSelecionado}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo de documento" />
            </SelectTrigger>
            <SelectContent>
              {TIPOS_DOCUMENTO.map((tipo) => (
                <SelectItem key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="relative">
          <Input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            disabled={uploading || !tipoSelecionado}
            className="absolute inset-0 cursor-pointer opacity-0"
            id="file-upload"
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploading || !tipoSelecionado}
            className="pointer-events-none"
          >
            {uploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Anexar
          </Button>
        </div>
      </div>

      {documentos.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">
            Documentos anexados ({documentos.length})
          </Label>
          <div className="space-y-2">
            {documentos.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border bg-muted/30 p-3"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{getTipoLabel(doc.tipo)}</p>
                    {doc.nome && (
                      <p className="text-xs text-muted-foreground">{doc.nome}</p>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removerDocumento(index)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Formatos aceitos: JPG, PNG, PDF. Tamanho máximo: 5MB por arquivo.
      </p>
    </div>
  );
}
