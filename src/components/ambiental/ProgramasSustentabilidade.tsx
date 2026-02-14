import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Leaf, Edit, Trash2 } from "lucide-react";
import { ProgramaDialog } from "./ProgramaDialog";
import { DeleteProgramaDialog } from "./DeleteProgramaDialog";
import { useProgramasSustentabilidade } from "@/hooks/useAmbiental";

interface Props {
  refreshTrigger: number;
  onProgramaAdded: () => void;
}

export function ProgramasSustentabilidade({ refreshTrigger, onProgramaAdded }: Props) {
  const { programas, loading, addPrograma, updatePrograma, deletePrograma } = useProgramasSustentabilidade();
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<string>("todos");
  const [statusFiltro, setStatusFiltro] = useState<string>("todos");
  const [showDialog, setShowDialog] = useState(false);
  const [currentPrograma, setCurrentPrograma] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const filteredProgramas = programas.filter((programa) => {
    const matchesSearch = programa.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      programa.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = tipoFiltro === "todos" || programa.tipo === tipoFiltro;
    const matchesStatus = statusFiltro === "todos" || programa.status === statusFiltro;
    return matchesSearch && matchesTipo && matchesStatus;
  });

  const handleAdd = () => { setCurrentPrograma(null); setShowDialog(true); };
  const handleEdit = (programa: any) => { setCurrentPrograma(programa); setShowDialog(true); };
  const handleDelete = (programa: any) => { setCurrentPrograma(programa); setShowDeleteDialog(true); };

  const handleSavePrograma = async (programa: any) => {
    if (currentPrograma) {
      await updatePrograma(currentPrograma.id, {
        titulo: programa.titulo,
        descricao: programa.descricao,
        tipo: programa.tipo,
        data_inicio: programa.dataInicio,
        status: programa.status,
      });
    } else {
      await addPrograma({
        titulo: programa.titulo,
        descricao: programa.descricao,
        tipo: programa.tipo,
        data_inicio: programa.dataInicio,
        status: programa.status,
      });
    }
    onProgramaAdded();
  };

  const handleConfirmDelete = async () => {
    if (currentPrograma) {
      await deletePrograma(currentPrograma.id);
      setShowDeleteDialog(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ativo": return <Badge className="bg-green-500 hover:bg-green-600">Ativo</Badge>;
      case "concluido": return <Badge className="bg-blue-500 hover:bg-blue-600">Concluído</Badge>;
      case "planejado": return <Badge variant="secondary">Planejado</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Map DB fields to dialog format
  const mapToDialogFormat = (p: any) => p ? ({
    id: p.id, titulo: p.titulo, descricao: p.descricao || "",
    tipo: p.tipo, dataInicio: p.data_inicio, status: p.status,
  }) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
        <h2 className="text-xl font-semibold">Iniciativas Ambientais</h2>
        <Button onClick={handleAdd}>Adicionar Programa</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1 md:col-span-3">
          <Input placeholder="Pesquisar programas..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="mb-4" />
        </div>
        <div>
          <Label htmlFor="tipoFiltro">Filtrar por tipo</Label>
          <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
            <SelectTrigger id="tipoFiltro"><SelectValue placeholder="Todos os tipos" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              <SelectItem value="Resíduos">Resíduos</SelectItem>
              <SelectItem value="Educação">Educação</SelectItem>
              <SelectItem value="Preservação">Preservação</SelectItem>
              <SelectItem value="Energia">Energia</SelectItem>
              <SelectItem value="Água">Água</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="statusFiltro">Filtrar por status</Label>
          <Select value={statusFiltro} onValueChange={setStatusFiltro}>
            <SelectTrigger id="statusFiltro"><SelectValue placeholder="Todos os status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="ativo">Ativos</SelectItem>
              <SelectItem value="concluido">Concluídos</SelectItem>
              <SelectItem value="planejado">Planejados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-muted-foreground">Carregando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {filteredProgramas.length === 0 ? (
            <div className="col-span-full text-center py-10">
              <Leaf className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-medium">Nenhum programa encontrado</h3>
              <p className="mt-1 text-sm text-muted-foreground">Não foram encontrados programas com os filtros aplicados.</p>
            </div>
          ) : (
            filteredProgramas.map((programa) => (
              <Card key={programa.id} className="overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{programa.titulo}</h3>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(programa)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(programa)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  <div className="flex items-center mt-2 space-x-2">
                    <Badge variant="outline">{programa.tipo}</Badge>
                    {getStatusBadge(programa.status)}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{programa.descricao}</p>
                  <div className="mt-4 text-xs text-muted-foreground">
                    Início: {new Date(programa.data_inicio).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {showDialog && (
        <ProgramaDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          onSave={handleSavePrograma}
          programa={mapToDialogFormat(currentPrograma)}
        />
      )}

      {showDeleteDialog && currentPrograma && (
        <DeleteProgramaDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleConfirmDelete}
          programaTitulo={currentPrograma.titulo}
        />
      )}
    </div>
  );
}
