import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Users, Eye, Edit, Trash2 } from "lucide-react";
import { ServidorDialog } from "./ServidorDialog";
import { ViewServidorDialog } from "./ViewServidorDialog";
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
import { toast } from "sonner";

interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
  department: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

const roleLabels: Record<string, { label: string; color: string }> = {
  admin: { label: "Administrador", color: "bg-red-100 text-red-800" },
  mayor: { label: "Prefeito", color: "bg-purple-100 text-purple-800" },
  secretary: { label: "Secretário", color: "bg-blue-100 text-blue-800" },
  employee: { label: "Funcionário", color: "bg-green-100 text-green-800" },
};

export function ServidoresManagement() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedServidor, setSelectedServidor] = useState<Profile | undefined>();
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [servidorToView, setServidorToView] = useState<Profile | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [servidorToDelete, setServidorToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { data: servidores, isLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as Profile[];
    },
  });

  const filteredServidores = servidores?.filter((servidor) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      servidor.name?.toLowerCase().includes(searchLower) ||
      servidor.email?.toLowerCase().includes(searchLower) ||
      servidor.department?.toLowerCase().includes(searchLower)
    );
  });

  const handleEdit = (servidor: Profile) => {
    setSelectedServidor(servidor);
    setDialogOpen(true);
  };

  const handleView = (servidor: Profile) => {
    setServidorToView(servidor);
    setViewDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!servidorToDelete) return;
    
    setDeleteLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId: servidorToDelete.id },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast.success("Servidor excluído com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      setDeleteDialogOpen(false);
      setServidorToDelete(null);
    } catch (error) {
      console.error("Erro ao excluir servidor:", error);
      toast.error("Erro ao excluir servidor. Tente novamente.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <div>
              <CardTitle>Servidores</CardTitle>
              <CardDescription>
                Gerencie os servidores municipais
              </CardDescription>
            </div>
          </div>
          <Button
            onClick={() => {
              setSelectedServidor(undefined);
              setDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Servidor
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email, departamento ou CPF..."
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
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServidores?.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Nenhum servidor encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredServidores?.map((servidor) => {
                    const roleInfo = roleLabels[servidor.role] || {
                      label: servidor.role,
                      color: "bg-gray-100 text-gray-800",
                    };
                    return (
                      <TableRow key={servidor.id}>
                        <TableCell className="font-medium">
                          {servidor.name || "Nome não informado"}
                        </TableCell>
                        <TableCell>{servidor.email || "-"}</TableCell>
                        <TableCell>
                          {servidor.department || "Não definido"}
                        </TableCell>
                        <TableCell>
                          <Badge className={roleInfo.color} variant="outline">
                            {roleInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleView(servidor)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(servidor)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setServidorToDelete({
                                  id: servidor.id,
                                  name: servidor.name || "Servidor",
                                });
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <ServidorDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          servidor={selectedServidor}
        />

        <ViewServidorDialog
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          servidor={servidorToView}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Servidor</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o servidor {servidorToDelete?.name}? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={deleteLoading}>
                {deleteLoading ? "Excluindo..." : "Excluir"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
