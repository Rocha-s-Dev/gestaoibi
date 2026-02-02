import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContribuintesManagement } from "@/components/tributario/ContribuintesManagement";
import { IPTUManagement } from "@/components/tributario/IPTUManagement";
import { ISSManagement } from "@/components/tributario/ISSManagement";
import { DividaAtivaManagement } from "@/components/tributario/DividaAtivaManagement";
import { ParcelamentosManagement } from "@/components/tributario/ParcelamentosManagement";
import { FiscalizacaoManagement } from "@/components/tributario/FiscalizacaoManagement";
import { usePagamentosTributarios } from "@/hooks/useArrecadacao";
import { 
  Users, 
  Home, 
  FileText, 
  AlertTriangle, 
  Calendar, 
  Search,
  DollarSign,
  TrendingUp,
  Receipt,
  Wallet
} from "lucide-react";

export default function ArrecadacaoTributaria() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { estatisticas } = usePagamentosTributarios();

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Arrecadação Tributária</h1>
          <p className="text-muted-foreground mt-2">
            Gestão completa de tributos municipais - IPTU, ISS, Dívida Ativa, Parcelamentos e Fiscalização
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="dashboard" className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="contribuintes" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Contribuintes
            </TabsTrigger>
            <TabsTrigger value="iptu" className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              IPTU
            </TabsTrigger>
            <TabsTrigger value="iss" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              ISS/NFS-e
            </TabsTrigger>
            <TabsTrigger value="divida" className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              Dívida Ativa
            </TabsTrigger>
            <TabsTrigger value="parcelamentos" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Parcelamentos
            </TabsTrigger>
            <TabsTrigger value="fiscalizacao" className="flex items-center gap-1">
              <Search className="h-4 w-4" />
              Fiscalização
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="dashboard">
              <div className="space-y-6">
                {/* Cards de Resumo */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        Arrecadado no Ano
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(estatisticas?.totalArrecadadoAno || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">Ano de {new Date().getFullYear()}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-blue-600" />
                        Arrecadado no Mês
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(estatisticas?.totalArrecadadoMes || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">Mês atual</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        Dívida Ativa
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(estatisticas?.totalDividaAtiva || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">Total inscrito</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-orange-600" />
                        IPTU em Aberto
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">
                        {formatCurrency(estatisticas?.totalIptuAberto || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">A receber</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Atalhos Rápidos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setActiveTab("iptu")}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Home className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">IPTU</h3>
                          <p className="text-sm text-muted-foreground">
                            Cadastro imobiliário, lançamentos e carnês
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setActiveTab("iss")}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                          <FileText className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">ISS Eletrônico</h3>
                          <p className="text-sm text-muted-foreground">
                            NFS-e, guias de recolhimento e contribuintes
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setActiveTab("divida")}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 rounded-lg">
                          <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Dívida Ativa</h3>
                          <p className="text-sm text-muted-foreground">
                            Inscrição, CDA e execução fiscal
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setActiveTab("parcelamentos")}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                          <Calendar className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">REFIS e Parcelamentos</h3>
                          <p className="text-sm text-muted-foreground">
                            Programas de regularização fiscal
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setActiveTab("fiscalizacao")}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-100 rounded-lg">
                          <Search className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Fiscalização</h3>
                          <p className="text-sm text-muted-foreground">
                            Ordens de serviço e fiscalização mobile
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setActiveTab("contribuintes")}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-100 rounded-lg">
                          <Users className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Contribuintes</h3>
                          <p className="text-sm text-muted-foreground">
                            Cadastro de pessoas físicas e jurídicas
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Formas de Pagamento */}
                <Card>
                  <CardHeader>
                    <CardTitle>Formas de Pagamento Disponíveis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3 p-4 border rounded-lg">
                        <div className="p-2 bg-gray-100 rounded">
                          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="4" rx="1" />
                            <rect x="3" y="10" width="18" height="4" rx="1" />
                            <rect x="3" y="16" width="18" height="4" rx="1" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium">Boleto Bancário</h4>
                          <p className="text-sm text-muted-foreground">Pague em qualquer banco</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 border rounded-lg">
                        <div className="p-2 bg-teal-100 rounded">
                          <svg className="h-6 w-6 text-teal-600" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium">PIX</h4>
                          <p className="text-sm text-muted-foreground">Pagamento instantâneo</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 border rounded-lg">
                        <div className="p-2 bg-blue-100 rounded">
                          <svg className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                            <line x1="1" y1="10" x2="23" y2="10" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium">Cartão</h4>
                          <p className="text-sm text-muted-foreground">Crédito ou débito</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="contribuintes">
              <ContribuintesManagement />
            </TabsContent>

            <TabsContent value="iptu">
              <IPTUManagement />
            </TabsContent>

            <TabsContent value="iss">
              <ISSManagement />
            </TabsContent>

            <TabsContent value="divida">
              <DividaAtivaManagement />
            </TabsContent>

            <TabsContent value="parcelamentos">
              <ParcelamentosManagement />
            </TabsContent>

            <TabsContent value="fiscalizacao">
              <FiscalizacaoManagement />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Layout>
  );
}
