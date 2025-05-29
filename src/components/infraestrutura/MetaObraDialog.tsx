
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Target, 
  Calendar, 
  Building, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  BarChart3,
  FileText
} from "lucide-react";

interface MetaObra {
  id: string;
  ano: number;
  metaConclusao: number;
  obrasConcluidas: number;
  obrasEmAndamento: number;
  descricao: string;
  departamento: string;
  status: "ativa" | "concluida" | "em_risco";
  dataCriacao: string;
  dataAlvo: string;
  observacoes?: string;
}

interface MetaObraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meta: MetaObra | null;
  onMetaCreated: () => void;
}

export function MetaObraDialog({ open, onOpenChange, meta, onMetaCreated }: MetaObraDialogProps) {
  const [formData, setFormData] = useState({
    ano: new Date().getFullYear(),
    metaConclusao: 0,
    descricao: "",
    departamento: "",
    dataAlvo: "",
    observacoes: ""
  });

  const isEditing = !!meta;

  useEffect(() => {
    if (meta) {
      setFormData({
        ano: meta.ano,
        metaConclusao: meta.metaConclusao,
        descricao: meta.descricao,
        departamento: meta.departamento,
        dataAlvo: meta.dataAlvo,
        observacoes: meta.observacoes || ""
      });
    } else {
      setFormData({
        ano: new Date().getFullYear(),
        metaConclusao: 0,
        descricao: "",
        departamento: "",
        dataAlvo: "",
        observacoes: ""
      });
    }
  }, [meta]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Salvando meta:", formData);
    onMetaCreated();
    onOpenChange(false);
  };

  const getStatusColor = (status: MetaObra["status"]) => {
    switch (status) {
      case "ativa": return "bg-blue-100 text-blue-800";
      case "concluida": return "bg-green-100 text-green-800";
      case "em_risco": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getProgressPercentage = (meta: MetaObra) => {
    return Math.round((meta.obrasConcluidas / meta.metaConclusao) * 100);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            {isEditing ? `Meta de Obras ${meta?.ano}` : "Nova Meta de Obras"}
          </DialogTitle>
        </DialogHeader>

        {isEditing && meta ? (
          <Tabs defaultValue="detalhes" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
              <TabsTrigger value="progresso">Progresso</TabsTrigger>
              <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
            </TabsList>

            <TabsContent value="detalhes" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Informações Gerais</h3>
                    <Badge className={getStatusColor(meta.status)}>
                      {meta.status === "ativa" ? "Ativa" : 
                       meta.status === "concluida" ? "Concluída" : "Em Risco"}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Descrição</Label>
                      <p className="text-sm mt-1">{meta.descricao}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Departamento</Label>
                        <p className="text-sm mt-1">{meta.departamento}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Ano</Label>
                        <p className="text-sm mt-1">{meta.ano}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Data de Criação</Label>
                        <p className="text-sm mt-1">{new Date(meta.dataCriacao).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Data Alvo</Label>
                        <p className="text-sm mt-1">{new Date(meta.dataAlvo).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>

                    {meta.observacoes && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Observações</Label>
                        <p className="text-sm mt-1 bg-gray-50 p-3 rounded-md">{meta.observacoes}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Métricas</h3>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Target className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <p className="text-2xl font-bold text-blue-600">{meta.metaConclusao}</p>
                      <p className="text-xs text-gray-600">Meta Total</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <p className="text-2xl font-bold text-green-600">{meta.obrasConcluidas}</p>
                      <p className="text-xs text-gray-600">Concluídas</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <Building className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                      <p className="text-2xl font-bold text-yellow-600">{meta.obrasEmAndamento}</p>
                      <p className="text-xs text-gray-600">Em Andamento</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Progresso Geral</span>
                      <span className="text-sm font-bold">{getProgressPercentage(meta)}%</span>
                    </div>
                    <Progress value={getProgressPercentage(meta)} className="h-3" />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="progresso" className="space-y-4">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Acompanhamento do Progresso</h3>
                  <Badge variant="outline">
                    {getProgressPercentage(meta)}% Concluído
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Status das Obras</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                          <span className="text-sm">Obras Concluídas</span>
                        </div>
                        <span className="font-bold text-green-600">{meta.obrasConcluidas}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-2 text-blue-600" />
                          <span className="text-sm">Obras em Andamento</span>
                        </div>
                        <span className="font-bold text-blue-600">{meta.obrasEmAndamento}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <AlertCircle className="h-4 w-4 mr-2 text-gray-600" />
                          <span className="text-sm">Restantes</span>
                        </div>
                        <span className="font-bold text-gray-600">
                          {meta.metaConclusao - meta.obrasConcluidas - meta.obrasEmAndamento}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Cronograma</h4>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        <span>Início: {new Date(meta.dataCriacao).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        <span>Prazo: {new Date(meta.dataAlvo).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <TrendingUp className="h-4 w-4 mr-2 text-gray-500" />
                        <span>
                          {Math.round((meta.obrasConcluidas / meta.metaConclusao) * 100)}% da meta atingida
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="relatorios" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Relatórios de Progresso</h3>
                
                <div className="space-y-3">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-blue-600" />
                        <span className="font-medium">Relatório Mensal - Novembro 2024</span>
                      </div>
                      <Badge variant="outline">15/11/2024</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Progresso satisfatório com {meta.obrasConcluidas} obras concluídas até o momento. 
                      {meta.obrasEmAndamento} obras em execução dentro do cronograma.
                    </p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <BarChart3 className="h-4 w-4 mr-2 text-green-600" />
                        <span className="font-medium">Análise de Performance</span>
                      </div>
                      <Badge variant="outline">01/11/2024</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Meta com {getProgressPercentage(meta)}% de conclusão. 
                      {meta.status === "ativa" ? "Dentro do cronograma previsto." : 
                       meta.status === "em_risco" ? "Requer atenção para cumprimento do prazo." : 
                       "Meta concluída com sucesso."}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ano">Ano</Label>
                <Input
                  id="ano"
                  type="number"
                  value={formData.ano}
                  onChange={(e) => setFormData(prev => ({ ...prev, ano: parseInt(e.target.value) }))}
                  required
                  min="2020"
                  max="2030"
                />
              </div>
              <div>
                <Label htmlFor="metaConclusao">Meta de Obras</Label>
                <Input
                  id="metaConclusao"
                  type="number"
                  value={formData.metaConclusao}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaConclusao: parseInt(e.target.value) }))}
                  required
                  min="1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="descricao">Descrição da Meta</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                required
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="departamento">Departamento Responsável</Label>
                <Input
                  id="departamento"
                  value={formData.departamento}
                  onChange={(e) => setFormData(prev => ({ ...prev, departamento: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="dataAlvo">Data Alvo</Label>
                <Input
                  id="dataAlvo"
                  type="date"
                  value={formData.dataAlvo}
                  onChange={(e) => setFormData(prev => ({ ...prev, dataAlvo: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Salvar Meta
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
