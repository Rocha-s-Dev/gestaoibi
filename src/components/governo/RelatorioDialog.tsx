
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Relatorio = {
  id: string;
  titulo: string;
  tipo: "mensal" | "trimestral" | "semestral" | "anual";
  categoria: "atividades" | "financeiro" | "projetos" | "resultados";
  dataPublicacao: Date;
  status: "publicado" | "rascunho" | "em_revisao";
  downloads: number;
  responsavel: string;
  arquivo?: string;
};

type RelatorioDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (relatorio: Omit<Relatorio, "id"> | Relatorio) => void;
  relatorio?: Relatorio | null;
};

export function RelatorioDialog({ open, onOpenChange, onSubmit, relatorio }: RelatorioDialogProps) {
  const [formData, setFormData] = useState({
    titulo: "",
    tipo: "mensal" as "mensal" | "trimestral" | "semestral" | "anual",
    categoria: "atividades" as "atividades" | "financeiro" | "projetos" | "resultados",
    dataPublicacao: "",
    status: "rascunho" as "publicado" | "rascunho" | "em_revisao",
    downloads: "0",
    responsavel: "",
    arquivo: ""
  });

  useEffect(() => {
    if (relatorio) {
      setFormData({
        titulo: relatorio.titulo,
        tipo: relatorio.tipo,
        categoria: relatorio.categoria,
        dataPublicacao: relatorio.dataPublicacao.toISOString().split('T')[0],
        status: relatorio.status,
        downloads: relatorio.downloads.toString(),
        responsavel: relatorio.responsavel,
        arquivo: relatorio.arquivo || ""
      });
    } else {
      setFormData({
        titulo: "",
        tipo: "mensal",
        categoria: "atividades",
        dataPublicacao: "",
        status: "rascunho",
        downloads: "0",
        responsavel: "",
        arquivo: ""
      });
    }
  }, [relatorio]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const relatorioData = {
      ...formData,
      downloads: parseInt(formData.downloads),
      dataPublicacao: new Date(formData.dataPublicacao),
      arquivo: formData.arquivo || undefined
    };

    if (relatorio) {
      onSubmit({ ...relatorioData, id: relatorio.id });
    } else {
      onSubmit(relatorioData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {relatorio ? "Editar Relatório" : "Novo Relatório"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
              placeholder="Ex: Relatório de Atividades - Janeiro 2024"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: "mensal" | "trimestral" | "semestral" | "anual") => 
                  setFormData(prev => ({ ...prev, tipo: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="trimestral">Trimestral</SelectItem>
                  <SelectItem value="semestral">Semestral</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria *</Label>
              <Select
                value={formData.categoria}
                onValueChange={(value: "atividades" | "financeiro" | "projetos" | "resultados") => 
                  setFormData(prev => ({ ...prev, categoria: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="atividades">Atividades</SelectItem>
                  <SelectItem value="financeiro">Financeiro</SelectItem>
                  <SelectItem value="projetos">Projetos</SelectItem>
                  <SelectItem value="resultados">Resultados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataPublicacao">Data de Publicação *</Label>
              <Input
                id="dataPublicacao"
                type="date"
                value={formData.dataPublicacao}
                onChange={(e) => setFormData(prev => ({ ...prev, dataPublicacao: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "publicado" | "rascunho" | "em_revisao") => 
                  setFormData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                  <SelectItem value="em_revisao">Em Revisão</SelectItem>
                  <SelectItem value="publicado">Publicado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsavel">Responsável *</Label>
            <Input
              id="responsavel"
              value={formData.responsavel}
              onChange={(e) => setFormData(prev => ({ ...prev, responsavel: e.target.value }))}
              placeholder="Nome do responsável"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="arquivo">Arquivo (URL)</Label>
            <Input
              id="arquivo"
              value={formData.arquivo}
              onChange={(e) => setFormData(prev => ({ ...prev, arquivo: e.target.value }))}
              placeholder="URL do arquivo"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {relatorio ? "Atualizar" : "Criar"} Relatório
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
