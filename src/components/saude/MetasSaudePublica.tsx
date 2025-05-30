
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Target, Clock, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { MetaSaudeDialog } from "./MetaSaudeDialog";

interface MetaSaude {
  id: string;
  titulo: string;
  tipo: "cobertura_vacinal" | "tempo_espera";
  valorMeta: number;
  valorAtual: number;
  unidadeMedida: string;
  prazo: string;
  status: "atingida" | "em_progresso" | "atrasada" | "critica";
  responsavel: string;
  descricao?: string;
  historico: Array<{
    mes: string;
    valor: number;
  }>;
}

const metasMock: MetaSaude[] = [
  {
    id: "1",
    titulo: "Cobertura Vacinal COVID-19",
    tipo: "cobertura_vacinal",
    valorMeta: 95,
    valorAtual: 87.5,
    unidadeMedida: "%",
    prazo: "Dezembro 2024",
    status: "em_progresso",
    responsavel: "Dr. João Silva",
    descricao: "Aumentar cobertura vacinal contra COVID-19 em 10% em relação ao ano anterior",
    historico: [
      { mes: "Jan", valor: 82 },
      { mes: "Fev", valor: 84 },
      { mes: "Mar", valor: 85 },
      { mes: "Abr", valor: 86 },
      { mes: "Mai", valor: 87 },
      { mes: "Jun", valor: 87.5 }
    ]
  },
  {
    id: "2",
    titulo: "Tempo de Espera Consultas Especializadas",
    tipo: "tempo_espera",
    valorMeta: 30,
    valorAtual: 45,
    unidadeMedida: "dias",
    prazo: "Setembro 2024",
    status: "atrasada",
    responsavel: "Dra. Maria Santos",
    descricao: "Reduzir tempo médio de espera para consultas especializadas para 30 dias",
    historico: [
      { mes: "Jan", valor: 60 },
      { mes: "Fev", valor: 55 },
      { mes: "Mar", valor: 52 },
      { mes: "Abr", valor: 48 },
      { mes: "Mai", valor: 46 },
      { mes: "Jun", valor: 45 }
    ]
  },
  {
    id: "3",
    titulo: "Cobertura Vacinal Infantil",
    tipo: "cobertura_vacinal",
    valorMeta: 98,
    valorAtual: 99.2,
    unidadeMedida: "%",
    prazo: "Dezembro 2024",
    status: "atingida",
    responsavel: "Dr. Carlos Oliveira",
    descricao: "Manter cobertura vacinal infantil acima de 98%",
    historico: [
      { mes: "Jan", valor: 97.8 },
      { mes: "Fev", valor: 98.1 },
      { mes: "Mar", valor: 98.5 },
      { mes: "Abr", valor: 98.9 },
      { mes: "Mai", valor: 99.0 },
      { mes: "Jun", valor: 99.2 }
    ]
  },
  {
    id: "4",
    titulo: "Tempo de Espera Exames",
    tipo: "tempo_espera",
    valorMeta: 15,
    valorAtual: 22,
    unidadeMedida: "dias",
    prazo: "Outubro 2024",
    status: "critica",
    responsavel: "Dra. Ana Costa",
    descricao: "Reduzir tempo de espera para exames laboratoriais e de imagem",
    historico: [
      { mes: "Jan", valor: 28 },
      { mes: "Fev", valor: 26 },
      { mes: "Mar", valor: 25 },
      { mes: "Abr", valor: 24 },
      { mes: "Mai", valor: 23 },
      { mes: "Jun", valor: 22 }
    ]
  }
];

const tipoColors = {
  cobertura_vacinal: "bg-blue-100 text-blue-800",
  tempo_espera: "bg-orange-100 text-orange-800"
};

const statusColors = {
  atingida: "bg-green-100 text-green-800",
  em_progresso: "bg-blue-100 text-blue-800",
  atrasada: "bg-yellow-100 text-yellow-800",
  critica: "bg-red-100 text-red-800"
};

export function MetasSaudePublica() {
  const [metas, setMetas] = useState<MetaSaude[]>(metasMock);
  const [filteredMetas, setFilteredMetas] = useState<MetaSaude[]>(metasMock);
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFilter, setTipoFilter] = useState<string>("todos");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMeta, setEditingMeta] = useState<MetaSaude | null>(null);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    applyFilters(term, tipoFilter, statusFilter);
  };

  const handleTipoFilter = (tipo: string) => {
    setTipoFilter(tipo);
    applyFilters(searchTerm, tipo, statusFilter);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    applyFilters(searchTerm, tipoFilter, status);
  };

  const applyFilters = (search: string, tipo: string, status: string) => {
    let filtered = metas;

    if (search) {
      filtered = filtered.filter(meta =>
        meta.titulo.toLowerCase().includes(search.toLowerCase()) ||
        meta.responsavel.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (tipo !== "todos") {
      filtered = filtered.filter(meta => meta.tipo === tipo);
    }

    if (status !== "todos") {
      filtered = filtered.filter(meta => meta.status === status);
    }

    setFilteredMetas(filtered);
  };

  const calcularProgresso = (atual: number, meta: number, tipo: string) => {
    if (tipo === "tempo_espera") {
      // Para tempo de espera, menor é melhor
      return Math.max(0, Math.min(100, ((meta / atual) * 100)));
    } else {
      // Para cobertura vacinal, maior é melhor
      return Math.max(0, Math.min(100, (atual / meta) * 100));
    }
  };

  const handleAddMeta = (novaMeta: Omit<MetaSaude, "id">) => {
    const meta: MetaSaude = {
      ...novaMeta,
      id: Date.now().toString()
    };
    setMetas([...metas, meta]);
    setFilteredMetas([...filteredMetas, meta]);
  };

  const handleEditMeta = (metaAtualizada: MetaSaude) => {
    const metasAtualizadas = metas.map(m => m.id === metaAtualizada.id ? metaAtualizada : m);
    setMetas(metasAtualizadas);
    setFilteredMetas(metasAtualizadas);
    setEditingMeta(null);
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Buscar metas..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={tipoFilter} onValueChange={handleTipoFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Tipo de Meta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Tipos</SelectItem>
              <SelectItem value="cobertura_vacinal">Cobertura Vacinal</SelectItem>
              <SelectItem value="tempo_espera">Tempo de Espera</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              <SelectItem value="atingida">Atingida</SelectItem>
              <SelectItem value="em_progresso">Em Progresso</SelectItem>
              <SelectItem value="atrasada">Atrasada</SelectItem>
              <SelectItem value="critica">Crítica</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
          <Plus size={20} />
          Nova Meta
        </Button>
      </div>

      {/* Resumo Executivo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Metas</p>
                <p className="text-2xl font-bold">{metas.length}</p>
              </div>
              <Target className="text-blue-500" size={24} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Metas Atingidas</p>
                <p className="text-2xl font-bold text-green-600">
                  {metas.filter(m => m.status === "atingida").length}
                </p>
              </div>
              <TrendingUp className="text-green-500" size={24} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Status Crítico</p>
                <p className="text-2xl font-bold text-red-600">
                  {metas.filter(m => m.status === "critica").length}
                </p>
              </div>
              <AlertTriangle className="text-red-500" size={24} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Em Progresso</p>
                <p className="text-2xl font-bold text-blue-600">
                  {metas.filter(m => m.status === "em_progresso").length}
                </p>
              </div>
              <Clock className="text-blue-500" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Metas */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredMetas.map((meta) => {
          const progresso = calcularProgresso(meta.valorAtual, meta.valorMeta, meta.tipo);
          
          return (
            <Card key={meta.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{meta.titulo}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={tipoColors[meta.tipo]}>
                        {meta.tipo === "cobertura_vacinal" ? "Cobertura Vacinal" : "Tempo de Espera"}
                      </Badge>
                      <Badge className={statusColors[meta.status]}>
                        {meta.status === "atingida" ? "Atingida" :
                         meta.status === "em_progresso" ? "Em Progresso" :
                         meta.status === "atrasada" ? "Atrasada" : "Crítica"}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingMeta(meta);
                      setIsDialogOpen(true);
                    }}
                  >
                    Editar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Valor Atual</p>
                    <p className="text-xl font-bold">
                      {meta.valorAtual} {meta.unidadeMedida}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Meta</p>
                    <p className="text-xl font-bold text-blue-600">
                      {meta.valorMeta} {meta.unidadeMedida}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-gray-600">Progresso</p>
                    <p className="text-sm font-medium">{progresso.toFixed(1)}%</p>
                  </div>
                  <Progress value={progresso} className="h-2" />
                </div>

                <div>
                  <p className="text-sm text-gray-600">Responsável</p>
                  <p className="text-sm font-medium">{meta.responsavel}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Prazo</p>
                  <p className="text-sm font-medium">{meta.prazo}</p>
                </div>

                {meta.descricao && (
                  <div>
                    <p className="text-sm text-gray-600">Descrição</p>
                    <p className="text-sm">{meta.descricao}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredMetas.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Nenhuma meta encontrada</p>
        </div>
      )}

      <MetaSaudeDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={editingMeta ? handleEditMeta : handleAddMeta}
        editingMeta={editingMeta}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingMeta(null);
        }}
      />
    </div>
  );
}
