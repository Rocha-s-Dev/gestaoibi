import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Users, Eye, Edit, Trash2 } from "lucide-react";
import { ServidorDialog } from "./ServidorDialog";
import { ViewServidorDialog } from "./ViewServidorDialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
  cpf: string | null;
  telefone_celular: string | null;
  status_cadastral: string | null;
  tipo_usuario: string | null;
  created_at: string;
  updated_at: string;
}

const tipoLabels: Record<string, { label: string; color: string }> = {
  administrador: { label: "Administrador", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  prefeito: { label: "Prefeito", color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" },
  secretario: { label: "Secretário", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  gestor_rh: { label: "Gestor de RH", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200" },
  funcionario: { label: "Funcionário", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  auditor: { label: "Auditor", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
  juridico: { label: "Jurídico", color: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200" },
};

const statusLabels: Record<string, { label: string; color: string }> = {
  ativo: { label: "Ativo", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  inativo: { label: "Inativo", color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200" },
  bloqueado: { label: "Bloqueado", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  pendente_regularizacao: { label: "Pendente", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
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
        .select("id, user_id, name, email, cpf, telefone_celular, status_cadastral, tipo_usuario, created_at, updated_at")
        .neq("tipo_usuario", "administrador")
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
      servidor.cpf?.toLowerCase().includes(searchLower)
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

      toast.success("Servidor inativado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      setDeleteDialogOpen(false);
      setServidorToDelete(null);
    } catch (error) {
      console.error("Erro ao inativar servidor:", error);
      toast.error("Erro ao inativar servidor. Tente novamente.");
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
                Base única de usuários do sistema — criados exclusivamente pelo RH
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
              placeholder="Buscar por nome, email ou CPF..."
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
                  <TableHead>CPF</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServidores?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum servidor encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredServidores?.map((servidor) => {
                    const tipoInfo = tipoLabels[servidor.tipo_usuario || "funcionario"] || { label: servidor.tipo_usuario || "Funcionário", color: "bg-gray-100 text-gray-800" };
                    const statusInfo = statusLabels[servidor.status_cadastral || "ativo"] || { label: servidor.status_cadastral || "Ativo", color: "bg-gray-100 text-gray-800" };
                    return (
                      <TableRow key={servidor.id}>
                        <TableCell className="font-medium">
                          {servidor.name || "Nome não informado"}
                        </TableCell>
                        <TableCell>{servidor.cpf || "-"}</TableCell>
                        <TableCell>{servidor.email || "-"}</TableCell>
                        <TableCell>
                          <Badge className={tipoInfo.color} variant="outline">{tipoInfo.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusInfo.color} variant="outline">{statusInfo.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleView(servidor)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(servidor)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setServidorToDelete({ id: servidor.id, name: servidor.name || "Servidor" });
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
          servidor={selectedServidor as any}
        />

        <ViewServidorDialog
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          servidor={servidorToView as any}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Inativar Servidor</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja inativar o servidor {servidorToDelete?.name}? O acesso será bloqueado mas os dados serão preservados para auditoria.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={deleteLoading}>
                {deleteLoading ? "Inativando..." : "Inativar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
