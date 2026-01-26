import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, Search, Shield } from "lucide-react";
import { usePapeisUsuario } from "@/hooks/usePapeisUsuario";
import { PapelDialog } from "./PapelDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Database } from "@/integrations/supabase/types";

type PapelUsuario = Database["public"]["Tables"]["papeis_usuario"]["Row"];

const papelLabels: Record<string, { label: string; color: string }> = {
  admin_municipal: { label: "Admin Municipal", color: "bg-red-100 text-red-800" },
  secretario: { label: "Secretário", color: "bg-purple-100 text-purple-800" },
  secretario_adjunto: { label: "Secretário Adjunto", color: "bg-purple-100 text-purple-700" },
  diretor: { label: "Diretor", color: "bg-blue-100 text-blue-800" },
  coordenador: { label: "Coordenador", color: "bg-cyan-100 text-cyan-800" },
  tecnico: { label: "Técnico", color: "bg-green-100 text-green-800" },
  operador: { label: "Operador", color: "bg-gray-100 text-gray-800" },
  auditor: { label: "Auditor", color: "bg-amber-100 text-amber-800" },
};

export function PapeisUsuarioManagement() {
  const { papeis, isLoading, deletePapel } = usePapeisUsuario();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPapel, setSelectedPapel] = useState<PapelUsuario | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [papelToDelete, setPapelToDelete] = useState<string | null>(null);

  const filteredPapeis = papeis?.filter((papel: any) => {
    const userName = papel.profiles?.name || papel.profiles?.email || "";
    return userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           papel.papel.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleEdit = (papel: any) => {
    setSelectedPapel(papel);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (papelToDelete) {
      await deletePapel.mutateAsync(papelToDelete);
      setDeleteDialogOpen(false);
      setPapelToDelete(null);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <div>
              <CardTitle>Papéis de Usuários</CardTitle>
              <CardDescription>Gerencie os papéis e permissões dos usuários</CardDescription>
            </div>
          </div>
          <Button
            onClick={() => {
              setSelectedPapel(undefined);
              setDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Atribuir Papel
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por usuário ou papel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead>Secretaria</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Fim</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPapeis?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhum papel encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPapeis?.map((papel: any) => {
                    const papelInfo = papelLabels[papel.papel] || { label: papel.papel, color: "bg-gray-100 text-gray-800" };
                    return (
                      <TableRow key={papel.id}>
                        <TableCell className="font-medium">
                          {papel.profiles?.name || papel.profiles?.email || "Usuário"}
                        </TableCell>
                        <TableCell>
                          <Badge className={papelInfo.color} variant="outline">
                            {papelInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>{papel.secretarias?.nome || "Global"}</TableCell>
                        <TableCell>{papel.unidades_administrativas?.nome || "-"}</TableCell>
                        <TableCell>{formatDate(papel.data_inicio)}</TableCell>
                        <TableCell>{formatDate(papel.data_fim)}</TableCell>
                        <TableCell>
                          <Badge variant={papel.is_active ? "default" : "secondary"}>
                            {papel.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(papel)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setPapelToDelete(papel.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <PapelDialog open={dialogOpen} onOpenChange={setDialogOpen} papel={selectedPapel} />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover este papel do usuário? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
