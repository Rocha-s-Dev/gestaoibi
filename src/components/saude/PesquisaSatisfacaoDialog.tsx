
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PesquisaSatisfacao {
  id: string;
  titulo: string;
  periodo: string;
  totalRespostas: number;
  notaMedia: number;
  status: "ativa" | "finalizada" | "planejada";
  dataInicio: string;
  dataFim: string;
  unidade: string;
  categoria: string;
  descricao?: string;
}

interface PesquisaSatisfacaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (pesquisa: PesquisaSatisfacao | Omit<PesquisaSatisfacao, "id">) => void;
  editingPesquisa?: PesquisaSatisfacao | null;
  onClose: () => void;
}

export function PesquisaSatisfacaoDialog({
  open,
  onOpenChange,
  onSubmit,
  editingPesquisa,
  onClose
}: PesquisaSatisfacaoDialogProps) {
  const [formData, setFormData] = useState({
    titulo: "",
    dataInicio: "",
    dataFim: "",
    unidade: "",
    categoria: "",
    status: "planejada" as "ativa" | "finalizada" | "planejada",
    descricao: ""
  });

  useEffect(() => {
    if (editingPesquisa) {
      setFormData({
        titulo: editingPesquisa.titulo,
        dataInicio: editingPesquisa.dataInicio,
        dataFim: editingPesquisa.dataFim,
        unidade: editingPesquisa.unidade,
        categoria: editingPesquisa.categoria,
        status: editingPesquisa.status,
        descricao: editingPesquisa.descricao || ""
      });
    } else {
      setFormData({
        titulo: "",
        dataInicio: "",
        dataFim: "",
        unidade: "",
        categoria: "",
        status: "planejada",
        descricao: ""
      });
    }
  }, [editingPesquisa, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const pesquisaData = {
      titulo: formData.titulo,
      periodo: `${new Date(formData.dataInicio).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
      totalRespostas: editingPesquisa?.totalRespostas || 0,
      notaMedia: editingPesquisa?.notaMedia || 0,
      status: formData.status,
      dataInicio: formData.dataInicio,
      dataFim: formData.dataFim,
      unidade: formData.unidade,
      categoria: formData.categoria,
      descricao: formData.descricao
    };

    if (editingPesquisa) {
      onSubmit({ ...pesquisaData, id: editingPesquisa.id });
    } else {
      onSubmit(pesquisaData);
    }

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingPesquisa ? "Editar Pesquisa de Satisfação" : "Nova Pesquisa de Satisfação"}
          </DialogTitle>
          <DialogDescription>
            {editingPesquisa ? "Edite as informações da pesquisa de satisfação." : "Configure uma nova pesquisa de satisfação para monitorar a qualidade dos serviços."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título da Pesquisa</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              placeholder="Ex: Satisfação Geral - UBS Centro"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data de Início</Label>
              <Input
                id="dataInicio"
                type="date"
                value={formData.dataInicio}
                onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataFim">Data de Fim</Label>
              <Input
                id="dataFim"
                type="date"
                value={formData.dataFim}
                onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unidade">Unidade de Saúde</Label>
            <Select value={formData.unidade} onValueChange={(value) => setFormData({ ...formData, unidade: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a unidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UBS Centro">UBS Centro</SelectItem>
                <SelectItem value="UBS Vila Nova">UBS Vila Nova</SelectItem>
                <SelectItem value="Hospital Municipal">Hospital Municipal</SelectItem>
                <SelectItem value="UPA 24h">UPA 24h</SelectItem>
                <SelectItem value="Centro de Especialidades">Centro de Especialidades</SelectItem>
                <SelectItem value="Todas as Unidades">Todas as Unidades</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria da Pesquisa</Label>
            <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Atendimento Geral">Atendimento Geral</SelectItem>
                <SelectItem value="Atendimento Médico">Atendimento Médico</SelectItem>
                <SelectItem value="Atendimento de Enfermagem">Atendimento de Enfermagem</SelectItem>
                <SelectItem value="Tempo de Espera">Tempo de Espera</SelectItem>
                <SelectItem value="Infraestrutura">Infraestrutura</SelectItem>
                <SelectItem value="Comunicação">Comunicação</SelectItem>
                <SelectItem value="Satisfação Geral">Satisfação Geral</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status da Pesquisa</Label>
            <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planejada">Planejada</SelectItem>
                <SelectItem value="ativa">Ativa</SelectItem>
                <SelectItem value="finalizada">Finalizada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição (Opcional)</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descreva os objetivos e metodologia da pesquisa..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingPesquisa ? "Atualizar" : "Criar Pesquisa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
