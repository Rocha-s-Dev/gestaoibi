
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Users, GraduationCap, School, BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { NovaEscolaDialog } from "./NovaEscolaDialog";
import { ProfessorDialog } from "./ProfessorDialog";
import { TurmaDialog } from "./TurmaDialog";
import { AlunoDialog } from "./AlunoDialog";
import { SistemaAcademico } from "./SistemaAcademico";
import { useEscolas } from "@/hooks/useEscolas";
import { useProfessores } from "@/hooks/useProfessores";
import { useTurmas } from "@/hooks/useTurmas";
import { useAlunos } from "@/hooks/useAlunos";

export function CadastroEducacao() {
  const [escolaDialogOpen, setEscolaDialogOpen] = useState(false);
  const [professorDialogOpen, setProfessorDialogOpen] = useState(false);
  const [turmaDialogOpen, setTurmaDialogOpen] = useState(false);
  const [alunoDialogOpen, setAlunoDialogOpen] = useState(false);
  const [selectedEscola, setSelectedEscola] = useState(null);
  const [selectedProfessor, setSelectedProfessor] = useState(null);
  const [selectedTurma, setSelectedTurma] = useState(null);
  const [selectedAluno, setSelectedAluno] = useState(null);

  const { escolas, loading: escolasLoading, createEscola, updateEscola, deleteEscola } = useEscolas();
  const { professores, loading: professoresLoading, createProfessor, updateProfessor, deleteProfessor } = useProfessores();
  const { turmas, loading: turmasLoading, createTurma, updateTurma, deleteTurma } = useTurmas();
  const { alunos, loading: alunosLoading, createAluno, updateAluno, deleteAluno } = useAlunos();

  const handleEscolaSubmit = async (escolaData: any) => {
    try {
      if (selectedEscola) {
        await updateEscola(selectedEscola.id, escolaData);
        toast.success("Escola atualizada com sucesso!");
      } else {
        await createEscola(escolaData);
        toast.success("Escola cadastrada com sucesso!");
      }
      setEscolaDialogOpen(false);
      setSelectedEscola(null);
    } catch (error) {
      console.error('Erro ao salvar escola:', error);
      toast.error("Erro ao salvar escola. Tente novamente.");
    }
  };

  const handleProfessorSubmit = async (professorData: any) => {
    try {
      if (selectedProfessor) {
        await updateProfessor(selectedProfessor.id, professorData);
        toast.success("Professor atualizado com sucesso!");
      } else {
        await createProfessor(professorData);
        toast.success("Professor cadastrado com sucesso!");
      }
      setProfessorDialogOpen(false);
      setSelectedProfessor(null);
    } catch (error) {
      console.error('Erro ao salvar professor:', error);
      toast.error("Erro ao salvar professor. Tente novamente.");
    }
  };

  const handleTurmaSubmit = async (turmaData: any) => {
    try {
      if (selectedTurma) {
        await updateTurma(selectedTurma.id, turmaData);
        toast.success("Turma atualizada com sucesso!");
      } else {
        await createTurma(turmaData);
        toast.success("Turma cadastrada com sucesso!");
      }
      setTurmaDialogOpen(false);
      setSelectedTurma(null);
    } catch (error) {
      console.error('Erro ao salvar turma:', error);
      toast.error("Erro ao salvar turma. Tente novamente.");
    }
  };

  const handleAlunoSubmit = async (alunoData: any) => {
    try {
      if (selectedAluno) {
        await updateAluno(selectedAluno.id, alunoData);
        toast.success("Aluno atualizado com sucesso!");
      } else {
        await createAluno(alunoData);
        toast.success("Aluno cadastrado com sucesso!");
      }
      setAlunoDialogOpen(false);
      setSelectedAluno(null);
    } catch (error) {
      console.error('Erro ao salvar aluno:', error);
      toast.error("Erro ao salvar aluno. Tente novamente.");
    }
  };

  const handleDeleteEscola = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta escola?")) {
      try {
        await deleteEscola(id);
        toast.success("Escola excluída com sucesso!");
      } catch (error) {
        toast.error("Erro ao excluir escola.");
      }
    }
  };

  const handleDeleteProfessor = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este professor?")) {
      try {
        await deleteProfessor(id);
        toast.success("Professor excluído com sucesso!");
      } catch (error) {
        toast.error("Erro ao excluir professor.");
      }
    }
  };

  const handleDeleteTurma = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta turma?")) {
      try {
        await deleteTurma(id);
        toast.success("Turma excluída com sucesso!");
      } catch (error) {
        toast.error("Erro ao excluir turma.");
      }
    }
  };

  const handleDeleteAluno = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este aluno?")) {
      try {
        await deleteAluno(id);
        toast.success("Aluno excluído com sucesso!");
      } catch (error) {
        toast.error("Erro ao excluir aluno.");
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Cadastro Educação</h1>
        <p className="text-muted-foreground">Gerencie escolas, professores, turmas e alunos</p>
      </div>

      <Tabs defaultValue="escolas" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="escolas" className="flex items-center gap-2">
            <School className="h-4 w-4" />
            Escolas
          </TabsTrigger>
          <TabsTrigger value="professores" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Professores
          </TabsTrigger>
          <TabsTrigger value="turmas" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Turmas
          </TabsTrigger>
          <TabsTrigger value="alunos" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Alunos
          </TabsTrigger>
          <TabsTrigger value="sistema" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Sistema Acadêmico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="escolas" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Escolas Cadastradas</h2>
            <Button onClick={() => setEscolaDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Escola
            </Button>
          </div>

          {escolasLoading ? (
            <div className="text-center py-8">
              <p>Carregando escolas...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {escolas.map((escola) => (
                <Card key={escola.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{escola.nome}</CardTitle>
                    <CardDescription>{escola.diretor}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{escola.endereco}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant={escola.tipo === 'municipal' ? 'default' : 'secondary'}>
                          {escola.tipo || 'municipal'}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedEscola(escola);
                              setEscolaDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDeleteEscola(escola.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="professores" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Professores Cadastrados</h2>
            <Button onClick={() => setProfessorDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Professor
            </Button>
          </div>

          {professoresLoading ? (
            <div className="text-center py-8">
              <p>Carregando professores...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {professores.map((professor) => (
                <Card key={professor.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{professor.nome}</CardTitle>
                    <CardDescription>{professor.formacao}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{professor.email}</p>
                      <p className="text-sm text-muted-foreground">{professor.telefone}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant={professor.status === 'ativo' ? 'default' : 'secondary'}>
                          {professor.status}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedProfessor(professor);
                              setProfessorDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDeleteProfessor(professor.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="turmas" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Turmas Cadastradas</h2>
            <Button onClick={() => setTurmaDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Turma
            </Button>
          </div>

          {turmasLoading ? (
            <div className="text-center py-8">
              <p>Carregando turmas...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {turmas.map((turma) => (
                <Card key={turma.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{turma.nome}</CardTitle>
                    <CardDescription>{turma.serie} - {turma.ano_letivo}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Turno:</span>
                        <span className="capitalize">{turma.turno}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Modalidade:</span>
                        <span className="capitalize">{turma.modalidade.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Capacidade:</span>
                        <span>{turma.capacidade} alunos</span>
                      </div>
                      {turma.sala && (
                        <div className="flex justify-between text-sm">
                          <span>Sala:</span>
                          <span>{turma.sala}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2">
                        <Badge variant={turma.status === 'ativa' ? 'default' : 'secondary'}>
                          {turma.status}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedTurma(turma);
                              setTurmaDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDeleteTurma(turma.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="alunos" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Alunos Cadastrados</h2>
            <Button onClick={() => setAlunoDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Aluno
            </Button>
          </div>

          {alunosLoading ? (
            <div className="text-center py-8">
              <p>Carregando alunos...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {alunos.map((aluno) => (
                <Card key={aluno.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{aluno.nome}</CardTitle>
                    <CardDescription>Matrícula: {aluno.numero_matricula}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Data Nascimento:</span>
                        <span>{new Date(aluno.data_nascimento).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Data Matrícula:</span>
                        <span>{new Date(aluno.data_matricula).toLocaleDateString('pt-BR')}</span>
                      </div>
                      {aluno.responsavel_telefone && (
                        <div className="flex justify-between text-sm">
                          <span>Responsável:</span>
                          <span>{aluno.responsavel_telefone}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2">
                        <Badge variant={aluno.situacao === 'ativo' ? 'default' : 'secondary'}>
                          {aluno.situacao || 'ativo'}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedAluno(aluno);
                              setAlunoDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDeleteAluno(aluno.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sistema">
          <SistemaAcademico />
        </TabsContent>
      </Tabs>

      <NovaEscolaDialog
        open={escolaDialogOpen}
        onOpenChange={setEscolaDialogOpen}
        onSubmit={handleEscolaSubmit}
        escola={selectedEscola}
      />

      <ProfessorDialog
        open={professorDialogOpen}
        onOpenChange={setProfessorDialogOpen}
        onSubmit={handleProfessorSubmit}
        professor={selectedProfessor}
      />

      <TurmaDialog
        open={turmaDialogOpen}
        onOpenChange={setTurmaDialogOpen}
        onSubmit={handleTurmaSubmit}
        turma={selectedTurma}
      />

      <AlunoDialog
        open={alunoDialogOpen}
        onOpenChange={setAlunoDialogOpen}
        onSubmit={handleAlunoSubmit}
        aluno={selectedAluno}
      />
    </div>
  );
}
