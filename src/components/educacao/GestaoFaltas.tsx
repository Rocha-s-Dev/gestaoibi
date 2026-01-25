import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Search, AlertTriangle } from "lucide-react";
import { FaltaDialog } from "./FaltaDialog";
import { useFaltas, Falta } from "@/hooks/useFaltas";
import { toast } from "sonner";

export function GestaoFaltas() {
  const [faltaDialogOpen, setFaltaDialogOpen] = useState(false);
  const [selectedFalta, setSelectedFalta] = useState<Falta | null>(null);
  const [pesquisaAluno, setPesquisaAluno] = useState("");

  const { faltas, loading, deleteFalta } = useFaltas();

  const faltasFiltradas = faltas.filter(falta => {
    const matchAluno = !pesquisaAluno || 
      falta.aluno?.nome?.toLowerCase().includes(pesquisaAluno.toLowerCase()) ||
      falta.aluno?.numero_matricula?.includes(pesquisaAluno);
    
    return matchAluno;
  });

  const handleDeleteFalta = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta falta?")) {
      try {
        await deleteFalta(id);
        toast.success("Falta excluída com sucesso!");
      } catch (error) {
        toast.error("Erro ao excluir falta.");
      }
    }
  };

  // Estatísticas
  const estatisticas = {
    total: faltasFiltradas.length,
    justificadas: faltasFiltradas.filter(f => f.justificada).length,
    injustificadas: faltasFiltradas.filter(f => !f.justificada).length
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Faltas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">Justificadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{estatisticas.justificadas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Injustificadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{estatisticas.injustificadas}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="pesquisa">Pesquisar Aluno</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="pesquisa"
                  placeholder="Nome ou matrícula"
                  value={pesquisaAluno}
                  onChange={(e) => setPesquisaAluno(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button onClick={() => setFaltaDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Falta
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Faltas */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Registro de Faltas</CardTitle>
            <Badge variant="outline">
              {faltasFiltradas.length} registro(s)
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p>Carregando faltas...</p>
            </div>
          ) : faltasFiltradas.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma falta encontrada.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Aluno</th>
                    <th className="text-left p-3">Data</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Motivo</th>
                    <th className="text-left p-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {faltasFiltradas.map((falta) => (
                    <tr key={falta.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{falta.aluno?.nome || '-'}</p>
                          <p className="text-sm text-muted-foreground">
                            {falta.aluno?.numero_matricula || '-'}
                          </p>
                        </div>
                      </td>
                      <td className="p-3">
                        {new Date(falta.data).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-3">
                        <Badge 
                          variant={falta.justificada ? 'secondary' : 'destructive'}
                        >
                          {falta.justificada ? 'Justificada' : 'Injustificada'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="max-w-48 truncate" title={falta.motivo || ''}>
                          {falta.motivo || '-'}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedFalta(falta);
                              setFaltaDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteFalta(falta.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <FaltaDialog
        open={faltaDialogOpen}
        onOpenChange={setFaltaDialogOpen}
        falta={selectedFalta}
        onClose={() => {
          setSelectedFalta(null);
          setFaltaDialogOpen(false);
        }}
      />
    </div>
  );
}
