
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Edit, Trash2, Users, School, UserCheck, User } from "lucide-react";
import { toast } from "sonner";
import { SecretarioEducacaoDialog } from "./SecretarioEducacaoDialog";
import { FuncionarioEducacaoDialog } from "./FuncionarioEducacaoDialog";
import { NovaEscolaDialog } from "./NovaEscolaDialog";
import { ProfessorDialog } from "./ProfessorDialog";
import { useEscolas } from "@/hooks/useEscolas";
import { useProfessores } from "@/hooks/useProfessores";

type SecretarioEducacao = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  dataInicio: Date;
  formacao: string;
  status: "ativo" | "inativo";
};

type FuncionarioEducacao = {
  id: string;
  nome: string;
  cargo: string;
  setor: string;
  email: string;
  telefone: string;
  dataAdmissao: Date;
  status: "ativo" | "inativo" | "afastado";
};

export function CadastroEducacao() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [activeDialog, setActiveDialog] = useState<"secretario" | "funcionario" | "escola" | "professor" | null>(null);

  const { escolas, loading: loadingEscolas, createEscola, updateEscola, deleteEscola } = useEscolas();
  const { professores, loading: loadingProfessores, createProfessor, updateProfessor, deleteProfessor } = useProfessores();

  // Mock data para secretários e funcionários (mantido temporariamente)
  const [secretarios] = useState<SecretarioEducacao[]>([
    {
      id: "1",
      nome: "Maria Silva Santos",
      email: "maria.santos@educacao.gov.br",
      telefone: "(11) 3456-7890",
      dataInicio: new Date("2022-01-15"),
      formacao: "Pedagogia - Mestrado em Gestão Educacional",
      status: "ativo"
    }
  ]);

  const [funcionarios] = useState<FuncionarioEducacao[]>([
    {
      id: "1",
      nome: "João Carlos Pereira",
      cargo: "Coordenador Pedagógico",
      setor: "Coordenação Pedagógica",
      email: "joao.pereira@educacao.gov.br",
      telefone: "(11) 3456-7891",
      dataAdmissao: new Date("2021-03-10"),
      status: "ativo"
    },
    {
      id: "2",
      nome: "Ana Paula Costa",
      cargo: "Assistente Administrativo",
      setor: "Secretaria",
      email: "ana.costa@educacao.gov.br",
      telefone: "(11) 3456-7892",
      dataAdmissao: new Date("2020-08-20"),
      status: "ativo"
    }
  ]);

  const openDialog = (type: "secretario" | "funcionario" | "escola" | "professor", item?: any) => {
    setActiveDialog(type);
    setSelectedItem(item || null);
    setDialogOpen(true);
  };

  const handleEscolaSubmit = async (escolaData: any) => {
    try {
      if (selectedItem) {
        await updateEscola(selectedItem.id, escolaData);
        toast.success("Escola atualizada com sucesso!");
      } else {
        await createEscola(escolaData);
        toast.success("Escola cadastrada com sucesso!");
      }
      setDialogOpen(false);
    } catch (error) {
      console.error('Erro ao salvar escola:', error);
      toast.error("Erro ao salvar escola. Tente novamente.");
    }
  };

  const handleProfessorSubmit = async (professorData: any) => {
    try {
      if (selectedItem) {
        await updateProfessor(selectedItem.id, professorData);
        toast.success("Professor atualizado com sucesso!");
      } else {
        await createProfessor(professorData);
        toast.success("Professor cadastrado com sucesso!");
      }
      setDialogOpen(false);
    } catch (error) {
      console.error('Erro ao salvar professor:', error);
      toast.error("Erro ao salvar professor. Tente novamente.");
    }
  };

  const handleDeleteEscola = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta escola?")) {
      try {
        await deleteEscola(id);
        toast.success("Escola excluída com sucesso!");
      } catch (error) {
        console.error('Erro ao excluir escola:', error);
        toast.error("Erro ao excluir escola. Tente novamente.");
      }
    }
  };

  const handleDeleteProfessor = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este professor?")) {
      try {
        await deleteProfessor(id);
        toast.success("Professor excluído com sucesso!");
      } catch (error) {
        console.error('Erro ao excluir professor:', error);
        toast.error("Erro ao excluir professor. Tente novamente.");
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ativo: { color: "bg-green-100 text-green-800", label: "Ativo" },
      ativa: { color: "bg-green-100 text-green-800", label: "Ativa" },
      inativo: { color: "bg-red-100 text-red-800", label: "Inativo" },
      inativa: { color: "bg-red-100 text-red-800", label: "Inativa" },
      afastado: { color: "bg-yellow-100 text-yellow-800", label: "Afastado" },
      em_reforma: { color: "bg-blue-100 text-blue-800", label: "Em Reforma" },
      em_construcao: { color: "bg-orange-100 text-orange-800", label: "Em Construção" },
      licenca: { color: "bg-yellow-100 text-yellow-800", label: "Em Licença" },
      aposentado: { color: "bg-gray-100 text-gray-800", label: "Aposentado" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return config ? <Badge className={config.color}>{config.label}</Badge> : <Badge>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="secretario">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="secretario">Secretário(a)</TabsTrigger>
          <TabsTrigger value="funcionarios">Funcionários</TabsTrigger>
          <TabsTrigger value="escolas">Escolas</TabsTrigger>
          <TabsTrigger value="professores">Professores</TabsTrigger>
        </TabsList>

        <TabsContent value="secretario">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <UserCheck className="mr-2 h-5 w-5" />
                Secretário(a) de Educação
              </CardTitle>
              <Button onClick={() => openDialog("secretario")}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Secretário
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {secretarios.map((secretario) => (
                  <div key={secretario.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{secretario.nome}</h3>
                          {getStatusBadge(secretario.status)}
                        </div>
                        <p className="text-sm text-gray-600">{secretario.email}</p>
                        <p className="text-sm text-gray-600">{secretario.telefone}</p>
                        <p className="text-sm text-gray-600">
                          <strong>Formação:</strong> {secretario.formacao}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Início:</strong> {secretario.dataInicio.toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDialog("secretario", secretario)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funcionarios">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Funcionários Administrativos
              </CardTitle>
              <Button onClick={() => openDialog("funcionario")}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Funcionário
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {funcionarios.map((funcionario) => (
                  <div key={funcionario.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{funcionario.nome}</h3>
                          {getStatusBadge(funcionario.status)}
                        </div>
                        <p className="text-sm text-gray-600">
                          <strong>Cargo:</strong> {funcionario.cargo}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Setor:</strong> {funcionario.setor}
                        </p>
                        <p className="text-sm text-gray-600">{funcionario.email}</p>
                        <p className="text-sm text-gray-600">{funcionario.telefone}</p>
                        <p className="text-sm text-gray-600">
                          <strong>Admissão:</strong> {funcionario.dataAdmissao.toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDialog("funcionario", funcionario)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="escolas">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <School className="mr-2 h-5 w-5" />
                Escolas Municipais
              </CardTitle>
              <Button onClick={() => openDialog("escola")}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Escola
              </Button>
            </CardHeader>
            <CardContent>
              {loadingEscolas ? (
                <div className="text-center py-4">Carregando escolas...</div>
              ) : (
                <div className="space-y-4">
                  {escolas.map((escola) => (
                    <div key={escola.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{escola.nome}</h3>
                            {getStatusBadge(escola.status)}
                          </div>
                          <p className="text-sm text-gray-600">{escola.endereco}</p>
                          <p className="text-sm text-gray-600">
                            <strong>Diretor(a):</strong> {escola.diretor}
                          </p>
                          <p className="text-sm text-gray-600">{escola.telefone}</p>
                          <p className="text-sm text-gray-600">{escola.email}</p>
                          <p className="text-sm text-gray-600">
                            <strong>Capacidade:</strong> {escola.capacidade_total} alunos
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDialog("escola", escola)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteEscola(escola.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="professores">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Professores
              </CardTitle>
              <Button onClick={() => openDialog("professor")}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Professor
              </Button>
            </CardHeader>
            <CardContent>
              {loadingProfessores ? (
                <div className="text-center py-4">Carregando professores...</div>
              ) : (
                <div className="space-y-4">
                  {professores.map((professor) => (
                    <div key={professor.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{professor.nome}</h3>
                            {getStatusBadge(professor.status)}
                          </div>
                          <p className="text-sm text-gray-600">{professor.email}</p>
                          <p className="text-sm text-gray-600">{professor.telefone}</p>
                          <p className="text-sm text-gray-600">
                            <strong>Formação:</strong> {professor.formacao}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Admissão:</strong> {new Date(professor.data_admissao).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDialog("professor", professor)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteProfessor(professor.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {activeDialog === "secretario" && (
        <SecretarioEducacaoDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={() => setDialogOpen(false)}
          secretario={selectedItem}
        />
      )}

      {activeDialog === "funcionario" && (
        <FuncionarioEducacaoDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={() => setDialogOpen(false)}
          funcionario={selectedItem}
        />
      )}

      {activeDialog === "escola" && (
        <NovaEscolaDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleEscolaSubmit}
          escola={selectedItem}
        />
      )}

      {activeDialog === "professor" && (
        <ProfessorDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleProfessorSubmit}
          professor={selectedItem}
        />
      )}
    </div>
  );
}
