
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Edit, Trash2, Users, School, UserCheck } from "lucide-react";
import { SecretarioEducacaoDialog } from "./SecretarioEducacaoDialog";
import { FuncionarioEducacaoDialog } from "./FuncionarioEducacaoDialog";
import { EscolaDialog } from "./EscolaDialog";

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

type Escola = {
  id: string;
  nome: string;
  endereco: string;
  diretor: string;
  telefone: string;
  email: string;
  numeroAlunos: number;
  modalidade: "infantil" | "fundamental" | "eja" | "creche";
  status: "ativa" | "inativa" | "em_reforma";
};

export function CadastroEducacao() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [activeDialog, setActiveDialog] = useState<"secretario" | "funcionario" | "escola" | null>(null);

  // Mock data
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

  const [escolas] = useState<Escola[]>([
    {
      id: "1",
      nome: "EMEI Pequeno Príncipe",
      endereco: "Rua das Flores, 123 - Centro",
      diretor: "Carla Mendes",
      telefone: "(11) 3456-7893",
      email: "emei.pequenoprincipe@educacao.gov.br",
      numeroAlunos: 180,
      modalidade: "infantil",
      status: "ativa"
    },
    {
      id: "2",
      nome: "EMEF Dom Pedro II",
      endereco: "Av. Principal, 456 - Jardim das Acácias",
      diretor: "Roberto Silva",
      telefone: "(11) 3456-7894",
      email: "emef.dompedro@educacao.gov.br",
      numeroAlunos: 350,
      modalidade: "fundamental",
      status: "ativa"
    }
  ]);

  const openDialog = (type: "secretario" | "funcionario" | "escola", item?: any) => {
    setActiveDialog(type);
    setSelectedItem(item || null);
    setDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ativo: { color: "bg-green-100 text-green-800", label: "Ativo" },
      ativa: { color: "bg-green-100 text-green-800", label: "Ativa" },
      inativo: { color: "bg-red-100 text-red-800", label: "Inativo" },
      inativa: { color: "bg-red-100 text-red-800", label: "Inativa" },
      afastado: { color: "bg-yellow-100 text-yellow-800", label: "Afastado" },
      em_reforma: { color: "bg-blue-100 text-blue-800", label: "Em Reforma" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge className={config.color}>{config.label}</Badge>;
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="secretario">Secretário(a)</TabsTrigger>
          <TabsTrigger value="funcionarios">Funcionários</TabsTrigger>
          <TabsTrigger value="escolas">Escolas</TabsTrigger>
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
              <div className="space-y-4">
                {escolas.map((escola) => (
                  <div key={escola.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{escola.nome}</h3>
                          {getStatusBadge(escola.status)}
                          <Badge variant="outline">
                            {escola.modalidade === "infantil" ? "Ed. Infantil" :
                             escola.modalidade === "fundamental" ? "Ed. Fundamental" :
                             escola.modalidade === "eja" ? "EJA" : "Creche"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{escola.endereco}</p>
                        <p className="text-sm text-gray-600">
                          <strong>Diretor(a):</strong> {escola.diretor}
                        </p>
                        <p className="text-sm text-gray-600">{escola.telefone}</p>
                        <p className="text-sm text-gray-600">{escola.email}</p>
                        <p className="text-sm text-gray-600">
                          <strong>Número de Alunos:</strong> {escola.numeroAlunos}
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
        <EscolaDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={() => setDialogOpen(false)}
          escola={selectedItem}
        />
      )}
    </div>
  );
}
