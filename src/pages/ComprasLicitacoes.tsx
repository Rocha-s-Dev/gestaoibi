
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, FileSearch, FilePlus, Calendar } from "lucide-react";

export default function ComprasLicitacoes() {
  return (
    <Layout>
      <div className="space-y-6 p-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Compras e Licitações</h1>
          <p className="text-muted-foreground mt-2">
            Gestão de processos licitatórios e compras governamentais
          </p>
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
        
        <div className="grid gap-6 md:grid-cols-1">
          <Card>
            <CardHeader>
              <CardTitle>Licitações em Andamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left">Modalidade</th>
                      <th className="px-4 py-3 text-left">Número</th>
                      <th className="px-4 py-3 text-left">Objeto</th>
                      <th className="px-4 py-3 text-left">Abertura</th>
                      <th className="px-4 py-3 text-right">Valor Est.</th>
                      <th className="px-4 py-3 text-center">Situação</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-4 py-3">Pregão Eletrônico</td>
                      <td className="px-4 py-3">045/2025</td>
                      <td className="px-4 py-3">Aquisição de materiais de escritório</td>
                      <td className="px-4 py-3">15/04/2025</td>
                      <td className="px-4 py-3 text-right">R$ 75.000,00</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                          Em andamento
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-3">Tomada de Preços</td>
                      <td className="px-4 py-3">021/2025</td>
                      <td className="px-4 py-3">Reforma da Escola Municipal João Silva</td>
                      <td className="px-4 py-3">20/04/2025</td>
                      <td className="px-4 py-3 text-right">R$ 950.000,00</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                          Documentação
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-3">Concorrência</td>
                      <td className="px-4 py-3">008/2025</td>
                      <td className="px-4 py-3">Pavimentação da Av. Principal</td>
                      <td className="px-4 py-3">05/05/2025</td>
                      <td className="px-4 py-3 text-right">R$ 2.450.000,00</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          Publicada
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-3">Pregão Eletrônico</td>
                      <td className="px-4 py-3">046/2025</td>
                      <td className="px-4 py-3">Aquisição de equipamentos de informática</td>
                      <td className="px-4 py-3">22/04/2025</td>
                      <td className="px-4 py-3 text-right">R$ 120.000,00</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                          Impugnação
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-3">Convite</td>
                      <td className="px-4 py-3">015/2025</td>
                      <td className="px-4 py-3">Serviços de manutenção predial</td>
                      <td className="px-4 py-3">12/04/2025</td>
                      <td className="px-4 py-3 text-right">R$ 45.000,00</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                          Suspensa
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
