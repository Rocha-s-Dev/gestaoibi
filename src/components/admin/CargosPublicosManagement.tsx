import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, Search, Briefcase } from "lucide-react";
import { useCargosPublicos } from "@/hooks/useCargosPublicos";
import { CargoDialog } from "./CargoDialog";
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

type CargoPublico = Database["public"]["Tables"]["cargos_publicos"]["Row"];

export function CargosPublicosManagement() {
  const { cargos, isLoading, deleteCargo } = useCargosPublicos();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCargo, setSelectedCargo] = useState<CargoPublico | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cargoToDelete, setCargoToDelete] = useState<string | null>(null);

  const filteredCargos = cargos?.filter(
    (cargo) =>
      cargo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cargo.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (cargo: CargoPublico) => {
    setSelectedCargo(cargo);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (cargoToDelete) {
      await deleteCargo.mutateAsync(cargoToDelete);
      setDeleteDialogOpen(false);
      setCargoToDelete(null);
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
      efetivo: "bg-green-100 text-green-800",
      comissionado: "bg-blue-100 text-blue-800",
      temporario: "bg-yellow-100 text-yellow-800",
      emprego_publico: "bg-purple-100 text-purple-800",
    };
    return colors[tipo] || "bg-gray-100 text-gray-800";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            <div>
              <CardTitle>Cargos Públicos</CardTitle>
              <CardDescription>Gerencie os cargos públicos do município</CardDescription>
            </div>
          </div>
          <Button
            onClick={() => {
              setSelectedCargo(undefined);
              setDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Cargo
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
                  <TableHead>Regime</TableHead>
                  <TableHead>Nível/Classe</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Vagas</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCargos?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhum cargo encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCargos?.map((cargo) => (
                    <TableRow key={cargo.id}>
                      <TableCell className="font-mono">{cargo.codigo}</TableCell>
                      <TableCell className="font-medium">{cargo.nome}</TableCell>
                      <TableCell>
                        <Badge className={getTipoBadge(cargo.tipo)} variant="outline">
                          {cargo.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell>{cargo.regime}</TableCell>
                      <TableCell>
                        {cargo.nivel && cargo.classe
                          ? `${cargo.nivel}/${cargo.classe}`
                          : cargo.nivel || cargo.classe || "-"}
                      </TableCell>
                      <TableCell>{formatCurrency(cargo.vencimento_base)}</TableCell>
                      <TableCell>
                        {cargo.vagas_ocupadas ?? 0}/{cargo.vagas_criadas ?? 0}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(cargo)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setCargoToDelete(cargo.id);
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

        <CargoDialog open={dialogOpen} onOpenChange={setDialogOpen} cargo={selectedCargo} />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este cargo? Esta ação não pode ser desfeita.
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
