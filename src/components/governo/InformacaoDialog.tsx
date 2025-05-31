
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type InformacaoTransparencia = {
  id: string;
  titulo: string;
  categoria: "receitas" | "despesas" | "contratos" | "licitacoes" | "servidores" | "obras";
  descricao: string;
  dataAtualizacao: Date;
  status: "ativo" | "inativo";
  visualizacoes: number;
  responsavel: string;
  arquivo?: string;
};

type InformacaoDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (informacao: Omit<InformacaoTransparencia, "id"> | InformacaoTransparencia) => void;
  informacao?: InformacaoTransparencia | null;
};

export function InformacaoDialog({ open, onOpenChange, onSubmit, informacao }: InformacaoDialogProps) {
  const [formData, setFormData] = useState({
    titulo: "",
    categoria: "receitas" as "receitas" | "despesas" | "contratos" | "licitacoes" | "servidores" | "obras",
    descricao: "",
    dataAtualizacao: "",
    status: "ativo" as "ativo" | "inativo",
    visualizacoes: "0",
    responsavel: "",
    arquivo: ""
  });

  useEffect(() => {
    if (informacao) {
      setFormData({
        titulo: informacao.titulo,
        categoria: informacao.categoria,
        descricao: informacao.descricao,
        dataAtualizacao: informacao.dataAtualizacao.toISOString().split('T')[0],
        status: informacao.status,
        visualizacoes: informacao.visualizacoes.toString(),
        responsavel: informacao.responsavel,
        arquivo: informacao.arquivo || ""
      });
    } else {
      setFormData({
        titulo: "",
        categoria: "receitas",
        descricao: "",
        dataAtualizacao: "",
        status: "ativo",
        visualizacoes: "0",
        responsavel: "",
        arquivo: ""
      });
    }
  }, [informacao]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const informacaoData = {
      ...formData,
      visualizacoes: parseInt(formData.visualizacoes),
      dataAtualizacao: new Date(formData.dataAtualizacao),
      arquivo: formData.arquivo || undefined
    };

    if (informacao) {
      onSubmit({ ...informacaoData, id: informacao.id });
    } else {
      onSubmit(informacaoData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {informacao ? "Editar Informação" : "Nova Informação"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
              placeholder="Ex: Receitas Municipais - Janeiro 2024"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria *</Label>
              <Select
                value={formData.categoria}
                onValueChange={(value: "receitas" | "despesas" | "contratos" | "licitacoes" | "servidores" | "obras") => 
                  setFormData(prev => ({ ...prev, categoria: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receitas">Receitas</SelectItem>
                  <SelectItem value="despesas">Despesas</SelectItem>
                  <SelectItem value="contratos">Contratos</SelectItem>
                  <SelectItem value="licitacoes">Licitações</SelectItem>
                  <SelectItem value="servidores">Servidores</SelectItem>
                  <SelectItem value="obras">Obras</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "ativo" | "inativo") => 
                  setFormData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descreva o conteúdo desta informação"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsavel">Responsável *</Label>
            <Input
              id="responsavel"
              value={formData.responsavel}
              onChange={(e) => setFormData(prev => ({ ...prev, responsavel: e.target.value }))}
              placeholder="Órgão ou pessoa responsável"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataAtualizacao">Data de Atualização *</Label>
            <Input
              id="dataAtualizacao"
              type="date"
              value={formData.dataAtualizacao}
              onChange={(e) => setFormData(prev => ({ ...prev, dataAtualizacao: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="arquivo">Arquivo (URL)</Label>
            <Input
              id="arquivo"
              value={formData.arquivo}
              onChange={(e) => setFormData(prev => ({ ...prev, arquivo: e.target.value }))}
              placeholder="URL do arquivo ou documento"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {informacao ? "Atualizar" : "Criar"} Informação
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
