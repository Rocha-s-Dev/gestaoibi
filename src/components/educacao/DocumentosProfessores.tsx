import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Upload, FileText, Trash2, Download, Plus, File, FileSpreadsheet, FileImage } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEscolas } from "@/hooks/useEscolas";
import { useTurmas } from "@/hooks/useTurmas";

const tiposDocumento = [
  { value: "plano_aula", label: "Plano de Aula" },
  { value: "diario_classe", label: "Diário de Classe" },
  { value: "avaliacao_bimestral", label: "Avaliação Bimestral" },
  { value: "avaliacao_trimestral", label: "Avaliação Trimestral" },
  { value: "relatorio", label: "Relatório" },
  { value: "atividade", label: "Atividade" },
  { value: "material_apoio", label: "Material de Apoio" },
  { value: "projeto_pedagogico", label: "Projeto Pedagógico" },
  { value: "ata", label: "Ata" },
  { value: "outro", label: "Outro" },
];

const getFileIcon = (nome: string) => {
  const ext = nome.split(".").pop()?.toLowerCase();
  if (["xls", "xlsx", "csv"].includes(ext || "")) return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) return <FileImage className="h-4 w-4 text-blue-600" />;
  if (["pdf"].includes(ext || "")) return <FileText className="h-4 w-4 text-red-600" />;
  return <File className="h-4 w-4 text-muted-foreground" />;
};

export function DocumentosProfessores() {
  const { session } = useAuth();
  const user = session?.user;
  const queryClient = useQueryClient();
  const { escolas } = useEscolas();
  const { turmas } = useTurmas();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroBimestre, setFiltroBimestre] = useState<string>("todos");

  const [form, setForm] = useState({
    titulo: "",
    tipo_documento: "plano_aula",
    descricao: "",
    escola_id: "",
    turma_id: "",
    disciplina: "",
    bimestre: "",
    arquivo: null as File | null,
  });

  const { data: documentos = [], isLoading } = useQuery({
    queryKey: ["documentos_professores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documentos_professores")
        .select("*, escolas(nome), turmas(nome)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!form.arquivo || !user) throw new Error("Arquivo e login obrigatórios");

      setUploading(true);
      const fileExt = form.arquivo.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("documentos_professores")
        .upload(filePath, form.arquivo);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("documentos_professores")
        .getPublicUrl(filePath);

      const { error } = await supabase.from("documentos_professores").insert({
        professor_id: user.id,
        escola_id: form.escola_id,
        titulo: form.titulo,
        tipo_documento: form.tipo_documento,
        descricao: form.descricao || null,
        arquivo_url: urlData.publicUrl,
        arquivo_nome: form.arquivo.name,
        arquivo_tamanho: form.arquivo.size,
        bimestre: form.bimestre ? parseInt(form.bimestre) : null,
        disciplina: form.disciplina || null,
        turma_id: form.turma_id || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Documento enviado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["documentos_professores"] });
      setOpen(false);
      setForm({ titulo: "", tipo_documento: "plano_aula", descricao: "", escola_id: "", turma_id: "", disciplina: "", bimestre: "", arquivo: null });
    },
    onError: (err: any) => {
      toast.error("Erro ao enviar documento: " + err.message);
    },
    onSettled: () => setUploading(false),
  });

  const deleteMutation = useMutation({
    mutationFn: async (doc: any) => {
      // Extract path from URL
      const url = new URL(doc.arquivo_url);
      const pathParts = url.pathname.split("/documentos_professores/");
      if (pathParts[1]) {
        await supabase.storage.from("documentos_professores").remove([pathParts[1]]);
      }
      const { error } = await supabase.from("documentos_professores").delete().eq("id", doc.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Documento removido!");
      queryClient.invalidateQueries({ queryKey: ["documentos_professores"] });
    },
    onError: () => toast.error("Erro ao remover documento"),
  });

  const filteredDocs = documentos.filter((d: any) => {
    if (filtroTipo !== "todos" && d.tipo_documento !== filtroTipo) return false;
    if (filtroBimestre !== "todos" && String(d.bimestre) !== filtroBimestre) return false;
    return true;
  });

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "-";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Tipo de documento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              {tiposDocumento.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filtroBimestre} onValueChange={setFiltroBimestre}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Bimestre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="1">1º Bimestre</SelectItem>
              <SelectItem value="2">2º Bimestre</SelectItem>
              <SelectItem value="3">3º Bimestre</SelectItem>
              <SelectItem value="4">4º Bimestre</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Enviar Documento</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Enviar Novo Documento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Título *</Label>
                <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Ex: Plano de Aula - Matemática - Março" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo *</Label>
                  <Select value={form.tipo_documento} onValueChange={(v) => setForm({ ...form, tipo_documento: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {tiposDocumento.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Bimestre</Label>
                  <Select value={form.bimestre} onValueChange={(v) => setForm({ ...form, bimestre: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1º Bimestre</SelectItem>
                      <SelectItem value="2">2º Bimestre</SelectItem>
                      <SelectItem value="3">3º Bimestre</SelectItem>
                      <SelectItem value="4">4º Bimestre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Escola *</Label>
                <Select value={form.escola_id} onValueChange={(v) => setForm({ ...form, escola_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione a escola" /></SelectTrigger>
                  <SelectContent>
                    {escolas.map((e: any) => (
                      <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Turma</Label>
                  <Select value={form.turma_id} onValueChange={(v) => setForm({ ...form, turma_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {turmas.filter((t: any) => !form.escola_id || t.escola_id === form.escola_id).map((t: any) => (
                        <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Disciplina</Label>
                  <Input value={form.disciplina} onChange={(e) => setForm({ ...form, disciplina: e.target.value })} placeholder="Ex: Matemática" />
                </div>
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Descrição opcional..." rows={2} />
              </div>
              <div>
                <Label>Arquivo *</Label>
                <div className="mt-1">
                  <label className="flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-6 cursor-pointer hover:border-primary transition-colors">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {form.arquivo ? form.arquivo.name : "Clique para selecionar um arquivo"}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt,.jpg,.jpeg,.png,.gif"
                      onChange={(e) => setForm({ ...form, arquivo: e.target.files?.[0] || null })}
                    />
                  </label>
                </div>
              </div>
              <Button
                className="w-full"
                disabled={!form.titulo || !form.escola_id || !form.arquivo || uploading}
                onClick={() => uploadMutation.mutate()}
              >
                {uploading ? "Enviando..." : "Enviar Documento"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-center py-8">Carregando documentos...</p>
      ) : filteredDocs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum documento encontrado</p>
            <p className="text-sm text-muted-foreground">Clique em "Enviar Documento" para adicionar</p>
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Arquivo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Escola</TableHead>
                <TableHead>Bimestre</TableHead>
                <TableHead>Tamanho</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocs.map((doc: any) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-0">
                      {getFileIcon(doc.arquivo_nome)}
                      <div className="min-w-0">
                        <p className="font-medium truncate">{doc.titulo}</p>
                        <p className="text-xs text-muted-foreground truncate">{doc.arquivo_nome}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {tiposDocumento.find((t) => t.value === doc.tipo_documento)?.label || doc.tipo_documento}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{doc.escolas?.nome || "-"}</TableCell>
                  <TableCell>{doc.bimestre ? `${doc.bimestre}º` : "-"}</TableCell>
                  <TableCell className="text-sm">{formatSize(doc.arquivo_tamanho)}</TableCell>
                  <TableCell className="text-sm">{format(new Date(doc.created_at), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <a href={doc.arquivo_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                      {doc.professor_id === user?.id && (
                        <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(doc)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
