
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Target, FileText, BarChart3, Calendar, CheckCircle } from "lucide-react";
import { MetaEducacaoDialog } from "./MetaEducacaoDialog";

type MetaEducacao = {
  id: string;
  titulo: string;
  descricao: string;
  categoria: "infraestrutura" | "pedagogico" | "gestao" | "inclusao";
  prazo: Date;
  progresso: number;
  responsavel: string;
  status: "planejada" | "em_andamento" | "concluida" | "atrasada";
  indicadores: {
    nome: string;
    valorAtual: number;
    valorMeta: number;
    unidade: string;
  }[];
};

export function PlanejamentoEducacao() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMeta, setSelectedMeta] = useState<MetaEducacao | null>(null);

  const [metas] = useState<MetaEducacao[]>([
    {
      id: "1",
      titulo: "Aumentar Taxa de Alfabetização",
      descricao: "Elevar a taxa de alfabetização nos anos iniciais para 95%",
      categoria: "pedagogico",
      prazo: new Date("2024-12-31"),
      progresso: 75,
      responsavel: "Coordenação Pedagógica",
      status: "em_andamento",
      indicadores: [
        { nome: "Taxa de Alfabetização", valorAtual: 89, valorMeta: 95, unidade: "%" },
        { nome: "Alunos Acompanhados", valorAtual: 450, valorMeta: 500, unidade: "alunos" }
      ]
    },
    {
      id: "2",
      titulo: "Reduzir Evasão Escolar",
      descricao: "Diminuir a taxa de evasão escolar para menos de 3%",
      categoria: "gestao",
      prazo: new Date("2024-11-30"),
      progresso: 60,
      responsavel: "Assistência Social Escolar",
      status: "em_andamento",
      indicadores: [
        { nome: "Taxa de Evasão", valorAtual: 4.1, valorMeta: 3.0, unidade: "%" },
        { nome: "Famílias Acompanhadas", valorAtual: 85, valorMeta: 120, unidade: "famílias" }
      ]
    },
    {
      id: "3",
      titulo: "Modernizar Laboratórios",
      descricao: "Equipar todas as escolas com laboratórios de informática modernos",
      categoria: "infraestrutura",
      prazo: new Date("2025-06-30"),
      progresso: 30,
      responsavel: "Infraestrutura Escolar",
      status: "em_andamento",
      indicadores: [
        { nome: "Escolas Equipadas", valorAtual: 5, valorMeta: 15, unidade: "escolas" },
        { nome: "Computadores Instalados", valorAtual: 150, valorMeta: 450, unidade: "unidades" }
      ]
    }
  ]);

  const planosAcao = [
    {
      id: "1",
      metaId: "1",
      acao: "Formação continuada de professores",
      prazo: new Date("2024-09-30"),
      status: "concluida"
    },
    {
      id: "2",
      metaId: "1",
      acao: "Implementação de material didático específico",
      prazo: new Date("2024-10-15"),
      status: "em_andamento"
    },
    {
      id: "3",
      metaId: "2",
      acao: "Programa de busca ativa escolar",
      prazo: new Date("2024-08-31"),
      status: "em_andamento"
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      planejada: { color: "bg-gray-100 text-gray-800", label: "Planejada" },
      em_andamento: { color: "bg-blue-100 text-blue-800", label: "Em Andamento" },
      concluida: { color: "bg-green-100 text-green-800", label: "Concluída" },
      atrasada: { color: "bg-red-100 text-red-800", label: "Atrasada" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getCategoryBadge = (categoria: string) => {
    const categoryConfig = {
      infraestrutura: { color: "bg-purple-100 text-purple-800", label: "Infraestrutura" },
      pedagogico: { color: "bg-green-100 text-green-800", label: "Pedagógico" },
      gestao: { color: "bg-blue-100 text-blue-800", label: "Gestão" },
      inclusao: { color: "bg-orange-100 text-orange-800", label: "Inclusão" }
    };
    
    const config = categoryConfig[categoria as keyof typeof categoryConfig];
    return <Badge variant="outline" className={config.color}>{config.label}</Badge>;
  };

  const openDialog = (meta?: MetaEducacao) => {
    setSelectedMeta(meta || null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">Planejamento Estratégico</h2>
          <p className="text-gray-600">Gestão de metas, planos de ação e indicadores educacionais</p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Meta
        </Button>
      </div>

      <Tabs defaultValue="metas">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="metas">Metas Estratégicas</TabsTrigger>
          <TabsTrigger value="acoes">Planos de Ação</TabsTrigger>
          <TabsTrigger value="indicadores">Indicadores</TabsTrigger>
        </TabsList>

        <TabsContent value="metas">
          <div className="grid gap-6">
            {metas.map((meta) => (
              <Card key={meta.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-lg">{meta.titulo}</CardTitle>
                        {getStatusBadge(meta.status)}
                        {getCategoryBadge(meta.categoria)}
                      </div>
                      <p className="text-gray-600">{meta.descricao}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDialog(meta)}
                    >
                      Editar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Responsável:</span> {meta.responsavel}
                    </div>
                    <div>
                      <span className="font-medium">Prazo:</span> {meta.prazo.toLocaleDateString('pt-BR')}
                    </div>
                    <div>
                      <span className="font-medium">Progresso:</span> {meta.progresso}%
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso Geral</span>
                      <span>{meta.progresso}%</span>
                    </div>
                    <Progress value={meta.progresso} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Indicadores:</h4>
                    <div className="grid gap-3">
                      {meta.indicadores.map((indicador, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <span className="font-medium">{indicador.nome}</span>
                            <div className="text-sm text-gray-600">
                              {indicador.valorAtual} / {indicador.valorMeta} {indicador.unidade}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold">
                              {((indicador.valorAtual / indicador.valorMeta) * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="acoes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Planos de Ação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {planosAcao.map((plano) => (
                  <div key={plano.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{plano.acao}</h3>
                          {getStatusBadge(plano.status)}
                        </div>
                        <p className="text-sm text-gray-600">
                          <strong>Prazo:</strong> {plano.prazo.toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Meta Relacionada:</strong> {metas.find(m => m.id === plano.metaId)?.titulo}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        {plano.status === "concluida" && (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="indicadores">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Indicadores de Qualidade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Taxa de Aprovação Municipal</span>
                    <span className="font-semibold text-green-600">89.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Nota IDEB</span>
                    <span className="font-semibold text-blue-600">6.8</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Taxa de Evasão</span>
                    <span className="font-semibold text-red-600">4.1%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Professores com Pós-graduação</span>
                    <span className="font-semibold text-purple-600">78%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5" />
                  Metas Anuais 2024
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Alfabetização até 8 anos</span>
                      <span className="text-sm">89% / 95%</span>
                    </div>
                    <Progress value={94} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Redução da Evasão</span>
                      <span className="text-sm">4.1% / 3.0%</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Escolas com Internet</span>
                      <span className="text-sm">12 / 15</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <MetaEducacaoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={() => setDialogOpen(false)}
        meta={selectedMeta}
      />
    </div>
  );
}
