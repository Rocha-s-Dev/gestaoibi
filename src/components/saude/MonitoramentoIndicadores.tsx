
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, TrendingUp, TrendingDown, AlertTriangle, Calendar, Monitor } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Line, LineChart, Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

interface IndicadorSaude {
  id: string;
  nome: string;
  categoria: "morbidade" | "mortalidade" | "vacinacao" | "outros";
  valor: number;
  unidade: string;
  periodo: string;
  meta: number;
  tendencia: "alta" | "baixa" | "estavel";
  status: "critico" | "atencao" | "normal" | "excelente";
  historico: Array<{
    periodo: string;
    valor: number;
  }>;
  observacoes?: string;
}

const indicadoresMock: IndicadorSaude[] = [
  {
    id: "1",
    nome: "Taxa de Mortalidade Infantil",
    categoria: "mortalidade",
    valor: 14.2,
    unidade: "por 1.000 nascidos vivos",
    periodo: "2024",
    meta: 12.0,
    tendencia: "baixa",
    status: "atencao",
    historico: [
      { periodo: "Jan", valor: 15.1 },
      { periodo: "Fev", valor: 14.8 },
      { periodo: "Mar", valor: 14.5 },
      { periodo: "Abr", valor: 14.2 },
      { periodo: "Mai", valor: 14.0 },
      { periodo: "Jun", valor: 14.2 }
    ]
  },
  {
    id: "2",
    nome: "Cobertura Vacinal COVID-19",
    categoria: "vacinacao",
    valor: 87.5,
    unidade: "%",
    periodo: "2024",
    meta: 90.0,
    tendencia: "alta",
    status: "normal",
    historico: [
      { periodo: "Jan", valor: 75.2 },
      { periodo: "Fev", valor: 78.1 },
      { periodo: "Mar", valor: 82.3 },
      { periodo: "Abr", valor: 85.1 },
      { periodo: "Mai", valor: 86.8 },
      { periodo: "Jun", valor: 87.5 }
    ]
  },
  {
    id: "3",
    nome: "Casos de Dengue",
    categoria: "morbidade",
    valor: 245,
    unidade: "casos confirmados",
    periodo: "Jun/2024",
    meta: 150,
    tendencia: "alta",
    status: "critico",
    historico: [
      { periodo: "Jan", valor: 45 },
      { periodo: "Fev", valor: 78 },
      { periodo: "Mar", valor: 123 },
      { periodo: "Abr", valor: 189 },
      { periodo: "Mai", valor: 210 },
      { periodo: "Jun", valor: 245 }
    ]
  },
  {
    id: "4",
    nome: "Cobertura Vacinal Infantil",
    categoria: "vacinacao",
    valor: 95.2,
    unidade: "%",
    periodo: "2024",
    meta: 95.0,
    tendencia: "estavel",
    status: "excelente",
    historico: [
      { periodo: "Jan", valor: 94.8 },
      { periodo: "Fev", valor: 95.1 },
      { periodo: "Mar", valor: 95.3 },
      { periodo: "Abr", valor: 95.0 },
      { periodo: "Mai", valor: 95.2 },
      { periodo: "Jun", valor: 95.2 }
    ]
  }
];

const categoriaColors = {
  morbidade: "bg-orange-100 text-orange-800",
  mortalidade: "bg-red-100 text-red-800",
  vacinacao: "bg-blue-100 text-blue-800",
  outros: "bg-gray-100 text-gray-800"
};

const statusColors = {
  critico: "bg-red-100 text-red-800",
  atencao: "bg-yellow-100 text-yellow-800",
  normal: "bg-green-100 text-green-800",
  excelente: "bg-emerald-100 text-emerald-800"
};

const tendenciaIcons = {
  alta: TrendingUp,
  baixa: TrendingDown,
  estavel: Monitor
};

const chartConfig = {
  valor: {
    label: "Valor",
    color: "hsl(var(--chart-1))",
  },
};

export function MonitoramentoIndicadores() {
  const [indicadores, setIndicadores] = useState<IndicadorSaude[]>(indicadoresMock);
  const [filteredIndicadores, setFilteredIndicadores] = useState<IndicadorSaude[]>(indicadoresMock);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState<string>("todos");
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    applyFilters(term, categoriaFilter, statusFilter);
  };

  const handleCategoriaFilter = (categoria: string) => {
    setCategoriaFilter(categoria);
    applyFilters(searchTerm, categoria, statusFilter);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    applyFilters(searchTerm, categoriaFilter, status);
  };

  const applyFilters = (search: string, categoria: string, status: string) => {
    let filtered = indicadores;

    if (search) {
      filtered = filtered.filter(indicador =>
        indicador.nome.toLowerCase().includes(search.toLowerCase()) ||
        indicador.categoria.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (categoria !== "todos") {
      filtered = filtered.filter(indicador => indicador.categoria === categoria);
    }

    if (status !== "todos") {
      filtered = filtered.filter(indicador => indicador.status === status);
    }

    setFilteredIndicadores(filtered);
  };

  const getPerformanceStatus = (valor: number, meta: number) => {
    const percentual = (valor / meta) * 100;
    if (percentual >= 100) return "Atingiu a meta";
    if (percentual >= 80) return "Próximo da meta";
    if (percentual >= 60) return "Abaixo da meta";
    return "Muito abaixo da meta";
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Buscar indicadores..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoriaFilter} onValueChange={handleCategoriaFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as Categorias</SelectItem>
              <SelectItem value="morbidade">Morbidade</SelectItem>
              <SelectItem value="mortalidade">Mortalidade</SelectItem>
              <SelectItem value="vacinacao">Vacinação</SelectItem>
              <SelectItem value="outros">Outros</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              <SelectItem value="critico">Crítico</SelectItem>
              <SelectItem value="atencao">Atenção</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="excelente">Excelente</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="flex items-center gap-2">
          <Plus size={20} />
          Novo Indicador
        </Button>
      </div>

      {/* Resumo Executivo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Indicadores</p>
                <p className="text-2xl font-bold">{indicadores.length}</p>
              </div>
              <Monitor className="text-blue-500" size={24} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Status Crítico</p>
                <p className="text-2xl font-bold text-red-600">
                  {indicadores.filter(i => i.status === "critico").length}
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
                <p className="text-sm text-gray-600">Metas Atingidas</p>
                <p className="text-2xl font-bold text-green-600">
                  {indicadores.filter(i => i.valor >= i.meta).length}
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
                <p className="text-sm text-gray-600">Em Tendência de Alta</p>
                <p className="text-2xl font-bold text-blue-600">
                  {indicadores.filter(i => i.tendencia === "alta").length}
                </p>
              </div>
              <TrendingUp className="text-blue-500" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Indicadores */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredIndicadores.map((indicador) => {
          const TendenciaIcon = tendenciaIcons[indicador.tendencia];
          
          return (
            <Card key={indicador.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{indicador.nome}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={categoriaColors[indicador.categoria]}>
                        {indicador.categoria}
                      </Badge>
                      <Badge className={statusColors[indicador.status]}>
                        {indicador.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TendenciaIcon 
                      size={20} 
                      className={
                        indicador.tendencia === "alta" ? "text-red-500" :
                        indicador.tendencia === "baixa" ? "text-green-500" :
                        "text-gray-500"
                      } 
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Valor Atual</p>
                    <p className="text-xl font-bold">
                      {indicador.valor} {indicador.unidade}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Meta</p>
                    <p className="text-xl font-bold text-blue-600">
                      {indicador.meta} {indicador.unidade}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Performance</p>
                  <p className="text-sm font-medium">
                    {getPerformanceStatus(indicador.valor, indicador.meta)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Histórico (6 meses)</p>
                  <div className="h-24">
                    <ChartContainer config={chartConfig}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={indicador.historico}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="periodo" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line 
                            type="monotone" 
                            dataKey="valor" 
                            stroke="var(--color-valor)" 
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} />
                    <span>Período: {indicador.periodo}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredIndicadores.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Nenhum indicador encontrado</p>
        </div>
      )}
    </div>
  );
}
