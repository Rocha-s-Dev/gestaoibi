
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContractForm } from "./ContractForm";
import { ContractList } from "./ContractList";
import { PaymentTracking } from "./PaymentTracking";

export function ContractManagement() {
  const [activeTab, setActiveTab] = useState("cadastro");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleContractAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-bold">Gestão de Contratos</h2>
        <p className="text-muted-foreground">
          Cadastre e acompanhe contratos e pagamentos relacionados
        </p>
      </div>

      <Tabs defaultValue="cadastro" onValueChange={setActiveTab}>
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="cadastro">Cadastro de Contratos</TabsTrigger>
          <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="cadastro" className="mt-4">
          <div className="grid gap-6 md:grid-cols-2">
            <ContractForm onContractAdded={handleContractAdded} />
            <ContractList refreshTrigger={refreshTrigger} />
          </div>
        </TabsContent>

        <TabsContent value="pagamentos" className="mt-4">
          <PaymentTracking />
        </TabsContent>
      </Tabs>
    </div>
  );
}
