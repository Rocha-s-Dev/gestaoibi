import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Users, GraduationCap, School, BookOpen, Link2, BookMarked, Eye, UserCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { NovaEscolaDialog } from "./NovaEscolaDialog";
import { ProfessorDialog } from "./ProfessorDialog";
import { AuxiliarDialog } from "./AuxiliarDialog";
import { TurmaDialog } from "./TurmaDialog";
import { TurmaDetalhesDialog } from "./TurmaDetalhesDialog";
import { AlunoDialog } from "./AlunoDialog";
import { MateriasManagement } from "./MateriasManagement";
import { useEscolas } from "@/hooks/useEscolas";
import { useProfessores } from "@/hooks/useProfessores";
import { useAuxiliaresClasse } from "@/hooks/useAuxiliaresClasse";
import { useTurmas } from "@/hooks/useTurmas";
import { useAlunos } from "@/hooks/useAlunos";

const modalidadeLabels: Record<string, string> = {
  creche: "Creche",
  anos_iniciais: "Anos Iniciais",
  fundamental_i: "Fundamental I",
  fundamental_ii: "Fundamental II",
};

const TIPOS_PROFESSOR: Record<string, string> = {
  professor_regente: "Regente",
  professor_ed_fisica: "Ed. Física",
  professor_arte: "Arte",
  professor_ingles: "Inglês",
  professor_aee: "AEE",
  professor_reforco: "Reforço",
  professor_substituto: "Substituto",
  professor_temporario: "Temporário",
};

export function CadastroEducacao() {
  const [escolaDialogOpen, setEscolaDialogOpen] = useState(false);
  const [professorDialogOpen, setProfessorDialogOpen] = useState(false);
  const [auxiliarDialogOpen, setAuxiliarDialogOpen] = useState(false);
  const [turmaDialogOpen, setTurmaDialogOpen] = useState(false);
  const [turmaDetalhesOpen, setTurmaDetalhesOpen] = useState(false);
  const [alunoDialogOpen, setAlunoDialogOpen] = useState(false);
  const [selectedEscola, setSelectedEscola] = useState<any>(null);
  const [selectedProfessor, setSelectedProfessor] = useState<any>(null);
  const [selectedAuxiliar, setSelectedAuxiliar] = useState<any>(null);
  const [selectedTurma, setSelectedTurma] = useState<any>(null);
  const [selectedTurmaDetalhes, setSelectedTurmaDetalhes] = useState<any>(null);
  const [selectedAluno, setSelectedAluno] = useState<any>(null);

  const { escolas, loading: escolasLoading, createEscola, updateEscola, deleteEscola } = useEscolas();
  const { professores, loading: professoresLoading, vincularProfessor, updateProfessor, desvincularProfessor } = useProfessores();
  const { auxiliares, loading: auxiliaresLoading, createAuxiliar, updateAuxiliar, deleteAuxiliar } = useAuxiliaresClasse();
  const { turmas, loading: turmasLoading, createTurma, updateTurma, deleteTurma } = useTurmas();
  const { alunos, loading: alunosLoading, createAluno, updateAluno, deleteAluno } = useAlunos();

  const handleEscolaSubmit = async (escolaData: any) => {
    try {
      if (selectedEscola) { await updateEscola(selectedEscola.id, escolaData); toast.success("Escola atualizada!"); }
      else { await createEscola(escolaData); toast.success("Escola cadastrada!"); }
      setEscolaDialogOpen(false); setSelectedEscola(null);
    } catch { toast.error("Erro ao salvar escola."); }
  };

  const handleProfessorSubmit = async (data: any) => {
    try {
      if (selectedProfessor) {
        await updateProfessor(selectedProfessor.id, {
          especialidade: data.especialidade, escola_id: data.escola_id,
          funcao_educacional: data.funcao_educacional, tipo_professor: data.tipo_professor,
          status: data.status, data_inicio: data.data_inicio,
        });
        toast.success("Professor atualizado!");
      } else { await vincularProfessor(data); toast.success("Professor vinculado!"); }
      setProfessorDialogOpen(false); setSelectedProfessor(null);
    } catch { toast.error("Erro ao vincular professor."); }
  };

  const handleAuxiliarSubmit = async (data: any) => {
    try {
      if (selectedAuxiliar) {
        await updateAuxiliar(selectedAuxiliar.id, {
          tipo_profissional: data.tipo_profissional, escola_id: data.escola_id,
          status: data.status, data_inicio: data.data_inicio,
        });
        toast.success("Auxiliar atualizado!");
      } else { await createAuxiliar(data); toast.success("Auxiliar vinculado!"); }
      setAuxiliarDialogOpen(false); setSelectedAuxiliar(null);
    } catch { toast.error("Erro ao vincular auxiliar."); }
  };

  const handleTurmaSubmit = async (turmaData: any) => {
    try {
      if (selectedTurma) { await updateTurma(selectedTurma.id, turmaData); toast.success("Turma atualizada!"); }
      else { await createTurma(turmaData); toast.success("Turma cadastrada!"); }
      setTurmaDialogOpen(false); setSelectedTurma(null);
    } catch { toast.error("Erro ao salvar turma."); }
  };

  const handleAlunoSubmit = async (alunoData: any) => {
    try {
      if (selectedAluno) { await updateAluno(selectedAluno.id, alunoData); toast.success("Aluno atualizado!"); }
      else { await createAluno(alunoData); toast.success("Aluno cadastrado!"); }
      setAlunoDialogOpen(false); setSelectedAluno(null);
    } catch { toast.error("Erro ao salvar aluno."); }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Cadastro Educação</h1>
        <p className="text-muted-foreground">Gerencie escolas, professores, auxiliares, turmas, alunos e matérias</p>
      </div>

      <Tabs defaultValue="escolas" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="escolas" className="flex items-center gap-2"><School className="h-4 w-4" />Escolas</TabsTrigger>
          <TabsTrigger value="professores" className="flex items-center gap-2"><Users className="h-4 w-4" />Professores e Auxiliares</TabsTrigger>
          <TabsTrigger value="turmas" className="flex items-center gap-2"><BookOpen className="h-4 w-4" />Turmas</TabsTrigger>
          <TabsTrigger value="alunos" className="flex items-center gap-2"><GraduationCap className="h-4 w-4" />Alunos</TabsTrigger>
          <TabsTrigger value="materias" className="flex items-center gap-2"><BookMarked className="h-4 w-4" />Matérias</TabsTrigger>
        </TabsList>

        {/* Escolas */}
        <TabsContent value="escolas" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Escolas Cadastradas</h2>
            <Button onClick={() => setEscolaDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Nova Escola</Button>
          </div>
          {escolasLoading ? <div className="text-center py-8"><p>Carregando escolas...</p></div> : (
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={escola.tipo === "municipal" ? "default" : "secondary"}>{escola.tipo || "municipal"}</Badge>
                        {escola.modalidade && <Badge variant="outline">{modalidadeLabels[escola.modalidade] || escola.modalidade}</Badge>}
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button size="sm" variant="outline" onClick={() => { setSelectedEscola(escola); setEscolaDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                        <Button size="sm" variant="destructive" onClick={() => { if (confirm("Excluir esta escola?")) deleteEscola(escola.id).then(() => toast.success("Escola excluída!")).catch(() => toast.error("Erro.")); }}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Professores e Auxiliares */}
        <TabsContent value="professores" className="space-y-8">
          {/* Seção Professores */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold">Professores e Coordenadores</h2>
                <p className="text-sm text-muted-foreground">Servidores do RH vinculados à Educação</p>
              </div>
              <Button onClick={() => { setSelectedProfessor(null); setProfessorDialogOpen(true); }}>
                <Link2 className="h-4 w-4 mr-2" />Vincular Professor
              </Button>
            </div>
            {professoresLoading ? <div className="text-center py-8"><p>Carregando...</p></div> : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {professores.map((professor) => (
                  <Card key={professor.id}>
                    <CardHeader>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs"><Link2 className="h-3 w-3 mr-1" />RH</Badge>
                        <Badge variant={professor.funcao_educacional === 'coordenador' ? 'secondary' : 'default'} className="text-xs">
                          {professor.funcao_educacional === 'coordenador' ? 'Coordenador(a)' : 'Professor(a)'}
                        </Badge>
                        {professor.tipo_professor && (
                          <Badge variant="outline" className="text-xs">{TIPOS_PROFESSOR[professor.tipo_professor] || professor.tipo_professor}</Badge>
                        )}
                        <Badge variant={professor.status === 'ativo' ? 'default' : 'secondary'} className="text-xs">{professor.status || 'ativo'}</Badge>
                      </div>
                      <CardTitle className="text-lg">{professor.nome}</CardTitle>
                      <CardDescription>{professor.especialidade || "Sem especialidade"}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">{professor.email}</p>
                        {professor.escola_principal && <p className="text-sm text-muted-foreground">Escola: {professor.escola_principal.nome}</p>}
                        {professor.data_inicio && <p className="text-xs text-muted-foreground">Início: {new Date(professor.data_inicio).toLocaleDateString("pt-BR")}</p>}
                        <div className="flex space-x-2 justify-end">
                          <Button size="sm" variant="outline" onClick={() => { setSelectedProfessor(professor); setProfessorDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                          <Button size="sm" variant="destructive" onClick={() => { if (confirm("Desvincular professor?")) desvincularProfessor(professor.id).then(() => toast.success("Desvinculado!")).catch(() => toast.error("Erro.")); }}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {professores.length === 0 && <div className="col-span-full text-center py-8 text-muted-foreground">Nenhum professor vinculado.</div>}
              </div>
            )}
          </div>

          {/* Separador */}
          <hr className="border-border" />

          {/* Seção Auxiliares */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold flex items-center gap-2"><UserCheck className="h-6 w-6" />Auxiliares de Classe</h2>
                <p className="text-sm text-muted-foreground">Auxiliares de turma e de alunos com necessidades especiais</p>
              </div>
              <Button onClick={() => { setSelectedAuxiliar(null); setAuxiliarDialogOpen(true); }}>
                <Link2 className="h-4 w-4 mr-2" />Vincular Auxiliar
              </Button>
            </div>
            {auxiliaresLoading ? <div className="text-center py-8"><p>Carregando...</p></div> : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {auxiliares.map((aux) => (
                  <Card key={aux.id}>
                    <CardHeader>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs"><Link2 className="h-3 w-3 mr-1" />RH</Badge>
                        <Badge variant="secondary" className="text-xs">{aux.tipo_profissional === 'auxiliar_aluno_especial' ? 'Aux. Especial' : 'Aux. Turma'}</Badge>
                        <Badge variant={aux.status === 'ativo' ? 'default' : 'secondary'} className="text-xs">{aux.status || 'ativo'}</Badge>
                      </div>
                      <CardTitle className="text-lg">{aux.nome}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">{aux.email}</p>
                        {aux.escola && <p className="text-sm text-muted-foreground">Escola: {aux.escola.nome}</p>}
                        {aux.data_inicio && <p className="text-xs text-muted-foreground">Início: {new Date(aux.data_inicio).toLocaleDateString("pt-BR")}</p>}
                        <div className="flex space-x-2 justify-end">
                          <Button size="sm" variant="outline" onClick={() => { setSelectedAuxiliar(aux); setAuxiliarDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                          <Button size="sm" variant="destructive" onClick={() => { if (confirm("Remover auxiliar?")) deleteAuxiliar(aux.id).then(() => toast.success("Removido!")).catch(() => toast.error("Erro.")); }}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {auxiliares.length === 0 && <div className="col-span-full text-center py-8 text-muted-foreground">Nenhum auxiliar vinculado.</div>}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Turmas */}
        <TabsContent value="turmas" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Turmas Cadastradas</h2>
            <Button onClick={() => setTurmaDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Nova Turma</Button>
          </div>
          {turmasLoading ? <div className="text-center py-8"><p>Carregando turmas...</p></div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {turmas.map((turma) => (
                <Card key={turma.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{turma.nome}</CardTitle>
                    <CardDescription>{turma.serie} - {turma.ano_letivo}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm"><span>Turno:</span><span className="capitalize">{turma.turno}</span></div>
                      <div className="flex justify-between text-sm"><span>Modalidade:</span><span className="capitalize">{turma.modalidade.replace("_", " ")}</span></div>
                      <div className="flex justify-between text-sm"><span>Capacidade:</span><span>{turma.capacidade} alunos</span></div>
                      {turma.sala && <div className="flex justify-between text-sm"><span>Sala:</span><span>{turma.sala}</span></div>}
                      <div className="flex items-center justify-between pt-2">
                        <Badge variant={turma.status === "ativa" ? "default" : "secondary"}>{turma.status}</Badge>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => { setSelectedTurmaDetalhes(turma); setTurmaDetalhesOpen(true); }} title="Ver equipe">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => { setSelectedTurma(turma); setTurmaDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                          <Button size="sm" variant="destructive" onClick={() => { if (confirm("Excluir turma?")) deleteTurma(turma.id).then(() => toast.success("Excluída!")).catch(() => toast.error("Erro.")); }}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Alunos */}
        <TabsContent value="alunos" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Alunos Cadastrados</h2>
            <Button onClick={() => setAlunoDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Novo Aluno</Button>
          </div>
          {alunosLoading ? <div className="text-center py-8"><p>Carregando alunos...</p></div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {alunos.map((aluno) => (
                <Card key={aluno.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{aluno.nome}</CardTitle>
                    <CardDescription>Matrícula: {aluno.numero_matricula}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm"><span>Data Nascimento:</span><span>{new Date(aluno.data_nascimento).toLocaleDateString("pt-BR")}</span></div>
                      <div className="flex justify-between text-sm"><span>Data Matrícula:</span><span>{new Date(aluno.data_matricula).toLocaleDateString("pt-BR")}</span></div>
                      {aluno.responsavel_telefone && <div className="flex justify-between text-sm"><span>Responsável:</span><span>{aluno.responsavel_telefone}</span></div>}
                      <div className="flex items-center justify-between pt-2">
                        <Badge variant={aluno.situacao === "ativo" ? "default" : "secondary"}>{aluno.situacao || "ativo"}</Badge>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => { setSelectedAluno(aluno); setAlunoDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                          <Button size="sm" variant="destructive" onClick={() => { if (confirm("Excluir aluno?")) deleteAluno(aluno.id).then(() => toast.success("Excluído!")).catch(() => toast.error("Erro.")); }}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Matérias */}
        <TabsContent value="materias" className="space-y-6">
          <MateriasManagement />
        </TabsContent>
      </Tabs>

      <NovaEscolaDialog open={escolaDialogOpen} onOpenChange={setEscolaDialogOpen} onSubmit={handleEscolaSubmit} escola={selectedEscola} />
      <ProfessorDialog open={professorDialogOpen} onOpenChange={setProfessorDialogOpen} onSubmit={handleProfessorSubmit} professor={selectedProfessor} />
      <AuxiliarDialog open={auxiliarDialogOpen} onOpenChange={setAuxiliarDialogOpen} onSubmit={handleAuxiliarSubmit} auxiliar={selectedAuxiliar} />
      <TurmaDialog open={turmaDialogOpen} onOpenChange={setTurmaDialogOpen} onSubmit={handleTurmaSubmit} turma={selectedTurma} />
      <TurmaDetalhesDialog open={turmaDetalhesOpen} onOpenChange={setTurmaDetalhesOpen} turma={selectedTurmaDetalhes} />
      <AlunoDialog open={alunoDialogOpen} onOpenChange={setAlunoDialogOpen} onSubmit={handleAlunoSubmit} aluno={selectedAluno} />
    </div>
  );
}
