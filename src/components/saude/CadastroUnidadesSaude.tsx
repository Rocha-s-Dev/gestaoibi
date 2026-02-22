import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, MapPin, Clock, Users, Edit, Trash2, Loader2 } from "lucide-react";
import { UnidadeSaudeDialog } from "./UnidadeSaudeDialog";
import { useUnidadesSaude } from "@/hooks/useUnidadesSaude";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface UnidadeSaude {
  id: string;
  nome: string;
  tipo: "UBS" | "UPA" | "Hospital" | "Clinica" | "CAPS" | "Laboratorio";
  endereco: string;
  telefone: string;
  horarioFuncionamento: {
    segunda: string;
    terca: string;
    quarta: string;
    quinta: string;
    sexta: string;
    sabado: string;
    domingo: string;
  };
  especialidades: string[];
  responsavel: string;
  capacidade: number;
  status: "ativo" | "inativo" | "manutencao";
  observacoes?: string;
}

const tipoColors: Record<string, string> = {
  UBS: "bg-blue-100 text-blue-800",
  UPA: "bg-red-100 text-red-800",
  Hospital: "bg-green-100 text-green-800",
  Clinica: "bg-purple-100 text-purple-800",
  CAPS: "bg-yellow-100 text-yellow-800",
  Laboratorio: "bg-orange-100 text-orange-800",
};

const statusColors: Record<string, string> = {
  ativo: "bg-green-100 text-green-800",
  inativo: "bg-gray-100 text-gray-800",
  manutencao: "bg-yellow-100 text-yellow-800",
};

export function CadastroUnidadesSaude() {
  const { unidades, isLoading, createUnidade, updateUnidade, deleteUnidade } = useUnidadesSaude();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUnidade, setSelectedUnidade] = useState<UnidadeSaude | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filtrar apenas ativas/manutenção por padrão e aplicar busca
  const filteredUnidades = useMemo(() => {
    const activeUnidades = unidades.filter((u) => u.status !== "inativo");
    if (!searchTerm) return activeUnidades;
    const term = searchTerm.toLowerCase();
    return activeUnidades.filter(
      (u) =>
        u.nome.toLowerCase().includes(term) ||
        u.tipo.toLowerCase().includes(term) ||
        u.endereco.toLowerCase().includes(term) ||
        u.especialidades.some((esp) => esp.toLowerCase().includes(term))
    );
  }, [unidades, searchTerm]);

  const handleEdit = (unidade: UnidadeSaude) => {
    setSelectedUnidade(unidade);
    setDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteUnidade.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const openNewUnidadeDialog = () => {
    setSelectedUnidade(null);
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            placeholder="Buscar unidades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={openNewUnidadeDialog} className="flex items-center gap-2">
          <Plus size={20} />
          Nova Unidade
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredUnidades.map((unidade) => (
          <Card key={unidade.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{unidade.nome}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={tipoColors[unidade.tipo]}>{unidade.tipo}</Badge>
                    <Badge className={statusColors[unidade.status]}>{unidade.status}</Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(unidade)} className="h-8 w-8">
                    <Edit size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(unidade.id)} className="h-8 w-8 text-destructive hover:text-destructive">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin size={16} />
                  <span>{unidade.endereco}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock size={16} />
                  <span>Seg-Sex: {unidade.horarioFuncionamento.segunda}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users size={16} />
                  <span>Capacidade: {unidade.capacidade} pacientes</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Especialidades:</p>
                <div className="flex flex-wrap gap-1">
                  {unidade.especialidades.slice(0, 3).map((esp, index) => (
                    <Badge key={index} variant="outline" className="text-xs">{esp}</Badge>
                  ))}
                  {unidade.especialidades.length > 3 && (
                    <Badge variant="outline" className="text-xs">+{unidade.especialidades.length - 3} mais</Badge>
                  )}
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Responsável:</span> {unidade.responsavel}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Telefone:</span> {unidade.telefone}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUnidades.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Nenhuma unidade encontrada</p>
        </div>
      )}

      <UnidadeSaudeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        unidade={selectedUnidade}
        onSave={(data) => {
          if (selectedUnidade) {
            updateUnidade.mutate({ id: selectedUnidade.id, ...data });
          } else {
            createUnidade.mutate(data);
          }
        }}
        isSaving={createUnidade.isPending || updateUnidade.isPending}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar unidade de saúde?</AlertDialogTitle>
            <AlertDialogDescription>
              A unidade será marcada como inativa e não aparecerá mais na listagem. Esta ação pode ser revertida editando o status da unidade.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
