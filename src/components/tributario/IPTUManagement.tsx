import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CadastroImobiliario } from "./iptu/CadastroImobiliario";
import { LancamentoAnual } from "./iptu/LancamentoAnual";
import { CobrancaArrecadacao } from "./iptu/CobrancaArrecadacao";
import { RevisoesIPTU } from "./iptu/RevisoesIPTU";
import { PortalCidadaoIPTU } from "./iptu/PortalCidadaoIPTU";
import { RelatoriosIPTU } from "./iptu/RelatoriosIPTU";
import { Home, FileText, CreditCard, FileSearch, Users, BarChart } from "lucide-react";

export function IPTUManagement() {
  return (
    <Tabs defaultValue="cadastro" className="space-y-4">
      <TabsList className="flex flex-wrap h-auto gap-1">
        <TabsTrigger value="cadastro" className="flex items-center gap-1">
          <Home className="h-4 w-4" />
          Cadastro Imobiliário
        </TabsTrigger>
        <TabsTrigger value="lancamento" className="flex items-center gap-1">
          <FileText className="h-4 w-4" />
          Lançamento Anual
        </TabsTrigger>
        <TabsTrigger value="cobranca" className="flex items-center gap-1">
          <CreditCard className="h-4 w-4" />
          Cobrança
        </TabsTrigger>
        <TabsTrigger value="revisoes" className="flex items-center gap-1">
          <FileSearch className="h-4 w-4" />
          Revisões
        </TabsTrigger>
        <TabsTrigger value="portal" className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          Portal Cidadão
        </TabsTrigger>
        <TabsTrigger value="relatorios" className="flex items-center gap-1">
          <BarChart className="h-4 w-4" />
          Relatórios
        </TabsTrigger>
      </TabsList>

      <TabsContent value="cadastro">
        <CadastroImobiliario />
      </TabsContent>

      <TabsContent value="lancamento">
        <LancamentoAnual />
      </TabsContent>

      <TabsContent value="cobranca">
        <CobrancaArrecadacao />
      </TabsContent>

      <TabsContent value="revisoes">
        <RevisoesIPTU />
      </TabsContent>

      <TabsContent value="portal">
        <PortalCidadaoIPTU />
      </TabsContent>

      <TabsContent value="relatorios">
        <RelatoriosIPTU />
      </TabsContent>
    </Tabs>
  );
}
