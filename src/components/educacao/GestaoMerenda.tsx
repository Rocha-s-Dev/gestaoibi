import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, UtensilsCrossed, Package, AlertTriangle, Calendar, User } from "lucide-react";
import { format, isAfter, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useCardapios, useEstoqueAlimentos, useRestricoesAlimentares, Cardapio, EstoqueAlimento, RestricaoAlimentar } from "@/hooks/useMerendaEscolar";
import { CardapioDialog } from "./CardapioDialog";
import { EstoqueDialog } from "./EstoqueDialog";
import { RestricaoAlimentarDialog } from "./RestricaoAlimentarDialog";
import { toast } from "sonner";

const tiposRefeicaoLabel: Record<string, string> = {
  cafe_manha: 'Café da Manhã',
  lanche_manha: 'Lanche Manhã',
  almoco: 'Almoço',
  lanche_tarde: 'Lanche Tarde',
  jantar: 'Jantar',
};

export function GestaoMerenda() {
  const { cardapios, loading: loadingCardapios, createCardapio, updateCardapio, deleteCardapio } = useCardapios();
  const { estoque, loading: loadingEstoque, createItem, updateItem, deleteItem } = useEstoqueAlimentos();
  const { restricoes, loading: loadingRestricoes, createRestricao, updateRestricao, deleteRestricao } = useRestricoesAlimentares();

  const [cardapioDialogOpen, setCardapioDialogOpen] = useState(false);
  const [estoqueDialogOpen, setEstoqueDialogOpen] = useState(false);
  const [restricaoDialogOpen, setRestricaoDialogOpen] = useState(false);
  const [selectedCardapio, setSelectedCardapio] = useState<Cardapio | null>(null);
  const [selectedEstoque, setSelectedEstoque] = useState<EstoqueAlimento | null>(null);
  const [selectedRestricao, setSelectedRestricao] = useState<RestricaoAlimentar | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'cardapio' | 'estoque' | 'restricao'>('cardapio');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Calculate items expiring and low stock from current estoque state
  const itensVencendo = estoque.filter(item => {
    if (!item.data_validade) return false;
    const dataLimite = addDays(new Date(), 7);
    return isAfter(dataLimite, new Date(item.data_validade));
  });

  const itensEstoqueBaixo = estoque.filter(item => 
    item.estoque_minimo && item.quantidade <= item.estoque_minimo
  );

  const handleSaveCardapio = async (data: Omit<Cardapio, 'id' | 'escola'>) => {
    if (selectedCardapio) {
      await updateCardapio(selectedCardapio.id, data);
      toast.success("Cardápio atualizado com sucesso!");
    } else {
      await createCardapio(data);
      toast.success("Cardápio criado com sucesso!");
    }
  };

  const handleSaveEstoque = async (data: Omit<EstoqueAlimento, 'id' | 'escola'>) => {
    if (selectedEstoque) {
      await updateItem(selectedEstoque.id, data);
      toast.success("Item atualizado com sucesso!");
    } else {
      await createItem(data);
      toast.success("Item adicionado ao estoque!");
    }
  };

  const handleSaveRestricao = async (data: Omit<RestricaoAlimentar, 'id' | 'aluno'>) => {
    if (selectedRestricao) {
      await updateRestricao(selectedRestricao.id, data);
      toast.success("Restrição atualizada com sucesso!");
    } else {
      await createRestricao(data);
      toast.success("Restrição cadastrada com sucesso!");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      if (deleteType === 'cardapio') {
        await deleteCardapio(deleteId);
        toast.success("Cardápio excluído com sucesso!");
      } else if (deleteType === 'estoque') {
        await deleteItem(deleteId);
        toast.success("Item excluído do estoque!");
      } else {
        await deleteRestricao(deleteId);
        toast.success("Restrição excluída com sucesso!");
      }
    } finally {
      setDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  const openDeleteDialog = (type: 'cardapio' | 'estoque' | 'restricao', id: string) => {
    setDeleteType(type);
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cardápios da Semana</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cardapios.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Itens em Estoque</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estoque.length}</div>
          </CardContent>
        </Card>
        <Card className={itensVencendo.length > 0 ? "border-yellow-500" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Itens Vencendo</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${itensVencendo.length > 0 ? "text-yellow-500" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${itensVencendo.length > 0 ? "text-yellow-600" : ""}`}>
              {itensVencendo.length}
            </div>
          </CardContent>
        </Card>
        <Card className={itensEstoqueBaixo.length > 0 ? "border-red-500" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <Package className={`h-4 w-4 ${itensEstoqueBaixo.length > 0 ? "text-red-500" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${itensEstoqueBaixo.length > 0 ? "text-red-600" : ""}`}>
              {itensEstoqueBaixo.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="cardapios">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cardapios" className="flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4" />
            Cardápios
          </TabsTrigger>
          <TabsTrigger value="estoque" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Estoque
          </TabsTrigger>
          <TabsTrigger value="restricoes" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Restrições Alimentares
          </TabsTrigger>
        </TabsList>

        {/* Cardápios Tab */}
        <TabsContent value="cardapios" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Cardápios</CardTitle>
              <Button onClick={() => { setSelectedCardapio(null); setCardapioDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Cardápio
              </Button>
            </CardHeader>
            <CardContent>
              {loadingCardapios ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : cardapios.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum cardápio cadastrado
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Refeição</TableHead>
                      <TableHead>Itens</TableHead>
                      <TableHead>Calorias</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cardapios.map(cardapio => (
                      <TableRow key={cardapio.id}>
                        <TableCell>
                          {format(new Date(cardapio.data), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{tiposRefeicaoLabel[cardapio.refeicao] || cardapio.refeicao}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(cardapio.itens) && cardapio.itens.slice(0, 3).map((item, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">{item.nome}</Badge>
                            ))}
                            {Array.isArray(cardapio.itens) && cardapio.itens.length > 3 && (
                              <Badge variant="secondary" className="text-xs">+{cardapio.itens.length - 3}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{cardapio.calorias_estimadas || "-"} kcal</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedCardapio(cardapio); setCardapioDialogOpen(true); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openDeleteDialog('cardapio', cardapio.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Estoque Tab */}
        <TabsContent value="estoque" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Estoque de Alimentos</CardTitle>
              <Button onClick={() => { setSelectedEstoque(null); setEstoqueDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Item
              </Button>
            </CardHeader>
            <CardContent>
              {loadingEstoque ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : estoque.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum item no estoque
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Validade</TableHead>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {estoque.map(item => {
                      const dataLimite = addDays(new Date(), 7);
                      const isVencendo = item.data_validade && isAfter(dataLimite, new Date(item.data_validade));
                      const isEstoqueBaixo = item.estoque_minimo && item.quantidade <= item.estoque_minimo;
                      
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.item}</TableCell>
                          <TableCell>{item.quantidade} {item.unidade}</TableCell>
                          <TableCell>
                            {item.data_validade 
                              ? format(new Date(item.data_validade), "dd/MM/yyyy", { locale: ptBR })
                              : "-"}
                          </TableCell>
                          <TableCell>{item.fornecedor || "-"}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {isVencendo && <Badge variant="outline" className="border-yellow-500 text-yellow-600">Vencendo</Badge>}
                              {isEstoqueBaixo && <Badge variant="outline" className="border-red-500 text-red-600">Baixo</Badge>}
                              {!isVencendo && !isEstoqueBaixo && <Badge variant="outline" className="border-green-500 text-green-600">OK</Badge>}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => { setSelectedEstoque(item); setEstoqueDialogOpen(true); }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openDeleteDialog('estoque', item.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Restrições Tab */}
        <TabsContent value="restricoes" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Restrições Alimentares</CardTitle>
              <Button onClick={() => { setSelectedRestricao(null); setRestricaoDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Restrição
              </Button>
            </CardHeader>
            <CardContent>
              {loadingRestricoes ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : restricoes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma restrição alimentar cadastrada
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Aluno</TableHead>
                      <TableHead>Tipo de Restrição</TableHead>
                      <TableHead>Alimentos Proibidos</TableHead>
                      <TableHead>Orientações</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {restricoes.map(restricao => (
                      <TableRow key={restricao.id}>
                        <TableCell className="font-medium">
                          {restricao.aluno?.nome || restricao.aluno_id}
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive">{restricao.tipo_restricao}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(restricao.alimentos_proibidos) && restricao.alimentos_proibidos.slice(0, 2).map((alimento, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{alimento}</Badge>
                            ))}
                            {Array.isArray(restricao.alimentos_proibidos) && restricao.alimentos_proibidos.length > 2 && (
                              <Badge variant="outline" className="text-xs">+{restricao.alimentos_proibidos.length - 2}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{restricao.orientacoes_medicas || "-"}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedRestricao(restricao); setRestricaoDialogOpen(true); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openDeleteDialog('restricao', restricao.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CardapioDialog
        open={cardapioDialogOpen}
        onOpenChange={setCardapioDialogOpen}
        cardapio={selectedCardapio}
        onSave={handleSaveCardapio}
      />

      <EstoqueDialog
        open={estoqueDialogOpen}
        onOpenChange={setEstoqueDialogOpen}
        item={selectedEstoque}
        onSave={handleSaveEstoque}
      />

      <RestricaoAlimentarDialog
        open={restricaoDialogOpen}
        onOpenChange={setRestricaoDialogOpen}
        restricao={selectedRestricao}
        onSave={handleSaveRestricao}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este {deleteType === 'cardapio' ? 'cardápio' : deleteType === 'estoque' ? 'item do estoque' : 'registro de restrição'}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
