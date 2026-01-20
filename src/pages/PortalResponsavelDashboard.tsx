import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePortalResponsavel } from "@/hooks/usePortalResponsavel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { FilhoCard } from "@/components/portal/FilhoCard";
import { NotasResponsavel } from "@/components/portal/NotasResponsavel";
import { FaltasResponsavel } from "@/components/portal/FaltasResponsavel";
import { CardapioSemana } from "@/components/portal/CardapioSemana";
import { 
  GraduationCap, 
  LogOut, 
  Users, 
  BookOpen, 
  Calendar,
  UtensilsCrossed,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

export default function PortalResponsavelDashboard() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { responsavel, filhos, isLoading } = usePortalResponsavel();
  const [selectedFilhoId, setSelectedFilhoId] = useState<string | null>(null);

  const handleLogout = async () => {
    await signOut();
    navigate("/portal-responsavel/login");
    toast.success("Logout realizado com sucesso!");
  };

  const selectedFilho = filhos.find((f) => f.id === selectedFilhoId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-20 w-full" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  if (!responsavel) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Sua conta não está vinculada a um responsável. Entre em contato com a secretaria da escola.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleLogout} className="w-full" variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-semibold">Portal do Responsável</h1>
                <p className="text-sm text-muted-foreground">
                  Olá, {responsavel.nome?.split(" ")[0]}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Filhos Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Meus Filhos</h2>
            </div>

            {filhos.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhum aluno vinculado encontrado.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filhos.map((filho) => (
                  <FilhoCard
                    key={filho.id}
                    filho={filho}
                    isSelected={selectedFilhoId === filho.id}
                    onSelect={() => setSelectedFilhoId(filho.id)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Detalhes do Filho Selecionado */}
          {selectedFilho && (
            <section>
              <Tabs defaultValue="notas" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3 h-auto">
                  <TabsTrigger value="notas" className="flex items-center gap-2 p-3">
                    <BookOpen className="h-4 w-4" />
                    <span className="hidden sm:inline">Notas</span>
                  </TabsTrigger>
                  <TabsTrigger value="faltas" className="flex items-center gap-2 p-3">
                    <Calendar className="h-4 w-4" />
                    <span className="hidden sm:inline">Frequência</span>
                  </TabsTrigger>
                  <TabsTrigger value="cardapio" className="flex items-center gap-2 p-3">
                    <UtensilsCrossed className="h-4 w-4" />
                    <span className="hidden sm:inline">Cardápio</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="notas">
                  <NotasResponsavel alunoId={selectedFilho.id} alunoNome={selectedFilho.nome} />
                </TabsContent>

                <TabsContent value="faltas">
                  <FaltasResponsavel alunoId={selectedFilho.id} alunoNome={selectedFilho.nome} />
                </TabsContent>

                <TabsContent value="cardapio">
                  <CardapioSemana escolaId={selectedFilho.escola?.id} escolaNome={selectedFilho.escola?.nome} />
                </TabsContent>
              </Tabs>
            </section>
          )}

          {!selectedFilhoId && filhos.length > 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Selecione um filho para ver as informações detalhadas.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
