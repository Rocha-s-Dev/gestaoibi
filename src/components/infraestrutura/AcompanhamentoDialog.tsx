
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  Camera, 
  FileText, 
  DollarSign, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Building,
  MapPin,
  User,
  Phone
} from "lucide-react";

interface ProgressoObra {
  id: string;
  nome: string;
  descricao: string;
  local: string;
  responsavel: string;
  empresa: string;
  contato: string;
  dataInicio: string;
  previsaoTermino: string;
  orcamentoTotal: number;
  valorGasto: number;
  status: "planejamento" | "andamento" | "parada" | "concluida" | "cancelada";
  observacoes?: string;
  dataCriacao: string;
  progresso: number;
  ultimaAtualizacao: string;
  proximaVistoria: string;
  fotos: Array<{
    id: string;
    url: string;
    data: string;
    descricao: string;
  }>;
  relatorios: Array<{
    id: string;
    data: string;
    tipo: "vistoria" | "progresso" | "problema";
    titulo: string;
    descricao: string;
    autor: string;
  }>;
}

interface AcompanhamentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  obra?: ProgressoObra | null;
}

export function AcompanhamentoDialog({ open, onOpenChange, obra }: AcompanhamentoDialogProps) {
  if (!obra) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: ProgressoObra["status"]) => {
    switch (status) {
      case "planejamento": return "bg-blue-100 text-blue-800";
      case "andamento": return "bg-green-100 text-green-800";
      case "parada": return "bg-yellow-100 text-yellow-800";
      case "concluida": return "bg-gray-100 text-gray-800";
      case "cancelada": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRelatorioIcon = (tipo: string) => {
    switch (tipo) {
      case "vistoria": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "progresso": return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case "problema": return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRelatorioColor = (tipo: string) => {
    switch (tipo) {
      case "vistoria": return "border-l-green-500";
      case "progresso": return "border-l-blue-500";
      case "problema": return "border-l-red-500";
      default: return "border-l-gray-500";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Building className="h-5 w-5 mr-2" />
            {obra.nome}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Informações Gerais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">{obra.local}</span>
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">{obra.responsavel}</span>
                </div>
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">{obra.empresa}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">{obra.contato}</span>
                </div>
                <div className="pt-2">
                  <Badge className={getStatusColor(obra.status)}>
                    {obra.status === "andamento" ? "Em Andamento" : 
                     obra.status === "planejamento" ? "Planejamento" :
                     obra.status === "parada" ? "Parada" :
                     obra.status === "concluida" ? "Concluída" : "Cancelada"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Progresso e Cronograma
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Progresso Geral</span>
                    <span className="text-sm font-bold">{obra.progresso}%</span>
                  </div>
                  <Progress value={obra.progresso} className="h-3" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Início</p>
                    <p className="font-semibold">{new Date(obra.dataInicio).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Previsão</p>
                    <p className="font-semibold">{new Date(obra.previsaoTermino).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <span>Próxima vistoria: {new Date(obra.proximaVistoria).toLocaleDateString('pt-BR')}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Orçamento */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Informações Financeiras
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Orçamento Total</p>
                  <p className="text-xl font-bold text-blue-600">{formatCurrency(obra.orcamentoTotal)}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Valor Gasto</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(obra.valorGasto)}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Restante</p>
                  <p className="text-xl font-bold text-gray-600">{formatCurrency(obra.orcamentoTotal - obra.valorGasto)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs para Fotos e Relatórios */}
          <Tabs defaultValue="fotos">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="fotos" className="flex items-center">
                <Camera className="h-4 w-4 mr-2" />
                Documentação Fotográfica ({obra.fotos.length})
              </TabsTrigger>
              <TabsTrigger value="relatorios" className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Relatórios de Status ({obra.relatorios.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="fotos" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  {obra.fotos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {obra.fotos.map((foto) => (
                        <div key={foto.id} className="space-y-2">
                          <img
                            src={foto.url}
                            alt={foto.descricao}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <div className="text-sm">
                            <p className="font-medium">{foto.descricao}</p>
                            <p className="text-gray-500">{new Date(foto.data).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Camera className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Nenhuma foto disponível</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="relatorios" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  {obra.relatorios.length > 0 ? (
                    <div className="space-y-4">
                      {obra.relatorios.map((relatorio) => (
                        <div 
                          key={relatorio.id} 
                          className={`p-4 border-l-4 bg-gray-50 rounded-r-lg ${getRelatorioColor(relatorio.tipo)}`}
                        >
                          <div className="flex items-start space-x-3">
                            {getRelatorioIcon(relatorio.tipo)}
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold">{relatorio.titulo}</h4>
                                <span className="text-sm text-gray-500">
                                  {new Date(relatorio.data).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 mt-1">{relatorio.descricao}</p>
                              <p className="text-xs text-gray-500 mt-2">Por: {relatorio.autor}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Nenhum relatório disponível</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {obra.observacoes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{obra.observacoes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
