import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, Search, Award } from "lucide-react";
import { useFuncoesAdministrativas } from "@/hooks/useFuncoesAdministrativas";
import { FuncaoDialog } from "./FuncaoDialog";
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

type FuncaoAdministrativa = Database["public"]["Tables"]["funcoes_administrativas"]["Row"];

export function FuncoesAdministrativasManagement() {
  const { funcoes, isLoading, deleteFuncao } = useFuncoesAdministrativas();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFuncao, setSelectedFuncao] = useState<FuncaoAdministrativa | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [funcaoToDelete, setFuncaoToDelete] = useState<string | null>(null);

  const filteredFuncoes = funcoes?.filter(
    (funcao: any) =>
      funcao.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      funcao.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (funcao: any) => {
    setSelectedFuncao(funcao);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (funcaoToDelete) {
      await deleteFuncao.mutateAsync(funcaoToDelete);
      setDeleteDialogOpen(false);
      setFuncaoToDelete(null);
    }
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getTipoBadge = (tipo: string) => {
    const colors: Record<string, string> = {
      comissionada: "bg-blue-100 text-blue-800",
      gratificada: "bg-green-100 text-green-800",
      cargo_em_comissao: "bg-purple-100 text-purple-800",
    };
    return colors[tipo] || "bg-gray-100 text-gray-800";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            <div>
              <CardTitle>Funções Administrativas</CardTitle>
              <CardDescription>Gerencie as funções comissionadas e gratificadas</CardDescription>
            </div>
          </div>
          <Button
            onClick={() => {
              setSelectedFuncao(undefined);
              setDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Função
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou código..."
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
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Secretaria</TableHead>
                  <TableHead>Gratificação</TableHead>
                  <TableHead>Nível</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFuncoes?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhuma função encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFuncoes?.map((funcao: any) => (
                    <TableRow key={funcao.id}>
                      <TableCell className="font-mono">{funcao.codigo}</TableCell>
                      <TableCell className="font-medium">{funcao.nome}</TableCell>
                      <TableCell>
                        <Badge className={getTipoBadge(funcao.tipo)} variant="outline">
                          {funcao.tipo === "cargo_em_comissao" ? "CC" : funcao.tipo === "gratificada" ? "FG" : funcao.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell>{funcao.secretarias?.nome || "-"}</TableCell>
                      <TableCell>
                        {funcao.valor_gratificacao
                          ? formatCurrency(funcao.valor_gratificacao)
                          : funcao.percentual_gratificacao
                          ? `${funcao.percentual_gratificacao}%`
                          : "-"}
                      </TableCell>
                      <TableCell>{funcao.nivel_hierarquico || "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(funcao)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setFuncaoToDelete(funcao.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <FuncaoDialog open={dialogOpen} onOpenChange={setDialogOpen} funcao={selectedFuncao} />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta função? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
