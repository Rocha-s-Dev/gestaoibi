import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Scale, MessageSquare } from "lucide-react";
import { ProcessosAdministrativos } from "@/components/controladoria/ProcessosAdministrativos";
import { AnalisesContratos } from "@/components/controladoria/AnalisesContratos";
import { ConsultoriaJuridica } from "@/components/controladoria/ConsultoriaJuridica";

export default function Controladoria() {
  const [activeTab, setActiveTab] = useState("processos");

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Controladoria / Jurídico Administrativo</h1>
          <p className="text-muted-foreground">
            Processos administrativos, análise de contratos e consultoria jurídica
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="processos" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Processos Administrativos
            </TabsTrigger>
            <TabsTrigger value="contratos" className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Análise de Contratos
            </TabsTrigger>
            <TabsTrigger value="consultoria" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Consultoria Jurídica
            </TabsTrigger>
          </TabsList>

          <TabsContent value="processos">
            <ProcessosAdministrativos />
          </TabsContent>

          <TabsContent value="contratos">
            <AnalisesContratos />
          </TabsContent>

          <TabsContent value="consultoria">
            <ConsultoriaJuridica />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
