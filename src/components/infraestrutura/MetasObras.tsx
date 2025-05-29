
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, 
  Target, 
  TrendingUp, 
  Calendar, 
  Building, 
  CheckCircle,
  AlertCircle,
  Search,
  BarChart3,
  Eye
} from "lucide-react";
import { MetaObraDialog } from "./MetaObraDialog";

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

export function MetasObras() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedMeta, setSelectedMeta] = useState<MetaObra | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Dados mockados para demonstração
  const [metas] = useState<MetaObra[]>([
    {
      id: "1",
      ano: 2024,
      metaConclusao: 15,
      obrasConcluidas: 9,
      obrasEmAndamento: 4,
      descricao: "Meta de conclusão de obras de infraestrutura urbana",
      departamento: "Infraestrutura e Obras",
      status: "ativa",
      dataCriacao: "2024-01-15",
      dataAlvo: "2024-12-31",
      observacoes: "Foco em obras de pavimentação e drenagem"
    },
    {
      id: "2",
      ano: 2024,
      metaConclusao: 8,
      obrasConcluidas: 8,
      obrasEmAndamento: 0,
      descricao: "Meta de reformas de escolas municipais",
      departamento: "Educação",
      status: "concluida",
      dataCriacao: "2024-01-10",
      dataAlvo: "2024-10-30",
      observacoes: "Todas as reformas foram concluídas antes do prazo"
    },
    {
      id: "3",
      ano: 2024,
      metaConclusao: 12,
      obrasConcluidas: 6,
      obrasEmAndamento: 3,
      descricao: "Meta de construção de unidades de saúde",
      departamento: "Saúde",
      status: "em_risco",
      dataCriacao: "2024-02-01",
      dataAlvo: "2024-12-15",
      observacoes: "Atraso devido a questões de licenciamento ambiental"
    }
  ]);

  const filteredMetas = metas.filter(meta => {
    const matchesSearch = meta.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meta.departamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meta.ano.toString().includes(searchTerm);
    
    const matchesStatus = filterStatus === "all" || meta.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

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

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-green-500";
    if (percentage >= 75) return "bg-blue-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar metas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">Todos os Status</option>
            <option value="ativa">Ativa</option>
            <option value="concluida">Concluída</option>
            <option value="em_risco">Em Risco</option>
          </select>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Meta
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Metas Ativas</p>
                <p className="text-2xl font-bold">
                  {metas.filter(m => m.status === "ativa").length}
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Metas Concluídas</p>
                <p className="text-2xl font-bold">
                  {metas.filter(m => m.status === "concluida").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Obras</p>
                <p className="text-2xl font-bold">
                  {metas.reduce((acc, meta) => acc + meta.obrasConcluidas + meta.obrasEmAndamento, 0)}
                </p>
              </div>
              <Building className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Em Risco</p>
                <p className="text-2xl font-bold">
                  {metas.filter(m => m.status === "em_risco").length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Metas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredMetas.map((meta) => {
          const progressPercentage = getProgressPercentage(meta);
          
          return (
            <Card key={meta.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold flex items-center">
                      <Target className="h-5 w-5 mr-2 text-gray-600" />
                      Meta {meta.ano}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{meta.descricao}</p>
                  </div>
                  <Badge className={getStatusColor(meta.status)}>
                    {meta.status === "ativa" ? "Ativa" : 
                     meta.status === "concluida" ? "Concluída" : "Em Risco"}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Building className="h-4 w-4 mr-2" />
                    {meta.departamento}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Prazo: {new Date(meta.dataAlvo).toLocaleDateString('pt-BR')}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Progresso</span>
                    <span className="text-sm font-bold">{progressPercentage}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-gray-600">Meta</p>
                    <p className="font-semibold text-lg">{meta.metaConclusao}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">Concluídas</p>
                    <p className="font-semibold text-lg text-green-600">{meta.obrasConcluidas}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">Em Andamento</p>
                    <p className="font-semibold text-lg text-blue-600">{meta.obrasEmAndamento}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center text-xs text-gray-500">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {meta.obrasConcluidas}/{meta.metaConclusao} obras
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedMeta(meta);
                      setDialogOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Detalhes
                  </Button>
                </div>

                {meta.observacoes && (
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    {meta.observacoes}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredMetas.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Nenhuma meta encontrada</p>
        </div>
      )}

      <MetaObraDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        meta={selectedMeta}
        onMetaCreated={() => {
          // Aqui seria implementada a lógica de atualização da lista
          console.log("Meta criada/atualizada");
        }}
      />
    </div>
  );
}
