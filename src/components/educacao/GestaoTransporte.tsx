import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bus, MapPin, Plus, Route, Trash2, Edit, Users } from "lucide-react";
import { useRotas, useAlunosRotas } from "@/hooks/useTransporteEscolar";
import { RotaDialog } from "./RotaDialog";
import { VinculoAlunoRotaDialog } from "./VinculoAlunoRotaDialog";
import { Skeleton } from "@/components/ui/skeleton";
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

const statusRotaColors: Record<string, string> = {
  ativa: "bg-green-500",
  inativa: "bg-gray-500",
  em_manutencao: "bg-orange-500",
};

export function GestaoTransporte() {
  const [rotaDialogOpen, setRotaDialogOpen] = useState(false);
  const [vinculoDialogOpen, setVinculoDialogOpen] = useState(false);
  const [selectedRota, setSelectedRota] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: "rota"; id: string } | null>(null);

  const { rotas, loading: rotasLoading, deleteRota, refreshRotas } = useRotas();
  const { alunosRotas, loading: alunosRotasLoading, refreshAlunosRotas } = useAlunosRotas();

  const handleEditRota = (rota: any) => {
    setSelectedRota(rota);
    setRotaDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      deleteRota(itemToDelete.id);
    }
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="rotas" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="rotas" className="flex items-center gap-2">
            <Route className="h-4 w-4" />
            Rotas
          </TabsTrigger>
          <TabsTrigger value="vinculos" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Alunos por Rota
          </TabsTrigger>
        </TabsList>

        {/* Rotas */}
        <TabsContent value="rotas">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Route className="h-5 w-5" />
                  Rotas de Transporte
                </CardTitle>
                <CardDescription>Gerencie as rotas do transporte escolar</CardDescription>
              </div>
              <Button onClick={() => { setSelectedRota(null); setRotaDialogOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Rota
              </Button>
            </CardHeader>
            <CardContent>
              {rotasLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : rotas && rotas.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Horário</TableHead>
                      <TableHead>KM Estimado</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rotas.map((rota) => (
                      <TableRow key={rota.id}>
                        <TableCell className="font-medium">{rota.nome}</TableCell>
                        <TableCell>{rota.descricao || "—"}</TableCell>
                        <TableCell>
                          {rota.horario_inicio && rota.horario_fim
                            ? `${rota.horario_inicio} - ${rota.horario_fim}`
                            : "—"}
                        </TableCell>
                        <TableCell>{rota.km_estimado ? `${rota.km_estimado} km` : "—"}</TableCell>
                        <TableCell>
                          <Badge className={statusRotaColors[rota.status || "ativa"]}>
                            {rota.status === "ativa" ? "Ativa" : rota.status === "inativa" ? "Inativa" : "Em Manutenção"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleEditRota(rota)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setItemToDelete({ type: "rota", id: rota.id });
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <Route className="mb-4 h-12 w-12" />
                  <p>Nenhuma rota cadastrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vínculos */}
        <TabsContent value="vinculos">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Alunos por Rota
                </CardTitle>
                <CardDescription>Vincule alunos às rotas de transporte</CardDescription>
              </div>
              <Button onClick={() => setVinculoDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Vincular Aluno
              </Button>
            </CardHeader>
            <CardContent>
              {alunosRotasLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : alunosRotas && alunosRotas.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Aluno</TableHead>
                      <TableHead>Rota</TableHead>
                      <TableHead>Ponto Embarque</TableHead>
                      <TableHead>Horário</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alunosRotas.map((ar) => (
                      <TableRow key={ar.id}>
                        <TableCell className="font-medium">{ar.aluno?.nome || "—"}</TableCell>
                        <TableCell>{ar.rota?.nome || "—"}</TableCell>
                        <TableCell>{ar.ponto_embarque || "—"}</TableCell>
                        <TableCell>{ar.horario_embarque || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <MapPin className="mb-4 h-12 w-12" />
                  <p>Nenhum aluno vinculado a rotas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <RotaDialog
        open={rotaDialogOpen}
        onOpenChange={(open) => {
          setRotaDialogOpen(open);
          if (!open) refreshRotas();
        }}
        rota={selectedRota}
      />

      <VinculoAlunoRotaDialog
        open={vinculoDialogOpen}
        onOpenChange={(open) => {
          setVinculoDialogOpen(open);
          if (!open) refreshAlunosRotas();
        }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta rota?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
