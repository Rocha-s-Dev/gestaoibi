
import { useState } from "react";
import { toast } from "sonner";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, FileSearch, FilePlus, Calendar, Plus } from "lucide-react";
import { BidList } from "@/components/financeiro/compras/BidList";
import { BidDialog } from "@/components/financeiro/compras/BidDialog";
import { BidFormValues } from "@/components/financeiro/compras/BidForm";

export default function ComprasLicitacoes() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentBid, setCurrentBid] = useState<any>(null);

  const handleAddBid = (data: BidFormValues) => {
    console.log("Nova licitação:", data);
    toast.success("Licitação cadastrada com sucesso!");
    setIsAddDialogOpen(false);
  };

  const handleEditBid = (data: BidFormValues) => {
    console.log("Licitação atualizada:", data);
    toast.success("Licitação atualizada com sucesso!");
    setIsEditDialogOpen(false);
  };

  const handleOpenEditDialog = (bid: any) => {
    setCurrentBid(bid);
    setIsEditDialogOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Compras e Licitações</h1>
            <p className="text-muted-foreground mt-2">
              Gestão de processos licitatórios e compras governamentais
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Licitação
          </Button>
        </header>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Licitações Abertas
              </CardTitle>
              <FileSearch className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                3 pregões, 7 tomadas de preço, 2 concorrências
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Processos em Análise
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">28</div>
              <p className="text-xs text-muted-foreground">
                +5 novos processos na última semana
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Fornecedores Cadastrados
              </CardTitle>
              <FilePlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">183</div>
              <p className="text-xs text-muted-foreground">
                +12 novos cadastros este mês
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Próximas Licitações
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">
                Próxima em 3 dias (Pregão Eletrônico)
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Licitações em Andamento</CardTitle>
          </CardHeader>
          <CardContent>
            <BidList onEdit={handleOpenEditDialog} />
          </CardContent>
        </Card>
      </div>

      {/* Dialog for adding new bids */}
      <BidDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddBid}
      />

      {/* Dialog for editing existing bids */}
      <BidDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleEditBid}
        defaultValues={currentBid}
        isEditing
      />
    </Layout>
  );
}
